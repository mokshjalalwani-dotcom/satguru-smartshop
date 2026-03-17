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

        // Proactively trigger AI sync so the CSVs are ready immediately
        try {
            console.log('Triggering AI service data sync...');
            await axios.post(`${AI_SERVICE_INTERNAL}/sync`, {}, { timeout: 10000 });
            console.log('AI Sync triggered successfully.');
        } catch (syncErr) {
            console.warn('AI Sync trigger failed (Service might still be starting up):', syncErr.message);
        }
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
