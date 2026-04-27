const express = require('express');
const router = express.Router();
const { listProducts, createProduct, restockProduct } = require('../backend-api/controllers/productsController');

router.get('/', listProducts);
router.post('/', createProduct);
router.post('/:product_id/restock', restockProduct);

module.exports = router;
