import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

def generate_enriched_dataset():
    products = {
        "Smartphone X": {"base_price": 599.99, "avg_sales": 150, "std_sales": 20, "stock": 15},
        "Laptop Pro": {"base_price": 1299.99, "avg_sales": 50, "std_sales": 10, "stock": 5},
        "Wireless Buds": {"base_price": 100.0, "avg_sales": 100, "std_sales": 15, "stock": 100},
        "Smart Watch": {"base_price": 200.0, "avg_sales": 80, "std_sales": 12, "stock": 40},
        "Tablet G1": {"base_price": 450.0, "avg_sales": 60, "std_sales": 10, "stock": 8}
    }

    # Start date exactly one year ago from today
    start_date = datetime(2025, 3, 11)
    num_days = 365
    sales_data = []
    
    np.random.seed(42)

    for day in range(num_days):
        current_date = start_date + timedelta(days=day)
        for product, config in products.items():
            month_factor = 1.4 if current_date.month in [11, 12] else 1.0
            weekend_factor = 1.3 if current_date.weekday() >= 5 else 1.0
            
            avg = config["avg_sales"] * month_factor * weekend_factor
            num_transactions = int(np.random.normal(avg, config["std_sales"]))
            num_transactions = max(1, num_transactions)

            for i in range(num_transactions):
                qty = 1 # Simple qty for now
                price = config["base_price"] + np.random.uniform(-5, 5)
                
                sales_data.append({
                    "order_id": f"ORD-{current_date.strftime('%y%m%d')}-{np.random.randint(1000, 9999)}-{i}",
                    "date": current_date.strftime("%Y-%m-%d %H:%M:%S"),
                    "customer_id": f"CUST-{np.random.randint(100, 999)}",
                    "product": product,
                    "sales": qty,
                    "price": round(price, 2),
                    "payment_status": "Completed" if np.random.random() > 0.05 else "Pending"
                })

    df = pd.DataFrame(sales_data)
    os.makedirs("data", exist_ok=True)
    df.to_csv("data/sales.csv", index=False)
    
    # Generate Inventory
    inv_data = []
    for prod, config in products.items():
        inv_data.append({
            "product": prod,
            "stock": config["stock"] + np.random.randint(0, 50),
            "threshold": 15
        })
    pd.DataFrame(inv_data).to_csv("data/inventory.csv", index=False)
    
    print(f"Generated {len(df)} transactions and inventory file.")

if __name__ == "__main__":
    generate_enriched_dataset()