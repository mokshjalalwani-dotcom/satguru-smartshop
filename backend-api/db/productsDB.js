const dynamoDB = require('./dynamoClient');
const { v4: uuidv4 } = require('uuid');

const PRODUCTS_TABLE = 'Products';

const getAllProducts = async () => {
    const params = { TableName: PRODUCTS_TABLE };
    const data = await dynamoDB.scan(params).promise();
    return data.Items;
};

const addProduct = async (name, price, stock) => {
    const product = {
        product_id: uuidv4(),
        name,
        price,
        stock
    };
    const params = { TableName: PRODUCTS_TABLE, Item: product };
    await dynamoDB.put(params).promise();
    return product;
};

const updateStock = async (product_id, quantitySold) => {
    const params = {
        TableName: PRODUCTS_TABLE,
        Key: { product_id },
        UpdateExpression: 'SET stock = stock - :qty',
        ExpressionAttributeValues: { ':qty': quantitySold },
        ReturnValues: 'UPDATED_NEW'
    };
    const data = await dynamoDB.update(params).promise();
    return data.Attributes;
};

module.exports = { getAllProducts, addProduct, updateStock };
