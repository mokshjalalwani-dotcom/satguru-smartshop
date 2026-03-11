const express = require('express');
const axios = require('axios');
const router = express.Router();

const AI_INTERNAL_URL = 'http://satguru-ai-service:10000';
const AI_PUBLIC_URL = 'https://satguru-ai-service.onrender.com';

const instance = axios.create({
  timeout: 60000,
});

const aiRequest = async (method, path, options = {}) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Try Internal first
  try {
    const internalTarget = `${AI_INTERNAL_URL}${cleanPath}`;
    console.log(`[AI-ADAPTER-TRY] Internal: ${internalTarget}`);
    return await instance({ method, url: internalTarget, ...options });
  } catch (internalError) {
    if (internalError.code === 'ENOTFOUND' || internalError.code === 'ECONNREFUSED' || internalError.code === 'ETIMEDOUT') {
      console.warn(`[AI-ADAPTER-FALLBACK] Internal failed (${internalError.code}). Trying Public...`);
      const publicTarget = `${AI_PUBLIC_URL}${cleanPath}`;
      try {
        return await instance({ method, url: publicTarget, ...options });
      } catch (publicError) {
        throw new Error(`AI Gateway Error: Internal & Public both failed. Last Error: ${publicError.message} (Target: ${publicTarget})`);
      }
    }
    throw internalError;
  }
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
