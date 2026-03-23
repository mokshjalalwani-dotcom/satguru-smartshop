const mongoose = require('mongoose');
const seedData = require('./seed');
const axios = require('axios');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartshop';
const AI_SERVICE_INTERNAL = process.env.AI_SERVICE_INTERNAL_URL || 'http://localhost:10000';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB Connected...');
        
        // Auto-seed if empty
        await seedData();

        // Proactively trigger AI sync removed to prevent startup bottlenecks on Render Free Tier
        // triggerSync(5); // Launch in background without blocking DB connect
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        console.warn('Backend server will continue running, but database operations will fail until resolved.');
        // Removed process.exit(1) to prevent Render from infinitely crashing the service
    }
};

module.exports = connectDB;
