const mongoose = require('mongoose');
const Product = require('./models/Product');
const Sale = require('./models/Sale');
const { v4: uuidv4 } = require('uuid');

const seedData = async () => {
    try {
        const productCount = await Product.countDocuments();
        if (productCount > 0) {
            console.log('Database already has data. Skipping seed.');
            return;
        }

        console.log('Seeding "WOW" data for Satguru Smartshop...');

        const categories = ['Electronics', 'Home Appliances', 'Kitchenware', 'Personal Care', 'Security'];
        const products = [
            { name: 'Smart LED TV 55"', price: 45000, category: 'Electronics', stock: 15 },
            { name: 'Washing Machine 7Kg', price: 28000, category: 'Home Appliances', stock: 12 },
            { name: 'Microwave Oven', price: 12000, category: 'Kitchenware', stock: 25 },
            { name: 'Air Purifier Pro', price: 18000, category: 'Home Appliances', stock: 8 },
            { name: 'Bluetooth Soundbar', price: 8500, category: 'Electronics', stock: 30 },
            { name: 'Water Purifier RO', price: 15500, category: 'Kitchenware', stock: 10 },
            { name: 'Electric Kettle 1.5L', price: 1800, category: 'Kitchenware', stock: 50 },
            { name: 'Vacuum Cleaner', price: 9500, category: 'Home Appliances', stock: 20 },
            { name: 'CCTV Security Camera', price: 3500, category: 'Security', stock: 45 },
            { name: 'Personal Grooming Kit', price: 2500, category: 'Personal Care', stock: 60 }
        ];

        const savedProducts = [];
        for (const p of products) {
            const product = new Product({
                product_id: `PROD-${uuidv4().slice(0, 8).toUpperCase()}`,
                ...p
            });
            savedProducts.push(await product.save());
        }

        console.log(`Created ${savedProducts.length} premium products.`);

        // Generate 500 sales over the last 90 days
        const sales = [];
        const now = new Date();
        for (let i = 0; i < 500; i++) {
            const randomProduct = savedProducts[Math.floor(Math.random() * savedProducts.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            const daysAgo = Math.floor(Math.random() * 90);
            const date = new Date(now);
            date.setDate(date.getDate() - daysAgo);

            sales.push({
                sale_id: `SALE-${uuidv4().slice(0, 8).toUpperCase()}`,
                product_id: randomProduct.product_id,
                quantity: quantity,
                total_price: randomProduct.price * quantity,
                timestamp: date
            });
        }

        await Sale.insertMany(sales);
        console.log(`Successfully seeded ${sales.length} historical sales records.`);
        console.log('Seeding complete. Dashboard will now show live insights! 🚀');

    } catch (err) {
        console.error('Seeding failed:', err.message);
    }
};

module.exports = seedData;
