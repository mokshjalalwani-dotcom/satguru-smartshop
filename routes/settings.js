const express = require('express');
const router = express.Router();
const Setting = require('../backend-api/db/models/Setting');

// GET settings (supports filtering by key ?key=upi_id)
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.query.key) query.key = req.query.key;
    
    const settings = await Setting.find(query);
    
    // If a specific key is requested, just return its value directly
    if (req.query.key && settings.length > 0) {
      return res.json({ value: settings[0].value });
    }
    
    return res.json(settings);
  } catch (error) {
    console.error("GET /settings error:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// POST to insert or update a setting
router.post('/', async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: "Missing setting key" });

    const updated = await Setting.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (error) {
    console.error("POST /settings error:", error);
    res.status(500).json({ error: "Failed to update setting" });
  }
});

module.exports = router;
