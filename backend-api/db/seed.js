const Product = require('./models/Product');
const Sale = require('./models/Sale');
const { v4: uuidv4 } = require('uuid');

const PRODUCTS = [
  // Televisions
  { name: 'Samsung 55" 4K QLED TV', price: 72999, category: 'Television', stock: 18 },
  { name: 'LG 65" OLED evo C3 TV', price: 129999, category: 'Television', stock: 8 },
  { name: 'Sony Bravia 43" 4K TV', price: 48999, category: 'Television', stock: 22 },
  { name: 'Mi 40" Full HD Smart TV', price: 21999, category: 'Television', stock: 35 },
  // Air Conditioners
  { name: 'Daikin 1.5 Ton 5★ Split AC', price: 44999, category: 'Air Conditioner', stock: 30 },
  { name: 'LG 1.5 Ton Dual Inverter AC', price: 38999, category: 'Air Conditioner', stock: 25 },
  { name: 'Voltas 1 Ton 3★ Split AC', price: 28999, category: 'Air Conditioner', stock: 40 },
  { name: 'Blue Star 2 Ton 5★ AC', price: 62999, category: 'Air Conditioner', stock: 12 },
  // Refrigerators
  { name: 'Samsung 324L Double Door Fridge', price: 34999, category: 'Refrigerator', stock: 15 },
  { name: 'LG 215L Single Door Fridge', price: 19999, category: 'Refrigerator', stock: 20 },
  { name: 'Whirlpool 292L Frost-Free Fridge', price: 29999, category: 'Refrigerator', stock: 12 },
  // Washing Machines
  { name: 'LG 7Kg Front Load Washer', price: 36999, category: 'Washing Machine', stock: 16 },
  { name: 'Samsung 8Kg Fully Automatic WM', price: 28999, category: 'Washing Machine', stock: 18 },
  { name: 'Bosch 7Kg Serie 6 Front Load', price: 44999, category: 'Washing Machine', stock: 10 },
  // Smartphones
  { name: 'Samsung Galaxy S24 5G 256GB', price: 74999, category: 'Smartphone', stock: 45 },
  { name: 'OnePlus 12R 5G 256GB', price: 39999, category: 'Smartphone', stock: 60 },
  { name: 'Redmi Note 13 Pro+ 5G 256GB', price: 28999, category: 'Smartphone', stock: 80 },
  { name: 'Apple iPhone 15 128GB', price: 79900, category: 'Smartphone', stock: 30 },
  // Laptops
  { name: 'Dell Inspiron 15 Core i5 16GB', price: 54999, category: 'Laptop', stock: 20 },
  { name: 'HP Pavilion 14 Ryzen 5 8GB', price: 48999, category: 'Laptop', stock: 18 },
  { name: 'Lenovo IdeaPad Slim 5 Ryzen 7', price: 62499, category: 'Laptop', stock: 15 },
  // Audio
  { name: 'Sony WH-1000XM5 Headphones', price: 24999, category: 'Audio', stock: 40 },
  { name: 'JBL Bar 5.0 Multibeam', price: 19999, category: 'Audio', stock: 25 },
  { name: 'boAt Aavante Bar 1500', price: 4999, category: 'Audio', stock: 70 },
  // Kitchen Appliances
  { name: 'IFB 25L Convection Microwave', price: 14999, category: 'Kitchen', stock: 28 },
  { name: 'Philips Air Fryer HD9252', price: 7999, category: 'Kitchen', stock: 45 },
  { name: 'Morphy Richards 800W Mixer', price: 4499, category: 'Kitchen', stock: 55 },
  // Small Appliances / Other
  { name: 'Dyson V8 Cordless Vacuum', price: 34999, category: 'Appliance', stock: 12 },
  { name: 'Philips LED Bulb Pack of 10', price: 499, category: 'Lighting', stock: 200 },
  { name: 'CP Plus 5MP HD CCTV Kit 4CH', price: 12999, category: 'Security', stock: 25 },
];

// Category demand by month (Jan=0 .. Dec=11)
const CATEGORY_SEASONALITY = {
  'Air Conditioner': [0.3, 0.4, 0.7, 1.8, 2.5, 2.8, 2.2, 1.6, 0.8, 0.5, 0.3, 0.3],
  'Television': [1.8, 1.2, 1.0, 1.0, 1.0, 0.9, 0.9, 1.0, 1.0, 2.2, 2.5, 2.0],
  'Smartphone': [1.4, 1.0, 1.0, 1.2, 1.0, 1.0, 1.0, 1.2, 1.0, 1.8, 1.6, 1.4],
  'Refrigerator': [0.8, 0.9, 1.0, 1.3, 1.6, 1.5, 1.4, 1.2, 1.0, 1.0, 0.8, 0.9],
  'Laptop': [1.2, 1.0, 1.0, 1.2, 1.0, 1.5, 1.0, 1.0, 1.3, 1.2, 1.2, 1.2],
  'default': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.5, 1.3, 1.2],
};

// Festival boosts { month(0-based), days, multiplier }
const FESTIVAL_BOOSTS = [
  { month: 0, days: [1, 2], boost: 2.0 },  // New Year
  { month: 2, days: [14], boost: 1.8 },  // Holi
  { month: 3, days: [14, 21], boost: 1.6 },  // Baisakhi, Akshaya Tritiya
  { month: 7, days: [15], boost: 1.7 },  // Independence Day
  { month: 9, days: [2, 3, 20, 21, 22], boost: 3.0 },  // Navratri + Diwali
  { month: 11, days: [24, 25, 26, 31], boost: 2.2 },  // Christmas + NYE
];

const generateSales = async (products) => {
  const sales = [];
  const now = new Date();

  for (let daysAgo = 0; daysAgo < 180; daysAgo++) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const month = date.getMonth();
    const dow = date.getDay();
    const dom = date.getDate();

    // Multipliers
    const weekendMult = (dow === 0 || dow === 6) ? 1.6 : 1.0;
    const salaryMult = (dom <= 5 || dom >= 25) ? 1.3 : 1.0;
    let festivalMult = 1.0;
    for (const f of FESTIVAL_BOOSTS) {
      if (f.month === month && f.days.includes(dom)) { festivalMult = f.boost; break; }
    }

    // 6–14 base transactions per day
    const baseSales = 6 + Math.floor(Math.random() * 9);
    const totalSales = Math.round(baseSales * weekendMult * salaryMult * festivalMult);

    // Weighted pick: affordable items sell more
    const weights = products.map(p => Math.max(1, Math.round(8 - p.price / 15000)));
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    for (let s = 0; s < totalSales; s++) {
      // Pick product by weight
      let rand = Math.random() * totalWeight;
      let product = products[products.length - 1];
      for (let i = 0; i < products.length; i++) {
        rand -= weights[i];
        if (rand <= 0) { product = products[i]; break; }
      }

      // Skip based on category seasonality
      const seasonality = CATEGORY_SEASONALITY[product.category] || CATEGORY_SEASONALITY['default'];
      if (Math.random() > Math.min(1, seasonality[month] / 2.5)) continue;

      const quantity = Math.random() < 0.85 ? 1 : 2;
      const saleDate = new Date(date);
      saleDate.setHours(9 + Math.floor(Math.random() * 11), Math.floor(Math.random() * 60));

      const total_price = product.price * quantity;
      const subtotal = Math.round(total_price / 1.18);
      const gst_amount = total_price - subtotal;

      sales.push({
        sale_id: `SALE-${uuidv4().slice(0, 8).toUpperCase()}`,
        items: [{
          product_id: product.product_id,
          product_name: product.name,
          quantity: quantity,
          unit_price: product.price,
          line_total: total_price
        }],
        subtotal: subtotal,
        gst_rate: 18,
        gst_amount: gst_amount,
        total_price: total_price,
        timestamp: saleDate,
      });
    }
  }

  await Sale.insertMany(sales);
  console.log(`[SEED] ✅ ${sales.length} seasonal sales generated (~${Math.round(sales.length / 180)}/day avg).`);
};

const seedData = async () => {
  try {
    const productCount = await Product.countDocuments();

    if (productCount > 5) {
      // Products exist — only refresh sales if stale
      const latestSale = await Sale.findOne().sort({ timestamp: -1 });
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      if (!latestSale || new Date(latestSale.timestamp) < threeDaysAgo) {
        console.log('[SEED] Sales data stale — regenerating with seasonal patterns...');
        await Sale.deleteMany({});
        const products = await Product.find({});
        await generateSales(products);
      } else {
        console.log(`[SEED] ${productCount} products + fresh sales. Skipping.`);
      }
      return;
    }

    // First-time: seed both products and sales
    console.log('[SEED] First-time setup — creating consumer electronics catalog...');
    await Product.deleteMany({});
    await Sale.deleteMany({});

    const savedProducts = [];
    for (const p of PRODUCTS) {
      const product = new Product({
        product_id: `PROD-${uuidv4().slice(0, 8).toUpperCase()}`,
        name: p.name, price: p.price, category: p.category, stock: p.stock,
      });
      savedProducts.push(await product.save());
    }
    console.log(`[SEED] ✅ ${savedProducts.length} consumer electronics products created.`);
    await generateSales(savedProducts);

  } catch (err) {
    console.error('[SEED] ❌ Failed:', err.message);
  }
};

module.exports = seedData;
