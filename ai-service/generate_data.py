import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import random

def generate_enriched_dataset():
    """Generates a high-fidelity synthetic retail dataset with fixed start date for deterministic testing."""
    
    products = {
        "Smartphone X": {"base_price": 599.99, "avg_sales": 15, "margin": 0.15, "category": "Mobile"},
        "Laptop Pro": {"base_price": 1299.99, "avg_sales": 5, "margin": 0.12, "category": "Computing"},
        "Wireless Buds": {"base_price": 89.99, "avg_sales": 45, "margin": 0.40, "category": "Audio"},
        "Smart Watch": {"base_price": 199.99, "avg_sales": 22, "margin": 0.35, "category": "Wearables"},
        "Tablet G1": {"base_price": 449.99, "avg_sales": 8, "margin": 0.20, "category": "Mobile"}
    }

    # Reduced days to save memory on Render Free plan
    start_date = datetime.now() - timedelta(days=180)
    num_days = 180
    sales_data = []
    inventory_data = []
    
    np.random.seed(42)
    random.seed(42)

    print("Generating Deterministic Intelligent Sales Data...")

    for day in range(num_days):
        current_date = start_date + timedelta(days=day)
        is_weekend = current_date.weekday() >= 5
        month = current_date.month
        
        month_factor = 1.6 if month in [11, 12] else 1.2 if month == 3 else 1.0
        day_factor = 1.4 if is_weekend else 1.0
        
        for product, config in products.items():
            base_vol = config["avg_sales"] * month_factor * day_factor
            num_sales = int(np.random.poisson(base_vol))
            
            if random.random() < 0.02:
                num_sales = int(num_sales * 2.5)

            for i in range(num_sales):
                price_variance = np.random.uniform(-0.02, 0.02)
                sale_price = round(config["base_price"] * (1 + price_variance), 2)
                
                sales_data.append({
                    "order_id": f"ORD-{current_date.strftime('%y%m%d')}-{random.randint(1000, 9999)}",
                    "date": current_date.strftime("%Y-%m-%d %H:%M:%S"),
                    "customer_id": f"CUST-{random.randint(100, 999)}",
                    "product": product,
                    "category": config["category"],
                    "sales": 1,
                    "price": sale_price,
                    "cost": round(sale_price * (1 - config["margin"]), 2),
                    "payment_status": "Completed" if random.random() > 0.03 else "Pending"
                })

    os.makedirs("data", exist_ok=True)
    df_sales = pd.DataFrame(sales_data)
    df_sales.to_csv("data/sales.csv", index=False)
    
    for prod, config in products.items():
        inventory_data.append({
            "product": prod,
            "stock": random.randint(20, 150),
            "threshold": 30,
            "lead_time_days": random.randint(3, 7)
        })
    pd.DataFrame(inventory_data).to_csv("data/inventory.csv", index=False)
    
    print(f"Dataset generated: {len(df_sales)} transactions.")

if __name__ == "__main__":
    generate_enriched_dataset()
