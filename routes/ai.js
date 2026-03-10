const express = require('express');
const axios = require('axios');
const router = express.Router();

let AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
if (AI_SERVICE_URL && !AI_SERVICE_URL.startsWith('http')) {
  AI_SERVICE_URL = `http://${AI_SERVICE_URL}`;
}

console.log(`AI Route using AI_SERVICE_URL: ${AI_SERVICE_URL}`);

const instance = axios.create({
  timeout: 15000, // 15 seconds to allow for service wake-up on Free plan
});

// Helper to get sanitized URL
const getUrl = (path) => {
  const base = AI_SERVICE_URL.endsWith('/') ? AI_SERVICE_URL.slice(0, -1) : AI_SERVICE_URL;
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

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

module.exports = router;
