const express = require('express');
const router = express.Router();
const { createSale, getInvoice, listSales } = require('../backend-api/controllers/salesController');

router.get('/', listSales);
router.post('/', createSale);
router.get('/invoice/:saleId', getInvoice);

module.exports = router;
