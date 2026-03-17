import boto3
import pandas as pd
import os
from datetime import datetime
from decimal import Decimal

# AWS Configuration from environment
AWS_ACCESS_KEY = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')

def sync():
    print("Starting Live Data Sync from DynamoDB...")
    
    # Initialize DynamoDB client
    session = boto3.Session(
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY,
        region_name=AWS_REGION
    )
    dynamodb = session.resource('dynamodb')
    
    sales_table = dynamodb.Table('Sales')
    products_table = dynamodb.Table('Products')
    
    # 1. Fetch Products for mapping and inventory
    print("Fetching Products...")
    products_resp = products_table.scan()
    products = products_resp.get('Items', [])
    
    product_map = {p['product_id']: p for p in products}
    
    # Create inventory.csv
    inventory_data = []
    for p in products:
        inventory_data.append({
            "product": str(p.get('name', 'Unknown')),
            "stock": int(p.get('stock', 0)),
            "threshold": 30, # Default threshold
            "lead_time_days": 5 # Default lead time
        })
    
    # 2. Fetch Sales
    print("Fetching Sales...")
    sales_resp = sales_table.scan()
    sales_items = sales_resp.get('Items', [])
    
    sales_data = []
    for s in sales_items:
        pid = s.get('product_id')
        p_info = product_map.get(pid, {})
        
        # Calculate rates
        total_price = float(s.get('total_price', 0))
        qty = int(s.get('quantity', 1))
        unit_price = total_price / qty if qty > 0 else 0.0
        
        sales_data.append({
            "order_id": str(s.get('sale_id', 'Unknown')),
            "date": str(s.get('timestamp', datetime.now().isoformat())),
            "customer_id": "CUST-LIVE",
            "product": str(p_info.get('name', 'Unknown')),
            "category": "General",
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
        print("No sales records found in DynamoDB. AI service will fall back to empty dataset.")

if __name__ == "__main__":
    try:
        if not AWS_ACCESS_KEY or not AWS_SECRET_KEY:
            print("AWS Credentials missing. Skipping sync and using build-time data.")
        else:
            sync()
    except Exception as e:
        print(f"Sync failed: {e}")
        print("Continuing with existing data...")
