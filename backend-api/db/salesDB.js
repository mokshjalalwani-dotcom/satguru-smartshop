const Sale = require('./models/Sale');
const { v4: uuidv4 } = require('uuid');

/**
 * Record a full multi-item sale to MongoDB.
 * @param {Object} payload
 * @param {string}   payload.customer
 * @param {Array}    payload.items  - [{ product_id, product_name, quantity, unit_price, line_total }]
 * @param {number}   payload.subtotal
 * @param {number}   payload.gst_amount
 * @param {number}   payload.total_price
 * @param {string}   payload.payment_method
 */
const recordSale = async (payload) => {
    const sale = new Sale({
        sale_id:        `INV-${Date.now()}`,
        customer:       payload.customer || 'Walk-in Customer',
        items:          payload.items,
        subtotal:       payload.subtotal,
        gst_rate:       18,
        gst_amount:     payload.gst_amount,
        total_price:    payload.total_price,
        payment_method: payload.payment_method || 'Cash',
        timestamp:      new Date(),
    });
    await sale.save();
    return sale;
};

/**
 * Return last N sales (for analytics).
 */
const getRecentSales = async (limit = 50) => {
    return await Sale.find({}).sort({ timestamp: -1 }).limit(limit);
};

/**
 * Find a single sale by its sale_id.
 */
const getSaleById = async (saleId) => {
    return await Sale.findOne({ sale_id: saleId });
};

module.exports = { recordSale, getRecentSales, getSaleById };
