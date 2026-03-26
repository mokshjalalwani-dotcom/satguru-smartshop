const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./backend-api/db/mongoClient');

const productsRoute = require('./routes/products');
const salesRoute = require('./routes/sales');
const aiRoute = require('./routes/ai');

const app = express();

// Initialize MongoDB Connection
connectDB();

app.use(cors());
app.use(bodyParser.json());

// API routes
app.use('/api/products', productsRoute);
app.use('/api/sales', salesRoute);
app.use('/api/ai', aiRoute);

// Serve frontend build from admin-portal/dist
const frontendPath = path.join(__dirname, 'admin-portal', 'dist');
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // --- RENDER FREE TIER KEEP-ALIVE ---
  // Sends an external HTTP ping to both services every 13 minutes 
  // to trick the load balancer into thinking there's active web traffic.
  setInterval(() => {
    try {
      const axios = require('axios');
      const aiUrl = (process.env.AI_SERVICE_URL || 'https://satguru-ai-service.onrender.com').replace(/\/+$/, '') + '/health';
      const selfUrl = (process.env.PUBLIC_URL || 'https://satguru-shop-portal.onrender.com').replace(/\/+$/, '') + '/api/products';
      
      axios.get(aiUrl).catch(() => {});
      axios.get(selfUrl).catch(() => {});
      
      console.log(`[KEEP-ALIVE] Pinged ${aiUrl} and ${selfUrl} to prevent spin-down.`);
    } catch (e) {}
  }, 13 * 60 * 1000); // 13 minutes
});