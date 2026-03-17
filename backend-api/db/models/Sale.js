const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
    sale_id: { type: String, required: true, unique: true },
    product_id: { type: String, required: true },
    quantity: { type: Number, required: true },
    total_price: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Sale', SaleSchema);
