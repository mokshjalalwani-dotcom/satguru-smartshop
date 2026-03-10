const express = require('express');
const axios = require('axios');
const router = express.Router();

const AI_SERVICE_URL = 'http://localhost:8000';

// GET /api/ai/predict
router.get('/predict', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/predict`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Service unavailable', details: error.message });
  }
});

// GET /api/ai/demand
router.get('/demand', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/demand`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Service unavailable', details: error.message });
  }
});

// GET /api/ai/anomalies
router.get('/anomalies', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/anomalies`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Service unavailable', details: error.message });
  }
});

// POST /api/ai/train
router.post('/train', async (req, res) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/train`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Service unavailable', details: error.message });
  }
});

// GET /api/ai/stats
router.get('/stats', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/stats`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Service unavailable', details: error.message });
  }
});

// GET /api/ai/insights
router.get('/insights', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/insights`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Service unavailable', details: error.message });
  }
});

// GET /api/ai/transactions
router.get('/transactions', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/transactions`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Service unavailable', details: error.message });
  }
});

// GET /api/ai/history
router.get('/history', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/history`, { params: req.query });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Service unavailable', details: error.message });
  }
});

module.exports = router;
