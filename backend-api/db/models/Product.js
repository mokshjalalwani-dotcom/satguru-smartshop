const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    product_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, default: 'General' }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
