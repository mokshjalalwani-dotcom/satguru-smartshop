const express = require('express');
const axios = require('axios');
const router = express.Router();

// Helper to sanitize and validate base URLs
const sanitizeBaseUrl = (url, defaultVal) => {
  if (!url || typeof url !== 'string' || url.trim() === '') return defaultVal;
  let sanitized = url.trim().replace(/\/+$/, '');
  
  // If it already has a protocol, leave it alone
  if (/^https?:\/\//i.test(sanitized)) {
    return sanitized;
  }
  
  // If it looks like an internal Render hostname (no dots, or ends with :port), use http
  // Otherwise default to https for public URLs
  if (!sanitized.includes('.') || /:\d+$/.test(sanitized)) {
    return `http://${sanitized}`;
  }
  
  return `https://${sanitized}`;
};

const AI_INTERNAL_URL = sanitizeBaseUrl(process.env.AI_SERVICE_INTERNAL_URL, 'http://satguru-ai-service:10000');
const AI_PUBLIC_URL = sanitizeBaseUrl(process.env.AI_SERVICE_URL, 'https://satguru-ai-service.onrender.com');

const instance = axios.create({
  timeout: 45000, // Slightly increased timeout
});

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 300 * 1000;
const STALE_TTL = 3600 * 1000;

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

  // Attempt 1: Internal
  try {
    const target = `${AI_INTERNAL_URL}${cleanPath}`;
    attempts.push(`Internal (${target})`);
    console.log(`[AI-TRY] ${attempts[attempts.length-1]}`);
    response = await instance({ method, baseURL: AI_INTERNAL_URL, url: cleanPath, ...options });
  } catch (err) {
    lastError = err;
    if (err.response?.status === 429) {
      const stale = getFromCache(cacheKey, true);
      if (stale) return { data: stale, _status: 429 };
    }
  }

  // Attempt 2: Public
  if (!response) {
    try {
      const target = `${AI_PUBLIC_URL}${cleanPath}`;
      attempts.push(`Public (${target})`);
      console.log(`[AI-TRY] ${attempts[attempts.length-1]}`);
      response = await instance({ method, baseURL: AI_PUBLIC_URL, url: cleanPath, ...options });
    } catch (err) {
      lastError = err;
      console.error(`[AI-FAIL] Public failure: ${err.message}`);
    }
  }

  // Final Recovery
  if (!response) {
    const stale = getFromCache(cacheKey, true);
    if (stale) return { data: stale, _status: 'recovery' };

    const detail = lastError?.message || 'Unknown network error';
    const trace = attempts.join(' -> ');
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
