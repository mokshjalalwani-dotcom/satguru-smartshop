import time
from pymongo import MongoClient
import pandas as pd
import os
from datetime import datetime
from decimal import Decimal

# MongoDB Configuration from environment
MONGODB_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/smartshop')

def sync():
    print(f"Starting Live Data Sync from MongoDB...")
    
    max_retries = 5
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
                inventory_data.append({
                    "product": str(p.get('name', 'Unknown')),
                    "stock": int(p.get('stock', 0)),
                    "threshold": 30,
                    "lead_time_days": 5,
                    "price": float(p.get('price', 0))
                })
            
            # Create sales.csv
            sales_data = []
            for s in sales_items:
                pid = s.get('product_id')
                p_info = product_map.get(pid, {})
                
                total_price = float(s.get('total_price', 0))
                qty = int(s.get('quantity', 1))
                unit_price = total_price / qty if qty > 0 else 0.0
                
                dt = s.get('timestamp', datetime.now())
                dt_str = dt.isoformat() if isinstance(dt, datetime) else str(dt)
                    
                price_dec = Decimal(str(round(unit_price, 2)))
                cost_dec = price_dec * Decimal('0.8')
                
                sales_data.append({
                    "order_id": str(s.get('sale_id', 'Unknown')),
                    "date": dt_str,
                    "customer_id": "CUST-LIVE",
                    "product": str(p_info.get('name', 'Unknown')),
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
