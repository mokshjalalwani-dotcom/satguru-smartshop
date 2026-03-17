const { recordSale } = require('../db/salesDB');
const { updateStock } = require('../db/productsDB');
const { generateInvoice } = require('../utils/generateInvoice');
const createSale = async (req, res) => {
    const { product_id, quantity, product_name, price } = req.body;

    if (!product_id || !quantity || !product_name || !price)
        return res.status(400).json({ error: 'Missing fields' });

    try {
        // Update stock
        await updateStock(product_id, quantity);

        // Record sale
        const sale = await recordSale(product_id, quantity, price * quantity);

        // Generate invoice PDF
        const invoicePath = generateInvoice(sale, product_name);

        // No more S3 upload. Return local path or just confirmation.
        res.json({ 
            message: 'Sale recorded', 
            sale, 
            invoiceLocalPath: invoicePath 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createSale };
