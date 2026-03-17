const mongoose = require('mongoose');
const seedData = require('./seed');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartshop';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected...');
        // Auto-seed if empty
        await seedData();
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
