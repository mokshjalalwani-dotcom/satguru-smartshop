const { recordSale } = require('../db/salesDB');
const { updateStock } = require('../db/productsDB');
const { generateInvoice } = require('../utils/generateInvoice');
const { uploadFile } = require('../utils/s3Upload');

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

        // Upload to S3
        const s3Key = `invoices/invoice_${sale.sale_id}.pdf`;
        const uploadResult = await uploadFile(invoicePath, s3Key);

        res.json({ message: 'Sale recorded', sale, invoiceUrl: uploadResult.Location });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createSale };
