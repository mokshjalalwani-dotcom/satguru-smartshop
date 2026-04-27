const express = require('express');
const axios = require('axios');
const router = express.Router();

// --- MongoDB Direct Fallback ---
// When the Python AI service is unavailable, compute real stats from MongoDB directly.
let Sale, Product;
try {
  Sale = require('../backend-api/db/models/Sale');
  Product = require('../backend-api/db/models/Product');
} catch(e) {
  console.warn('[AI-ROUTE] Could not load Mongoose models for direct fallback:', e.message);
}

const calcChange = (curr, prev) => {
  if (prev === 0) return '+0.0%';
  const change = ((curr - prev) / prev) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
};

const getStatsFromMongo = async (days = 7) => {
  if (!Sale || !Product) throw new Error('Models not available');
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);
  const prevStart = new Date(startDate);
  prevStart.setDate(prevStart.getDate() - days);

  const [current, previous, products] = await Promise.all([
    Sale.find({ timestamp: { $gte: startDate } }),
    Sale.find({ timestamp: { $gte: prevStart, $lt: startDate } }),
    Product.find({})
  ]);

  const revenue = current.reduce((s, r) => s + (r.total_price || 0), 0);
  const prevRevenue = previous.reduce((s, r) => s + (r.total_price || 0), 0);
  const profit = revenue * 0.22;
  const prevProfit = prevRevenue * 0.22;
  const orders = current.length;
  const prevOrders = previous.length;
  const uniqs = new Set(current.map(s => s.product_id)).size;
  const prevUniqs = new Set(previous.map(s => s.product_id)).size;
  const lowStock = products.filter(p => p.stock <= 10).length;

  return {
    revenue: Math.round(revenue),
    orders,
    aov: orders > 0 ? Math.round(revenue / orders) : 0,
    active_customers: uniqs,
    low_stock_count: lowStock,
    profit: Math.round(profit),
    revenue_change: calcChange(revenue, prevRevenue),
    profit_change: calcChange(profit, prevProfit),
    orders_change: calcChange(orders, prevOrders),
    customers_change: calcChange(uniqs, prevUniqs),
    _fromMongo: true,
  };
};

const getHistoryFromMongo = async (days = 7) => {
  if (!Sale) throw new Error('Sale model not available');
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  const sales = await Sale.find({ timestamp: { $gte: startDate } });
  const grouped = {};

  const useWeeks = days >= 60; // 6M and 30D(60+) → weekly buckets

  for (const sale of sales) {
    const d = new Date(sale.timestamp);
    let key, label;
    if (useWeeks) {
      // Snap to Monday of the week
      const mon = new Date(d);
      mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      key = `${mon.getFullYear()}-${String(mon.getMonth()+1).padStart(2,'0')}-${String(mon.getDate()).padStart(2,'0')}`;
      label = mon.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }
    if (!grouped[key]) grouped[key] = { key, label, revenue: 0 };
    grouped[key].revenue += sale.total_price || 0;
  }
  return Object.values(grouped)
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ label, revenue }) => ({ name: label, revenue: Math.round(revenue) }));
};

const getTransactionsFromMongo = async (limit = 10) => {
  if (!Sale || !Product) throw new Error('Models not available');
  const sales = await Sale.find({}).sort({ timestamp: -1 }).limit(limit);
  const productMap = {};
  const products = await Product.find({});
  products.forEach(p => { productMap[p.product_id] = p.name; });
  return sales.map(s => ({
    order_id: s.sale_id,
    date: s.timestamp,
    customer_id: `CUST-${s._id.toString().slice(-4).toUpperCase()}`,
    product: productMap[s.product_id] || s.product_id,
    sales: s.quantity,
    price: s.total_price,
    payment_status: 'Completed',
  }));
};

const getInventoryFromMongo = async () => {
  if (!Product || !Sale) throw new Error('Models not available');
  const products = await Product.find({});
  // Calculate 30-day sales velocity per product
  const since30 = new Date(); since30.setDate(since30.getDate() - 30);
  const recentSales = await Sale.find({ timestamp: { $gte: since30 } });
  const velocityMap = {};
  for (const s of recentSales) {
    velocityMap[s.product_id] = (velocityMap[s.product_id] || 0) + s.quantity;
  }
  return products.map(p => {
    const sold30 = velocityMap[p.product_id] || 0;
    const dailyVelocity = sold30 / 30;
    const daysOfStock = dailyVelocity > 0 ? Math.round(p.stock / dailyVelocity) : 999;
    const status = p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? 'Critical' : p.stock <= 15 ? 'Low Stock' : 'Healthy';
    const predictedDemand = Math.round(dailyVelocity * 7); // next 7 days
    return {
      product_id: p.product_id,
      name: p.name,
      category: p.category,
      stock: p.stock,
      sold_last_30d: sold30,
      daily_velocity: Math.round(dailyVelocity * 10) / 10,
      days_of_stock: daysOfStock,
      predicted_demand_7d: predictedDemand,
      status,
      alert: status !== 'Healthy' ? `Only ${p.stock} units left — reorder recommended` : null,
    };
  });
};


const getProductStatsFromMongo = async (days = 30) => {
  if (!Sale || !Product) throw new Error('Models not available');
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);
  const prevStart = new Date(startDate);
  prevStart.setDate(prevStart.getDate() - days);

  const [currentSales, prevSales, products] = await Promise.all([
    Sale.find({ timestamp: { $gte: startDate } }),
    Sale.find({ timestamp: { $gte: prevStart, $lt: startDate } }),
    Product.find({}),
  ]);

  const productMap = {};
  products.forEach(p => { productMap[p.product_id] = p; });

  const current = {};
  for (const s of currentSales) {
    if (!current[s.product_id]) current[s.product_id] = { revenue: 0, qty: 0 };
    current[s.product_id].revenue += s.total_price || 0;
    current[s.product_id].qty += s.quantity || 0;
  }
  const prev = {};
  for (const s of prevSales) {
    if (!prev[s.product_id]) prev[s.product_id] = { revenue: 0 };
    prev[s.product_id].revenue += s.total_price || 0;
  }

  return Object.entries(current)
    .map(([pid, cur]) => {
      const p = productMap[pid];
      if (!p) return null;
      const prevRev = prev[pid]?.revenue || 0;
      const growth = prevRev > 0 ? ((cur.revenue - prevRev) / prevRev) * 100 : 15;
      const profit = cur.revenue * 0.22;
      return {
        product_id: pid,
        name: p.name,
        product: p.name,
        category: p.category,
        sales: cur.qty,
        orders: cur.qty,
        revenue: Math.round(cur.revenue),
        profit: Math.round(profit),
        growth: Math.round(growth * 10) / 10,
        trend: growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
};

// Helper to sanitize and validate base URLs
const sanitizeBaseUrl = (url, type = 'public') => {
  // Enhanced detection for Render/Production environments
  const isProd = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
  const defaultInternal = isProd ? 'http://satguru-ai-service:10000' : 'http://127.0.0.1:10000';
  const defaultPublic = 'https://satguru-ai-service.onrender.com';
  
  if (!url || typeof url !== 'string' || url.trim() === '') {
    console.log(`[AI-CONFIG] Using default ${type} URL: ${type === 'internal' ? defaultInternal : defaultPublic}`);
    return type === 'internal' ? defaultInternal : defaultPublic;
  }

  let sanitized = url.trim().replace(/\/+$/, '');
  
  // 1. Handle localhost/local dev - ensure we don't accidentally use loopback in production
  if (sanitized.includes('localhost') || sanitized.includes('127.0.0.1')) {
    if (isProd && type === 'internal') {
       console.warn(`[AI-CONFIG] WARNING: Detected local address in production internal URL. Overriding to ${defaultInternal}`);
       return defaultInternal;
    }
    if (!sanitized.startsWith('http')) sanitized = `http://${sanitized}`;
    return sanitized;
  }

  // 2. Fix partial Render URLs (e.g. "satguru-ai-service" -> "satguru-ai-service.onrender.com")
  if (type === 'public' && sanitized.startsWith('satguru-') && !sanitized.includes('.')) {
    sanitized = `${sanitized}.onrender.com`;
  }

  // 3. Ensure Protocol
  if (!/^https?:\/\//i.test(sanitized)) {
    const isInternal = !sanitized.includes('.') || sanitized.includes('onrender.com') === false;
    sanitized = isInternal ? `http://${sanitized}` : `https://${sanitized}`;
  }
  
  console.log(`[AI-CONFIG] Final ${type} URL: ${sanitized}`);
  return sanitized;
};

const AI_INTERNAL_URL = sanitizeBaseUrl(process.env.AI_SERVICE_INTERNAL_URL, 'internal');
const AI_PUBLIC_URL = sanitizeBaseUrl(process.env.AI_SERVICE_URL, 'public');

const instance = axios.create({
  timeout: 60000, // Increased to 60s to handle extreme Render Free Tier "Cold Starts"
});

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes caching
const STALE_TTL = 30 * 60 * 1000; // 30 minutes stale

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- CIRCUIT BREAKER ---
let breakerTripped = false;
let breakerResetTime = 0;
let consecutiveFailures = 0;
const BREAKER_RESET_MS = 60 * 1000; // 60 seconds
const MAX_FAILURES = 3;


const SAFE_FALLBACKS = {
  '/stats': {
    revenue: 0, orders: 0, aov: 0, active_customers: 0, 
    low_stock_count: 0, profit: 0,
    revenue_change: "+0.0%", profit_change: "+0.0%", 
    orders_change: "+0.0%", customers_change: "+0.0%",
    _isFallback: true,
    _message: "AI Engine Warming (Takes ~60s). Please check back."
  },
  '/history': [],
  '/transactions': [],
  '/product-stats': [],
  '/inventory': [],
  '/demand': { demand: {}, _isFallback: true },
  '/insights': {
    forecasting: "AI Service is offline.",
    demand: "Unreachable.",
    anomalies: "Unreachable.",
    bi: "Unreachable.",
    kpi_trends: "Engine warming...",
    _isFallback: true
  },
  '/predict': {
    predictions: [],
    confidence_interval: { lower: 0, upper: 0 },
    predicted_total: 0,
    trend_percent_change: 0,
    metrics: { mae: 0, rmse: 0 },
    _isFallback: true
  },
  '/anomalies': { anomalies: [], _isFallback: true }
};

const aiRequest = async (method, path, options = {}) => {
  const cacheKey = `${method}:${path}:${JSON.stringify(options.params || {})}`;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  const getCacheEntry = (key) => {
    const entry = cache.get(key);
    if (!entry) return null;
    const age = Date.now() - entry.timestamp;
    return {
      data: entry.data,
      isStale: age >= CACHE_TTL,
      isExpired: age >= STALE_TTL
    };
  };

  // --- SWR STRATEGY ---
  if (method.toUpperCase() === 'GET') {
    const entry = getCacheEntry(cacheKey);
    if (entry && !entry.isExpired) {
      // If data is stale but not expired, return it NOW and refresh in background
      if (entry.isStale) {
        console.log(`[AI-SWR] Serving STALE data for ${cleanPath}. Refreshing in background...`);
        // Background refresh (no await)
        performActualRequest(method, cleanPath, options, cacheKey).catch(e => 
          console.warn(`[AI-SWR-BG] Background refresh failed for ${cleanPath}: ${e.message}`)
        );
      } else {
        console.log(`[AI-CACHE] Serving FRESH data for ${cleanPath}`);
      }
      return { data: entry.data, _fromCache: true, _isStale: entry.isStale };
    }
  }

  return performActualRequest(method, cleanPath, options, cacheKey);
};

// Extracted the actual request logic for SWR background refresh
const performActualRequest = async (method, cleanPath, options, cacheKey) => {
  // Check Circuit Breaker
  if (breakerTripped) {
    if (Date.now() > breakerResetTime) {
      // Half-open state: allow 1 request to check if it's back
      console.log(`[AI-BREAKER] Testing if service is back online...`);
      breakerTripped = false;
    } else {
      console.warn(`[AI-BREAKER] Circuit open. Instantly serving static fallback for ${cleanPath}`);
      return { data: SAFE_FALLBACKS[cleanPath] || SAFE_FALLBACKS['/stats'], _fallback: 'circuit-breaker' };
    }
  }

  let response = null;
  
  const targets = [
    { name: 'Internal', url: AI_INTERNAL_URL },
    { name: 'Public', url: AI_PUBLIC_URL }
  ];

  for (const target of targets) {
    let retries = target.name === 'Internal' ? 3 : 2; 
    let delay = 1500; 

    for (let i = 0; i < retries; i++) {
      try {
        console.log(`[AI-PROXY] ${target.name} ${method} ${cleanPath} (Try ${i+1})`);
        response = await instance({ 
          method, 
          baseURL: target.url, 
          url: cleanPath, 
          ...options 
        });
        if (response) break;
      } catch (err) {
        const status = err.response?.status;
        const isNetworkError = !err.response || err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT';
        
        // Fast-fail on known suspension codes from Render (403, 502, 503 HTTP)
        if (status === 402 || status === 403) {
            console.warn(`[AI-PROXY] ${target.name} confirmed SUSPENDED or UNAVAILABLE (Status ${status}). Fast Failing.`);
            break;
        }

        if ((status === 429 || status === 502 || status === 503 || status === 504 || isNetworkError) && i < retries - 1) {
          await sleep(delay);
          delay *= 2; // Aggressive backoff for Render cold starts
          continue;
        }
        break; 
      }
    }
    if (response) break;
  }

  if (!response) {
    consecutiveFailures++;
    if (consecutiveFailures >= MAX_FAILURES) {
      console.error(`[AI-BREAKER] Massive failure count reached. Tripping breaker for ${BREAKER_RESET_MS/1000}s`);
      breakerTripped = true;
      breakerResetTime = Date.now() + BREAKER_RESET_MS;
    }

    // Last ditch: check if we have ANY expired data to show before using static fallback
    const entry = cache.get(cacheKey);
    if (entry) {
      console.warn(`[AI-RECOVERY] Service down. Serving EXPIRED data for ${cleanPath}`);
      return { data: entry.data, _fallback: 'expired' };
    }

    const fallback = SAFE_FALLBACKS[cleanPath] || (cleanPath.startsWith('/stats') ? SAFE_FALLBACKS['/stats'] : {});
    console.warn(`[AI-RECOVERY] Serving STATIC fallback for ${cleanPath}`);
    return { data: fallback, _fallback: 'static' };
  }

  // Success resets the circuit breaker
  consecutiveFailures = 0;
  breakerTripped = false;

  const resultData = response.data;
  if (method.toUpperCase() === 'GET') {
    cache.set(cacheKey, { data: resultData, timestamp: Date.now() });
  }

  return { data: resultData };
};

router.get('/health', async (req, res) => {
  try {
    const response = await aiRequest('GET', '/health');
    res.json({ status: 'ok', backend: response.data });
  } catch (error) {
    res.status(500).json({ status: 'error', details: error.message });
  }
});

router.get('/predict', async (req, res) => {
  try {
    const response = await aiRequest('GET', '/predict');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Predict Failed', details: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const response = await aiRequest('GET', '/stats', { params: req.query });
    const data = response.data;
    // If AI returned fallback/zeros, try MongoDB directly for real numbers
    if (data?._isFallback || (data?.revenue === 0 && data?.orders === 0)) {
      try {
        const mongoStats = await getStatsFromMongo(parseInt(req.query.days) || 7);
        if (mongoStats.orders > 0) return res.json(mongoStats);
      } catch (mongoErr) {
        console.warn('[MONGO-FALLBACK] Stats failed:', mongoErr.message);
      }
    }
    res.json(data);
  } catch (error) {
    // Primary AI failed entirely — go straight to MongoDB
    try {
      const mongoStats = await getStatsFromMongo(parseInt(req.query.days) || 7);
      return res.json(mongoStats);
    } catch (mongoErr) {
      res.status(500).json({ error: 'AI Stats Failed', details: error.message });
    }
  }
});

router.get('/insights', async (req, res) => {
  try {
    const response = await aiRequest('GET', '/insights');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Insights Failed', details: error.message });
  }
});

router.get('/inventory', async (req, res) => {
  try {
    const response = await aiRequest('GET', '/inventory');
    const data = response.data;
    if (!Array.isArray(data) || data.length === 0) {
      try {
        const mongoInv = await getInventoryFromMongo();
        if (mongoInv.length > 0) return res.json(mongoInv);
      } catch (mongoErr) {
        console.warn('[MONGO-FALLBACK] Inventory failed:', mongoErr.message);
      }
    }
    res.json(data);
  } catch (error) {
    try {
      const mongoInv = await getInventoryFromMongo();
      return res.json(mongoInv);
    } catch (mongoErr) {
      res.status(500).json({ error: 'AI Inventory Failed', details: error.message });
    }
  }
});

router.get('/transactions', async (req, res) => {
  try {
    const response = await aiRequest('GET', '/transactions', { params: req.query });
    const data = response.data;
    if (!Array.isArray(data) || data.length === 0) {
      try {
        const mongoTx = await getTransactionsFromMongo(parseInt(req.query.limit) || 10);
        if (mongoTx.length > 0) return res.json(mongoTx);
      } catch (mongoErr) {
        console.warn('[MONGO-FALLBACK] Transactions failed:', mongoErr.message);
      }
    }
    res.json(data);
  } catch (error) {
    try {
      const mongoTx = await getTransactionsFromMongo(parseInt(req.query.limit) || 10);
      return res.json(mongoTx);
    } catch (mongoErr) {
      res.status(500).json({ error: 'AI Transactions Failed', details: error.message });
    }
  }
});

router.get('/history', async (req, res) => {
  try {
    const response = await aiRequest('GET', '/history', { params: req.query });
    const data = response.data;
    if (!Array.isArray(data) || data.length === 0) {
      try {
        const mongoHistory = await getHistoryFromMongo(parseInt(req.query.days) || 7);
        if (mongoHistory.length > 0) return res.json(mongoHistory);
      } catch (mongoErr) {
        console.warn('[MONGO-FALLBACK] History failed:', mongoErr.message);
      }
    }
    res.json(data);
  } catch (error) {
    try {
      const mongoHistory = await getHistoryFromMongo(parseInt(req.query.days) || 7);
      return res.json(mongoHistory);
    } catch (mongoErr) {
      res.status(500).json({ error: 'AI History Failed', details: error.message });
    }
  }
});

router.get('/product-stats', async (req, res) => {
  try {
    const response = await aiRequest('GET', '/product-stats', { params: req.query });
    const data = response.data;
    if (!Array.isArray(data) || data.length === 0) {
      try {
        const mongoStats = await getProductStatsFromMongo(parseInt(req.query.days) || 30);
        if (mongoStats.length > 0) return res.json(mongoStats);
      } catch (mongoErr) {
        console.warn('[MONGO-FALLBACK] Product stats failed:', mongoErr.message);
      }
    }
    res.json(data);
  } catch (error) {
    try {
      const mongoStats = await getProductStatsFromMongo(parseInt(req.query.days) || 30);
      return res.json(mongoStats);
    } catch (mongoErr) {
      res.status(500).json({ error: 'AI Product Stats Failed', details: error.message });
    }
  }
});

router.post('/train', async (req, res) => {
  try {
    const response = await aiRequest('POST', '/train');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI Training Failed', details: error.message });
  }
});

module.exports = router;
