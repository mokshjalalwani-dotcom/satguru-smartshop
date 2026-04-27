import time
from pymongo import MongoClient
import pandas as pd
import os
from datetime import datetime
from decimal import Decimal
import random

# MongoDB Configuration from environment
MONGODB_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/smartshop')

def sync():
    print(f"Starting Live Data Sync from MongoDB...")
    
    max_retries = 15 # Increased to wait up to 75s for backend seed on Render
    retry_delay = 5
    
    for attempt in range(max_retries):
        try:
            # Initialize MongoDB client
            client = MongoClient(MONGODB_URI)
            db = client.get_default_database()
            if db is None:
                db = client['smartshop']
                
            sales_col = db['sales']
            products_col = db['products']
            
            # Fetch Products
            products = list(products_col.find({}))
            sales_items = list(sales_col.find({}))
            
            if not products or not sales_items:
                if attempt < max_retries - 1:
                    print(f"Attempt {attempt + 1}: No data found in MongoDB yet. Waiting {retry_delay}s for seeding...")
                    time.sleep(retry_delay)
                    continue
                else:
                    print("Final Attempt: Still no data. Proceeding with empty/synthetic data.")
            
            print(f"Found {len(products)} products and {len(sales_items)} sales records.")
            
            product_map = {p.get('product_id'): p for p in products if p.get('product_id')}
            
            # Create inventory.csv
            inventory_data = []
            for p in products:
                price = float(p.get('price', 0))
                stock = int(p.get('stock', 0))
                # Smart threshold: 15% of max viable stock based on price tier
                if price > 50000:   threshold = 3   # High-value: reorder when <=3
                elif price > 20000: threshold = 5   # Mid-value: reorder when <=5
                elif price > 5000:  threshold = 8   # Mid-range: reorder when <=8
                else:               threshold = 15  # Fast-moving budget items
                
                inventory_data.append({
                    "product": str(p.get('name', 'Unknown')),
                    "stock": stock,
                    "threshold": threshold,
                    "lead_time_days": 5,
                    "price": price
                })
            
            # Create sales.csv
            sales_data = []
            for s in sales_items:
                items = s.get('items', [])
                if not items:
                    # Fallback for old data or root-level
                    items = [s]
                
                dt = s.get('timestamp', datetime.now())
                dt_str = dt.isoformat() if isinstance(dt, datetime) else str(dt)

                for item in items:
                    pid = item.get('product_id') or s.get('product_id')
                    p_info = product_map.get(pid, {})
                    
                    qty = int(item.get('quantity', s.get('quantity', 1)))
                    unit_price = float(item.get('unit_price', 0))
                    line_total = float(item.get('line_total', unit_price * qty))
                        
                    price_dec = Decimal(str(round(line_total, 2)))
                    cost_dec = price_dec * Decimal('0.78')  # ~22% margin
                    
                    sales_data.append({
                        "order_id": str(s.get('sale_id', 'Unknown')),
                        "date": dt_str,
                        "customer_id": f"CUST-{s.get('customer', 'WalkIn').replace(' ', '')[:8]}-{random.randint(100, 999)}",
                        "product": str(item.get('product_name') or p_info.get('name', 'Unknown')),
                        "category": str(p_info.get('category', 'General')),
                        "sales": int(qty),
                        "price": float(price_dec),
                        "cost": float(round(cost_dec, 2)),
                        "payment_status": "Completed"
                    })

            os.makedirs("data", exist_ok=True)
            
            if inventory_data:
                pd.DataFrame(inventory_data).to_csv("data/inventory.csv", index=False)
                print(f"Saved {len(inventory_data)} products to data/inventory.csv")
            
            if sales_data:
                pd.DataFrame(sales_data).to_csv("data/sales.csv", index=False)
                print(f"Saved {len(sales_data)} sales records to data/sales.csv")
            
            break # Success!
                
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                print("Continuing with default data due to persistent sync errors.")

if __name__ == "__main__":
    sync()
