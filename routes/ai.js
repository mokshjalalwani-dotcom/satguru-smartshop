const express = require('express');
const axios = require('axios');
const router = express.Router();

// Helper to sanitize and validate base URLs
const sanitizeBaseUrl = (url, type = 'public') => {
  const defaultInternal = 'http://satguru-ai-service:10000';
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
  timeout: 60000, // 60 seconds for cold starts
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
  let attempts = [];
  
  // Try Internal and then Public with Retries
  const targets = [
    { name: 'Internal', url: AI_INTERNAL_URL },
    { name: 'Public', url: AI_PUBLIC_URL }
  ];

  for (const target of targets) {
    let retries = 3;
    let delay = 2000;

    for (let i = 0; i < retries; i++) {
      try {
        const fullUrl = `${target.url}${cleanPath}`;
        attempts.push(`${target.name} [Try ${i+1}]`);
        console.log(`[AI-TRY] ${target.name} attempt ${i+1}: ${fullUrl}`);
        
        response = await instance({ 
          method, 
          baseURL: target.url, 
          url: cleanPath, 
          ...options 
        });
        
        if (response) break; // Success!
      } catch (err) {
        lastError = err;
        const status = err.response?.status;
        
        // If it's a 429 or 503, wait and retry
        if ((status === 429 || status === 503) && i < retries - 1) {
          console.warn(`[AI-RETRY] Received ${status}, retrying in ${delay}ms...`);
          await sleep(delay);
          delay *= 2; // Exponential backoff
          continue;
        }
        
        // If it's any other error, or we're out of retries for this target, move to next target
        console.error(`[AI-FAIL] ${target.name} failed: ${err.message}`);
        break; 
      }
    }
    if (response) break;
  }

  // Final Recovery Flow
  if (!response) {
    const stale = getFromCache(cacheKey, true);
    if (stale) return { data: stale, _status: 'recovery' };

    const detail = lastError?.message || 'AI Service is currently warming up';
    const trace = attempts.join(' -> ');
    
    // Structured error for frontend to show a "Warming Up" message instead of a crash
    throw new Error(`AI Gateway Error: ${detail} (Path: ${cleanPath}, Trace: ${trace})`);
  }

  if (method.toUpperCase() === 'GET' && !response._status) {
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
