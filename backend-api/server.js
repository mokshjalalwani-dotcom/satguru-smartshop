const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const productsRoute = require('./routes/products');
const salesRoute = require('./routes/sales');
const aiRoute = require('./routes/ai');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/products', productsRoute);
app.use('/api/sales', salesRoute);
app.use('/api/ai', aiRoute);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
