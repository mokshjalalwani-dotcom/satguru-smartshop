const { recordSale, getRecentSales, getSaleById } = require('../db/salesDB');
const { updateStock } = require('../db/productsDB');
const { generateInvoice } = require('../utils/generateInvoice');

/**
 * POST /api/sales
 * Accepts a multi-item cart checkout payload:
 * {
 *   customer: string,
 *   payment_method: string,
 *   items: [{ product_id, product_name, quantity, unit_price, line_total }],
 *   subtotal: number,
 *   gst_amount: number,
 *   total_price: number
 * }
 *
 * Also supports legacy single-item payload for backwards compatibility:
 * { product_id, product_name, quantity, price, amount, customer }
 */
const createSale = async (req, res) => {
    try {
        let { customer, payment_method, items, subtotal, gst_amount, total_price } = req.body;

        // ── Backwards-compat: single-item payload ──────────────────
        if (!items || !Array.isArray(items) || items.length === 0) {
            const { product_id, product_name, quantity, price, amount } = req.body;
            if (!product_id || !product_name) {
                return res.status(400).json({ error: 'Missing required fields: items[] or product_id+product_name' });
            }
            const qty      = parseInt(quantity) || 1;
            const unitPrice = parseFloat(price) || 0;
            const lineTotal = parseFloat(amount) || unitPrice * qty;
            subtotal    = lineTotal;
            gst_amount  = parseFloat((subtotal * 0.18).toFixed(2));
            total_price = parseFloat((subtotal + gst_amount).toFixed(2));
            items = [{ product_id, product_name, quantity: qty, unit_price: unitPrice, line_total: lineTotal }];
        }

        // ── Validation ─────────────────────────────────────────────
        for (const item of items) {
            if (!item.product_id || !item.product_name || !item.quantity) {
                return res.status(400).json({ error: `Invalid item: ${JSON.stringify(item)}` });
            }
        }

        // ── Deduct stock for each item ─────────────────────────────
        for (const item of items) {
            try {
                await updateStock(item.product_id, item.quantity);
            } catch (stockErr) {
                console.warn(`[SALE] Stock update failed for ${item.product_id}:`, stockErr.message);
            }
        }

        // ── Record sale in MongoDB ─────────────────────────────────
        const sale = await recordSale({
            customer:       customer || 'Walk-in Customer',
            items,
            subtotal:       parseFloat(subtotal) || 0,
            gst_amount:     parseFloat(gst_amount) || 0,
            total_price:    parseFloat(total_price) || 0,
            payment_method: payment_method || 'Cash',
        });

        // ── Generate PDF invoice (async, non-blocking) ─────────────
        let invoicePath = null;
        try {
            invoicePath = await generateInvoice(sale);
            console.log(`[SALE] Invoice generated: ${invoicePath}`);
        } catch (pdfErr) {
            console.warn('[SALE] PDF generation failed (non-fatal):', pdfErr.message);
        }

        res.json({
            message:    'Sale recorded successfully',
            sale_id:    sale.sale_id,
            invoiceUrl: `/api/sales/invoice/${sale.sale_id}`,
            sale,
        });

    } catch (err) {
        console.error('[SALE] createSale error:', err.message);
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/sales/invoice/:saleId
 * Serves the PDF invoice file for download.
 */
const getInvoice = async (req, res) => {
    const path = require('path');
    const fs   = require('fs');
    const { saleId } = req.params;

    // If PDF already on disk, serve it immediately
    const pdfPath = path.join(__dirname, '../../invoices', `invoice_${saleId}.pdf`);
    if (fs.existsSync(pdfPath)) {
        return res.download(pdfPath, `invoice_${saleId}.pdf`);
    }

    // Try to regenerate from DB
    try {
        const sale = await getSaleById(saleId);
        if (!sale) return res.status(404).json({ error: 'Sale not found' });
        const generatedPath = await generateInvoice(sale);
        return res.download(generatedPath, `invoice_${saleId}.pdf`);
    } catch (err) {
        console.error('[INVOICE] Serve error:', err.message);
        res.status(500).json({ error: 'Failed to generate invoice' });
    }
};

/**
 * GET /api/sales
 * Returns recent sales list.
 */
const listSales = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const sales = await getRecentSales(limit);
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { createSale, getInvoice, listSales };
