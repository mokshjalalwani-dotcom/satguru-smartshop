const express = require('express');
const axios = require('axios');
const router = express.Router();

let AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Render Internal/External URL handling
if (AI_SERVICE_URL && !AI_SERVICE_URL.startsWith('http')) {
  // If it's a raw hostname like 'satguru-ai-service', default to port 10000 (Render's internal port)
  if (!AI_SERVICE_URL.includes('.')) {
    AI_SERVICE_URL = `http://${AI_SERVICE_URL}:10000`;
  } else {
    // If it's something like 'my-service.render.com'
    AI_SERVICE_URL = `http://${AI_SERVICE_URL}`;
  }
}

console.log(`[AI-ADAPTER] Verified Target: ${AI_SERVICE_URL}`);

console.log(`AI Route using AI_SERVICE_URL: ${AI_SERVICE_URL}`);

const instance = axios.create({
  timeout: 60000, // 60 seconds to allow for service wake-up on Free plan
});


// Helper to get sanitized URL
const getUrl = (path) => {
  let base = AI_SERVICE_URL;
  if (base.endsWith('/')) base = base.slice(0, -1);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

// GET /api/ai/health - Diagnostics endpoint
router.get('/health', async (req, res) => {
  const target = getUrl('/health');
  try {
    const start = Date.now();
    const response = await instance.get(target);
    res.json({ 
      status: 'ok', 
      message: 'Connection successful',
      target: target,
      latency: `${Date.now() - start}ms`,
      backend: response.data
    });
  } catch (error) {
    console.error(`[AI-HEALTH-ERROR] Connection to ${target} failed:`, error.message);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to connect to AI Service',
      target: target,
      config_url: AI_SERVICE_URL,
      error: error.message,
      code: error.code
    });
  }
});

// GET /api/ai/debug - Full diagnostic info
router.get('/debug', (req, res) => {
    res.json({
        env_url: process.env.AI_SERVICE_URL,
        calculated_url: AI_SERVICE_URL,
        node_env: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// GET /api/ai/predict
router.get('/predict', async (req, res) => {
  try {
    const response = await instance.get(getUrl('/predict'));
    res.json(response.data);
  } catch (error) {
    console.error(`AI Predict Error: ${error.message}`);
    res.status(500).json({ error: 'AI Service unavailable', details: error.message });
  }
});

// GET /api/ai/demand
router.get('/demand', async (req, res) => {
  try {
    const response = await instance.get(getUrl('/demand'));
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Service unavailable', details: error.message });
  }
});

// GET /api/ai/anomalies
router.get('/anomalies', async (req, res) => {
  try {
    const response = await instance.get(getUrl('/anomalies'));
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Service unavailable', details: error.message });
  }
});

// POST /api/ai/train
router.post('/train', async (req, res) => {
  try {
    const response = await instance.post(getUrl('/train'));
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Service unavailable', details: error.message });
  }
});

// GET /api/ai/stats
router.get('/stats', async (req, res) => {
  try {
    const response = await instance.get(getUrl('/stats'), { params: req.query });
    res.json(response.data);
  } catch (error) {
    console.error(`AI Stats Fetch Failed from ${getUrl('/stats')}:`, error.message);
    res.status(500).json({ error: 'AI Service unavailable', details: error.message });
  }
});

// GET /api/ai/insights
router.get('/insights', async (req, res) => {
  try {
    const response = await instance.get(getUrl('/insights'));
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Service unavailable', details: error.message });
  }
});

// GET /api/ai/transactions
router.get('/transactions', async (req, res) => {
  try {
    const response = await instance.get(getUrl('/transactions'), { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Service unavailable', details: error.message });
  }
});

// GET /api/ai/history
router.get('/history', async (req, res) => {
  try {
    const response = await instance.get(getUrl('/history'), { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Service unavailable', details: error.message });
  }
});

// GET /api/ai/product-stats
router.get('/product-stats', async (req, res) => {
  try {
    const response = await instance.get(getUrl('/product-stats'), { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Service unavailable', details: error.message });
  }
});

// GET /api/ai/inventory
router.get('/inventory', async (req, res) => {
  try {
    const response = await instance.get(getUrl('/inventory'));
    res.json(response.data);
  } catch (error) {
    console.error(`AI Inventory Error: ${error.message}`);
    res.status(500).json({ error: 'AI Service unavailable', details: error.message });
  }
});

module.exports = router;
