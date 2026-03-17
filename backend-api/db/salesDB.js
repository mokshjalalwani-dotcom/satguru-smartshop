const Sale = require('./models/Sale');
const { v4: uuidv4 } = require('uuid');

const recordSale = async (product_id, quantity, total_price) => {
    const sale = new Sale({
        sale_id: uuidv4(),
        product_id,
        quantity,
        total_price,
        timestamp: new Date()
    });
    await sale.save();
    return sale;
};

module.exports = { recordSale };
