const { getAllProducts, addProduct } = require('../db/productsDB');

const listProducts = async (req, res) => {
    try {
        const products = await getAllProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createProduct = async (req, res) => {
    const { name, price, stock } = req.body;
    if (!name || !price || !stock) return res.status(400).json({ error: 'Missing fields' });

    try {
        const product = await addProduct(name, price, stock);
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { listProducts, createProduct };
