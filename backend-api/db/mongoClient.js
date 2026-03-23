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
                    console.log(`[DB-SYNC] Triggering AI service data sync (Attempt ${i + 1})...`);
                    // Use a longer timeout for the sync trigger as it might involve waking the AI container
                    await axios.post(`${AI_SERVICE_INTERNAL}/sync`, {}, { timeout: 30000 });
                    console.log('[DB-SYNC] AI Sync triggered successfully.');
                    return;
                } catch (syncErr) {
                    console.warn(`[DB-SYNC] AI Sync trigger failed: ${syncErr.message}. Retrying in 12s...`);
                    await new Promise(r => setTimeout(r, 12000));
                }
            }
        };
        triggerSync(5); // Launch in background without blocking DB connect
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        console.warn('Backend server will continue running, but database operations will fail until resolved.');
        // Removed process.exit(1) to prevent Render from infinitely crashing the service
    }
};

module.exports = connectDB;
