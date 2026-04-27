const connectDB = require('./backend-api/db/mongoClient');
const Product = require('./backend-api/db/models/Product');
const Sale = require('./backend-api/db/models/Sale');
const seedData = require('./backend-api/db/seed');

(async () => {
  console.log('[SEED-RUNNER] Connecting to MongoDB...');
  await connectDB();
  await new Promise(r => setTimeout(r, 1500)); // let mongoose settle

  // Force wipe so we pick up the new expanded catalog
  console.log('[SEED-RUNNER] Wiping old products & sales for a clean re-seed...');
  await Product.deleteMany({});
  await Sale.deleteMany({});

  await seedData();
  console.log('[SEED-RUNNER] Done! Exiting...');
  process.exit(0);
})();


