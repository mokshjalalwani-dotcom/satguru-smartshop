from pymongo import MongoClient
import pandas as pd
import os
from datetime import datetime
from decimal import Decimal

# MongoDB Configuration from environment
MONGODB_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/smartshop')

def sync():
    print(f"Starting Live Data Sync from MongoDB ({MONGODB_URI})...")
    
    try:
        # Initialize MongoDB client
        client = MongoClient(MONGODB_URI)
        db = client.get_default_database()
        if db is None:
            # Fallback for URIs that don't specify a DB
            db = client['smartshop']
            
        sales_col = db['sales']
        products_col = db['products']
        
        # 1. Fetch Products for mapping and inventory
        print("Fetching Products...")
        products = list(products_col.find({}))
        
        product_map = {p['product_id']: p for p in products}
        
        # Create inventory.csv
        inventory_data = []
        for p in products:
            inventory_data.append({
                "product": str(p.get('name', 'Unknown')),
                "stock": int(p.get('stock', 0)),
                "threshold": 30,
                "lead_time_days": 5
            })
        
        # 2. Fetch Sales
        print("Fetching Sales...")
        sales_items = list(sales_col.find({}))
        
        sales_data = []
        for s in sales_items:
            pid = s.get('product_id')
            p_info = product_map.get(pid, {})
            
            total_price = float(s.get('total_price', 0))
            qty = int(s.get('quantity', 1))
            unit_price = total_price / qty if qty > 0 else 0.0
            
            # Use timestamp if available, else current time
            dt = s.get('timestamp', datetime.now())
            if isinstance(dt, datetime):
                dt_str = dt.isoformat()
            else:
                dt_str = str(dt)
                
            sales_data.append({
                "order_id": str(s.get('sale_id', 'Unknown')),
                "date": dt_str,
                "customer_id": "CUST-LIVE",
                "product": str(p_info.get('name', 'Unknown')),
                "category": str(p_info.get('category', 'General')),
                "sales": int(qty),
                "price": float(unit_price),
                "cost": float(round(Decimal(str(unit_price)) * Decimal('0.8'), 2)),
                "payment_status": "Completed"
            })

        # 3. Save to data directory
        os.makedirs("data", exist_ok=True)
        
        if inventory_data:
            pd.DataFrame(inventory_data).to_csv("data/inventory.csv", index=False)
            print(f"Synced {len(inventory_data)} products to inventory.csv")
        
        if sales_data:
            pd.DataFrame(sales_data).to_csv("data/sales.csv", index=False)
            print(f"Synced {len(sales_data)} sales records to sales.csv")
        else:
            print("No sales records found in MongoDB. AI service will fall back to empty dataset.")
            
    except Exception as e:
        print(f"Sync failed: {e}")
        # Re-raise to allow startup to fail if sync is critical, 
        # or handle gracefully by continuing with existing/synthetic data
        print("Continuing with existing/synthetic data...")

if __name__ == "__main__":
    sync()
