const mongoose = require('mongoose');
const Product = require('./models/Product');
const Sale = require('./models/Sale');
const { v4: uuidv4 } = require('uuid');

const seedData = async () => {
    try {
        const productCount = await Product.countDocuments();
        
        // If we have some products but VERY few, or zero, let's force a fresh seed
        if (productCount > 5) {
            console.log(`Database already has ${productCount} products. Skipping seed.`);
            return;
        }

        console.log('Clearing old data and seeding GENUINE "WOW" data for Satguru Smartshop...');
        await Product.deleteMany({});
        await Sale.deleteMany({});

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
            { name: 'Personal Grooming Kit', price: 2500, category: 'Personal Care', stock: 60 },
            { name: 'Smart Fridge 400L', price: 75000, category: 'Home Appliances', stock: 5 },
            { name: 'Coffee Maker Elite', price: 5500, category: 'Kitchenware', stock: 15 },
            { name: 'Wireless Headphones', price: 4200, category: 'Electronics', stock: 40 },
            { name: 'Steam Iron Pro', price: 3200, category: 'Home Appliances', stock: 35 },
            { name: 'Digital Wall Clock', price: 1500, category: 'Electronics', stock: 100 }
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

        // Generate 1000 sales over the last 180 days for "genuine" trends
        const sales = [];
        const now = new Date();
        for (let i = 0; i < 1000; i++) {
            const randomProduct = savedProducts[Math.floor(Math.random() * savedProducts.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            const daysAgo = Math.floor(Math.random() * 180);
            const date = new Date(now);
            date.setDate(date.getDate() - daysAgo);
            // Randomize hours and minutes for better flow
            date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

            sales.push({
                sale_id: `SALE-${uuidv4().slice(0, 8).toUpperCase()}`,
                product_id: randomProduct.product_id,
                quantity: quantity,
                total_price: randomProduct.price * quantity,
                timestamp: date
            });
        }

        await Sale.insertMany(sales);
        console.log(`Successfully seeded ${sales.length} genuine historical sales records.`);
        console.log('Seeding complete. Syncing AI service now... 🚀');

    } catch (err) {
        console.error('Seeding failed:', err.message);
    }
};

module.exports = seedData;
