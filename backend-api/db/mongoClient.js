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

        // Proactively trigger AI sync with background retries so the CSVs are ready
        const triggerSync = async (retries = 5) => {
            for (let i = 0; i < retries; i++) {
                try {
                    console.log(`Triggering AI service data sync (Attempt ${i + 1})...`);
                    await axios.post(`${AI_SERVICE_INTERNAL}/sync`, {}, { timeout: 15000 });
                    console.log('AI Sync triggered successfully.');
                    return;
                } catch (syncErr) {
                    console.warn(`AI Sync trigger failed: ${syncErr.message}. Retrying in 10s...`);
                    await new Promise(r => setTimeout(r, 10000));
                }
            }
        };
        triggerSync(5); // Launch in background without blocking DB connect
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
