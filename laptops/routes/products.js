const express = require('express');
const router = express.Router();
const { listProducts, createProduct } = require('../backend-api/controllers/productsController');

router.get('/', listProducts);
router.post('/', createProduct);

module.exports = router;
