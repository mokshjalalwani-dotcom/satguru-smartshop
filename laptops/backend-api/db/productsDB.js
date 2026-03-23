const Product = require('./models/Product');
const { v4: uuidv4 } = require('uuid');

const getAllProducts = async () => {
    return await Product.find({});
};

const addProduct = async (name, price, stock) => {
    const product = new Product({
        product_id: uuidv4(),
        name,
        price,
        stock
    });
    await product.save();
    return product;
};

const updateStock = async (product_id, quantitySold) => {
    return await Product.findOneAndUpdate(
        { product_id },
        { $inc: { stock: -quantitySold } },
        { new: true }
    );
};

module.exports = { getAllProducts, addProduct, updateStock };
