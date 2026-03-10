const dynamoDB = require('./dynamoClient');
const { v4: uuidv4 } = require('uuid');

const SALES_TABLE = 'Sales';

const recordSale = async (product_id, quantity, total_price) => {
    const sale = {
        sale_id: uuidv4(),
        product_id,
        quantity,
        total_price,
        timestamp: new Date().toISOString()
    };
    const params = { TableName: SALES_TABLE, Item: sale };
    await dynamoDB.put(params).promise();
    return sale;
};

module.exports = { recordSale };
