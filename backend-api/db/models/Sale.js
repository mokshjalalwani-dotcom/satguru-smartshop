const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema({
    product_id:   { type: String, required: true },
    product_name: { type: String, required: true },
    quantity:     { type: Number, required: true },
    unit_price:   { type: Number, required: true },
    line_total:   { type: Number, required: true },
}, { _id: false });

const SaleSchema = new mongoose.Schema({
    sale_id:     { type: String, required: true, unique: true },
    customer:    { type: String, default: 'Walk-in Customer' },
    items:       { type: [SaleItemSchema], required: true },
    subtotal:    { type: Number, required: true },
    gst_rate:    { type: Number, default: 18 },
    gst_amount:  { type: Number, required: true },
    total_price: { type: Number, required: true },
    payment_method: { type: String, default: 'Cash' },
    timestamp:   { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Sale', SaleSchema);
