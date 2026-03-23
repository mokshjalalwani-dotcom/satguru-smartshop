const express = require('express');
const router = express.Router();
const { createSale } = require('../backend-api/controllers/salesController');

router.post('/', createSale);

module.exports = router;
