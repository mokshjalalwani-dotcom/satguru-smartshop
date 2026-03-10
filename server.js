const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const productsRoute = require('./routes/products');
const salesRoute = require('./routes/sales');
const aiRoute = require('./routes/ai');

const app = express();
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));