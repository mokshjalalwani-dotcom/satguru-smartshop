const express = require('express');
const axios = require('axios');
const router = express.Router();

// Helper to sanitize and validate base URLs
const sanitizeBaseUrl = (url, type = 'public') => {
  const isProd = process.env.NODE_ENV === 'production';
  const defaultInternal = isProd ? 'http://satguru-ai-service:10000' : 'http://127.0.0.1:10000';
  const defaultPublic = 'https://satguru-ai-service.onrender.com';
  
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return type === 'internal' ? defaultInternal : defaultPublic;
  }

  let sanitized = url.trim().replace(/\/+$/, '');
  
  // 1. Handle localhost/local dev
  if (sanitized.includes('localhost') || sanitized.includes('127.0.0.1')) {
    if (!sanitized.startsWith('http')) sanitized = `http://${sanitized}`;
    return sanitized;
  }

  // 2. Fix partial Render URLs (e.g. "satguru-ai-service" -> "satguru-ai-service.onrender.com")
  if (type === 'public' && sanitized.startsWith('satguru-') && !sanitized.includes('.')) {
    sanitized = `${sanitized}.onrender.com`;
  }

  // 3. Ensure Protocol
  if (!/^https?:\/\//i.test(sanitized)) {
    // Internal Render hostnames use http, public usually https
    const isInternal = !sanitized.includes('.') || sanitized.includes('onrender.com') === false;
    sanitized = isInternal ? `http://${sanitized}` : `https://${sanitized}`;
  }
  
  return sanitized;
};

const AI_INTERNAL_URL = sanitizeBaseUrl(process.env.AI_SERVICE_INTERNAL_URL, 'internal');
const AI_PUBLIC_URL = sanitizeBaseUrl(process.env.AI_SERVICE_URL, 'public');

const instance = axios.create({
  timeout: 45000, // Increased to 45s to handle Render Free Tier "Cold Starts" which can take ~40s
});

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes caching
const STALE_TTL = 30 * 60 * 1000; // 30 minutes stale

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const SAFE_FALLBACKS = {
  '/stats': {
    revenue: 0, orders: 0, aov: 0, active_customers: 0, 
    low_stock_count: 0, profit: 0,
    revenue_change: "+0.0%", profit_change: "+0.0%", 
    orders_change: "+0.0%", customers_change: "+0.0%",
    _isFallback: true
  },
  '/history': [],
  '/transactions': [],
  '/product-stats': [],
  '/inventory': [],
  '/demand': { demand: {}, _isFallback: true },
  '/insights': {
    forecasting: "AI Service is warming up...",
    demand: "Analyzing inventory data...",
    anomalies: "Scanning for market variances...",
    bi: "Processing business intelligence...",
    kpi_trends: "Calculating historical trends...",
    _isFallback: true
  },
  '/predict': {
    predictions: [],
    confidence_interval: { lower: 0, upper: 0 },
    predicted_total: 0,
    trend_percent_change: 0,
    metrics: { mae: 0, rmse: 0 },
    _isFallback: true
  },
  '/anomalies': { anomalies: [], _isFallback: true }
};

const aiRequest = async (method, path, options = {}) => {
  const cacheKey = `${method}:${path}:${JSON.stringify(options.params || {})}`;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  const getFromCache = (key, allowStale = false) => {
    const cached = cache.get(key);
    if (!cached) return null;
    const age = Date.now() - cached.timestamp;
    return (age < CACHE_TTL || (allowStale && age < STALE_TTL)) ? cached.data : null;
  };

  if (method.toUpperCase() === 'GET') {
    const data = getFromCache(cacheKey);
    if (data) return { data };
  }

  let lastError = null;
  let response = null;
  
  // Try Internal and then Public with Retries
  const targets = [
    { name: 'Internal', url: AI_INTERNAL_URL },
    { name: 'Public', url: AI_PUBLIC_URL }
  ];

  for (const target of targets) {
    let retries = target.name === 'Internal' ? 2 : 1; 
    let delay = 2000; 

    for (let i = 0; i < retries; i++) {
      try {
        console.log(`[AI-PROXY] ${target.name} ${method} ${cleanPath} (Try ${i+1})`);
        response = await instance({ 
          method, 
          baseURL: target.url, 
          url: cleanPath, 
          ...options 
        });
        if (response) break;
      } catch (err) {
        lastError = err;
        const status = err.response?.status;
        const isNetworkError = !err.response || err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET';
        
        if ((status === 429 || status === 502 || status === 503 || status === 504 || isNetworkError) && i < retries - 1) {
          await sleep(delay);
          delay *= 1.5;
          continue;
        }
        break; 
      }
    }
    if (response) break;
  }

  if (!response) {
    const stale = getFromCache(cacheKey, true);
    if (stale) return { data: stale, _fallback: 'stale' };

    // PERMANENT FIX: Never throw 500. Return safe defaults if service is down/warming.
    const fallback = SAFE_FALLBACKS[cleanPath] || (cleanPath.startsWith('/stats') ? SAFE_FALLBACKS['/stats'] : {});
    console.warn(`[AI-RECOVERY] Serving safe fallback for ${cleanPath}`);
    return { data: fallback, _fallback: 'static' };
  }

  if (method.toUpperCase() === 'GET') {
    cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
  }

  return response;
};

router.get('/health', async (req, res) => {
  try {
    const response = await aiRequest('GET', '/health');
    res.json({ status: 'ok', backend: response.data });
  } catch (error) {
    res.status(500).json({ status: 'error', details: error.message });
  }
});

router.get('/predict', async (req, res) => {
  try {
    const response = await aiRequest('GET', '/predict');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Predict Failed', details: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const response = await aiRequest('GET', '/stats', { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Stats Failed', details: error.message });
  }
});

router.get('/insights', async (req, res) => {
  try {
    const response = await aiRequest('GET', '/insights');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Insights Failed', details: error.message });
  }
});

router.get('/inventory', async (req, res) => {
  try {
    const response = await aiRequest('GET', '/inventory');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Inventory Failed', details: error.message });
  }
});

router.get('/transactions', async (req, res) => {
  try {
    const response = await aiRequest('GET', '/transactions', { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Transactions Failed', details: error.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const response = await aiRequest('GET', '/history', { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI History Failed', details: error.message });
  }
});

router.get('/product-stats', async (req, res) => {
  try {
    const response = await aiRequest('GET', '/product-stats', { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Product Stats Failed', details: error.message });
  }
});

router.post('/train', async (req, res) => {
  try {
    const response = await aiRequest('POST', '/train');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Training Failed', details: error.message });
  }
});

module.exports = router;
