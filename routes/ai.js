const express = require('express');
const axios = require('axios');
const router = express.Router();

const AI_INTERNAL_URL = process.env.AI_SERVICE_INTERNAL_URL || 'http://satguru-ai-service:10000';
const AI_PUBLIC_URL = process.env.AI_SERVICE_URL || 'https://satguru-ai-service.onrender.com';

const instance = axios.create({
  timeout: 30000, // Reduced timeout for faster failover
});

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 300 * 1000; // 5 minutes standard
const STALE_TTL = 3600 * 1000; // 1 hour for stale fallback

const aiRequest = async (method, path, options = {}) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const cacheKey = `${method}:${cleanPath}:${JSON.stringify(options.params || {})}`;

  // Helper to get from cache (including stale)
  const getFromCache = (key, allowStale = false) => {
    const cached = cache.get(key);
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age < CACHE_TTL || (allowStale && age < STALE_TTL)) {
      return cached.data;
    }
    return null;
  };

  // Check cache for GET requests first
  if (method.toUpperCase() === 'GET') {
    const data = getFromCache(cacheKey);
    if (data) {
      console.log(`[AI-CACHE-HIT] ${cleanPath}`);
      return { data };
    }
  }

  const performRequestWithFallback = async () => {
    // 1. Try Internal
    try {
      const internalTarget = `${AI_INTERNAL_URL}${cleanPath}`;
      console.log(`[AI-ADAPTER-TRY] Internal: ${internalTarget}`);
      return await instance({ method, url: internalTarget, ...options });
    } catch (internalError) {
      // If it's a 429, don't even try public, just return stale cache if we have it
      if (internalError.response?.status === 429) {
        const staleData = getFromCache(cacheKey, true);
        if (staleData) {
          console.warn(`[AI-GATEWAY-429] Internal Rate Limited. Returning stale data for ${cleanPath}`);
          return { data: staleData, _status: 429 };
        }
      }

      console.warn(`[AI-ADAPTER-FALLBACK] Internal failed (${internalError.code || internalError.message}). Trying Public...`);
      
      // 2. Try Public
      try {
        const publicTarget = `${AI_PUBLIC_URL}${cleanPath}`;
        return await instance({ method, url: publicTarget, ...options });
      } catch (publicError) {
        // If public also fails or is rate limited, check stale cache as absolute last resort
        const staleData = getFromCache(cacheKey, true);
        if (staleData) {
          console.error(`[AI-GATEWAY-RECOVERY] Both failed. Returning stale data for ${cleanPath}`);
          return { data: staleData, _status: 'recovery' };
        }
        
        throw new Error(`AI Gateway Error: All routes failed. Last Error: ${publicError.message}`);
      }
    }
  };

  const response = await performRequestWithFallback();

  // Update cache on success (not on recovery data)
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
