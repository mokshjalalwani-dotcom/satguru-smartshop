const express = require('express');
const router = express.Router();
const { createSale } = require('../controllers/salesController');

router.post('/', createSale);

module.exports = router;
