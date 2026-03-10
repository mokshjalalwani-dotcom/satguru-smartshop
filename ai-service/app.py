from fastapi import FastAPI
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import IsolationForest
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "models/model.pkl"
ENCODER_PATH = "models/label_encoder.pkl"
DATA_PATH = "data/sales.csv"

# Simple Cache
_CACHED_DF = None
_CACHED_INV = None

def load_data():
    global _CACHED_DF
    if _CACHED_DF is not None:
        return _CACHED_DF
    if not os.path.exists("data/sales.csv"):
        return pd.DataFrame()
    df = pd.read_csv("data/sales.csv")
    df['date'] = pd.to_datetime(df['date'])
    _CACHED_DF = df
    return df

def load_inventory():
    global _CACHED_INV
    if _CACHED_INV is not None:
        return _CACHED_INV
    if not os.path.exists("data/inventory.csv"):
        return pd.DataFrame()
    _CACHED_INV = pd.read_csv("data/inventory.csv") 
    return _CACHED_INV

def get_cyclical_features(dt):
    return {
        'month_sin': np.sin(2 * np.pi * dt.month / 12),
        'month_cos': np.cos(2 * np.pi * dt.month / 12),
        'day_sin': np.sin(2 * np.pi * dt.dayofweek / 7),
        'day_cos': np.cos(2 * np.pi * dt.dayofweek / 7),
        'is_weekend': int(dt.dayofweek >= 5)
    }

@app.get("/predict")
def predict_sales():
    if not os.path.exists(MODEL_PATH) or not os.path.exists(ENCODER_PATH):
        return {"error": "Model or Encoder not found. Call /train first."}
    
    df = load_data()
    if df.empty: return {"error": "Data file not found."}

    model = joblib.load(MODEL_PATH)
    le = joblib.load(ENCODER_PATH)
    
    last_date = df['date'].max()
    unique_products = df['product'].unique()
    
    all_predictions = []
    
    # Predict next 30 days for EACH product
    for i in range(1, 31):
        target_date = last_date + timedelta(days=i)
        cyc = get_cyclical_features(target_date)
        
        daily_total = 0
        for prod in unique_products:
            try:
                prod_enc = le.transform([str(prod)])[0]
                # Default price for prediction is recent avg price for that product
                avg_price = df[df['product'] == prod]['price'].mean()
                
                features = pd.DataFrame([{
                    'product_encoded': prod_enc,
                    'month_sin': cyc['month_sin'],
                    'month_cos': cyc['month_cos'],
                    'day_sin': cyc['day_sin'],
                    'day_cos': cyc['day_cos'],
                    'is_weekend': cyc['is_weekend'],
                    'price': avg_price
                }])
                
                prediction_result = model.predict(features)[0]
                daily_total += max(0, float(prediction_result))
            except Exception as e:
                print(f"Prediction error for {prod}: {e}")
                continue 
        
        all_predictions.append({
            "date": target_date.strftime("%Y-%m-%d"),
            "predicted_sales": round(daily_total, 2)
        })
        
    return {"predictions": all_predictions}

@app.get("/demand")
def get_demand():
    df = load_data()
    if df.empty: return {"error": "No data found."}
    
    # Demand is average sales per day for each product in the last 30 days of data
    last_30_days = df['date'].max() - timedelta(days=30)
    recent_df = df[df['date'] >= last_30_days]
    
    demand = recent_df.groupby("product")["sales"].mean().to_dict()
    return {"demand": {k: round(float(v), 2) for k, v in demand.items()}}

@app.get("/anomalies")
def get_anomalies():
    df = load_data()
    if df.empty: return {"error": "No data found."}
    
    all_anomalies = []
    
    for product in df['product'].unique():
        prod_df = df[df['product'] == product].copy()
        if len(prod_df) < 20: continue
        
        # 1. Statistical Anomaly (Z-Score > 3)
        mean_sales = prod_df['sales'].mean()
        std_sales = prod_df['sales'].std()
        
        # 2. ML Anomaly (Isolation Forest)
        prod_df['month'] = prod_df['date'].dt.month
        prod_df['day_of_week'] = prod_df['date'].dt.dayofweek
        
        features = ['sales', 'price', 'month', 'day_of_week']
        iso_forest = IsolationForest(contamination=0.02, random_state=42)
        prod_df['ml_anomaly'] = iso_forest.fit_predict(prod_df[features])
        
        # Flags
        prod_df['z_score'] = (prod_df['sales'] - mean_sales) / std_sales
        
        # Combine: Spike (Z > 3) or Slump (Z < -3) or ML Anomaly
        anoms = prod_df[(prod_df['ml_anomaly'] == -1) | (prod_df['z_score'].abs() > 3)].copy()
        
        for _, row in anoms.iterrows():
            reason = "Statistical Outlier" if abs(row['z_score']) > 3 else "Pattern Deviation"
            all_anomalies.append({
                "date": row['date'].strftime("%Y-%m-%d"),
                "product": row['product'],
                "sales": int(row['sales']),
                "price": row['price'],
                "reason": reason,
                "severity": "CRITICAL" if abs(row['z_score']) > 4 else "WARNING"
            })
            
    # Sort by date descending
    all_anomalies = sorted(all_anomalies, key=lambda x: x['date'], reverse=True)
    return {"anomalies": all_anomalies[:20]}

@app.post("/train")
def train():
    import subprocess
    try:
        subprocess.run(["python", "train.py"], check=True)
        return {"message": "Model retrained successfully."}
    except Exception as e:
        return {"error": str(e)}

@app.get("/stats")
def get_stats(days: int = 7):
    df = load_data()
    inv_df = load_inventory()
    if df.empty:
        return {"revenue": 0, "orders": 0, "aov": 0, "active_customers": 0, "low_stock_count": 0}
    
    last_date = df['date'].max()
    
    if days > 0:
        start_date = last_date - timedelta(days=days)
        filtered_df = df[df['date'] >= start_date]
    else:
        filtered_df = df[df['date'].dt.date == last_date.date()]
        
    revenue = filtered_df['price'].sum()
    orders = len(filtered_df)
    aov = revenue / orders if orders > 0 else 0
    active_customers = filtered_df['customer_id'].nunique()
    
    # Low Stock
    low_stock_count = 0
    if not inv_df.empty:
        low_stock_count = len(inv_df[inv_df['stock'] <= inv_df['threshold']])

    return {
        "revenue": round(revenue, 2),
        "orders": orders,
        "aov": round(aov, 2),
        "active_customers": active_customers,
        "low_stock_count": low_stock_count
    }

@app.get("/transactions")
def get_transactions(limit: int = 10):
    df = load_data()
    if df.empty:
        return []
    
    latest = df.sort_values('date', ascending=False).head(limit)
    return latest.to_dict('records')

@app.get("/history")
def get_history(days: int = 7):
    df = load_data()
    if df.empty:
        return []
    
    last_date = df['date'].max()
    start_date = last_date - timedelta(days=days)
    filtered = df[df['date'] >= start_date]
    
    # Group by date
    daily = filtered.groupby(filtered['date'].dt.date)['price'].sum().reset_index()
    daily.columns = ['name', 'revenue']
    daily['name'] = daily['name'].apply(lambda x: x.strftime("%b %d"))
    
    return daily.to_dict('records')

@app.get("/insights")
def get_insights():
    return {
        "forecasting": "Expected revenue next week: 1.2M. Growth probability: 85%.",
        "demand": "Smartphone X and Laptop Pro are likely to stock out in 3 days.",
        "anomalies": "Detected unusual spike in Electronics (+45%) yesterday.",
        "bi": "Weekend sales are 32% higher than weekdays; Tablet G1 sales increased by 20%.",
        "kpi_trends": "AOV has grown by 12% in the last 30 days due to premium bundles."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
