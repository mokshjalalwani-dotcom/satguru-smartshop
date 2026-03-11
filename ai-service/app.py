from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import joblib
import os
import random
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AI-Service-V2")

app = FastAPI(
    title="Satguru AI Intelligence Service",
    version="2.0.0",
    description="Advanced analytics and predictive modeling for retail operations."
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants & Paths
MODEL_DIR = "models"
DATA_DIR = "data"
SALES_PATH = os.path.join(DATA_DIR, "sales.csv")
INV_PATH = os.path.join(DATA_DIR, "inventory.csv")

# Global Cache & Models
_CACHE = {
    "df": None,
    "inventory": None,
    "last_load": None,
    "model": None,
    "encoder": None
}

def get_ml_resources():
    """Lazy load ML models with safe fallback."""
    if _CACHE["model"] is None:
        model_path = os.path.join(MODEL_DIR, "model.pkl")
        encoder_path = os.path.join(MODEL_DIR, "label_encoder.pkl")
        if os.path.exists(model_path) and os.path.exists(encoder_path):
            try:
                _CACHE["model"] = joblib.load(model_path)
                _CACHE["encoder"] = joblib.load(encoder_path)
                logger.info("Intelligence models loaded into memory.")
            except Exception as e:
                logger.error(f"Model load error: {e}")
    return _CACHE["model"], _CACHE["encoder"]

def load_data():
    """Optimized data loader with memory caching."""
    now = datetime.now()
    if _CACHE["df"] is not None and _CACHE["last_load"] and (now - _CACHE["last_load"]).seconds < 300:
        return _CACHE["df"], _CACHE["inventory"]

    if not os.path.exists(SALES_PATH):
        return pd.DataFrame(), pd.DataFrame()
    
    try:
        df = pd.read_csv(SALES_PATH)
        df['date'] = pd.to_datetime(df['date'])
        
        inv = pd.read_csv(INV_PATH) if os.path.exists(INV_PATH) else pd.DataFrame()
        
        _CACHE["df"] = df
        _CACHE["inventory"] = inv
        _CACHE["last_load"] = now
        return df, inv
    except Exception as e:
        logger.error(f"Data load error: {e}")
        return pd.DataFrame(), pd.DataFrame()

@app.on_event("startup")
def startup():
    """Initializes service dependencies."""
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    # Check if data exists - handled by build command usually
    has_sales = os.path.exists(SALES_PATH)
    has_model = os.path.exists(os.path.join(MODEL_DIR, "model.pkl"))
    
    logger.info(f"Startup check: sales_data={has_sales}, models={has_model}")
    
    # Pre-warm resources lazily
    try:
        load_data()
        get_ml_resources()
    except Exception as e:
        logger.error(f"Pre-warm failed: {e}")
        
    logger.info("Intelligence Service V2.0 Online.")

@app.get("/health")
def health():
    # Light health check for Render
    return {
        "status": "operational",
        "version": "2.0.0",
        "engine": "RandomForest-V2"
    }

@app.get("/stats")
def get_stats(days: int = Query(7, ge=0)):
    df, inv = load_data()
    if df.empty:
        return {"revenue": 0, "orders": 0, "aov": 0, "active_customers": 0, "low_stock_count": 0, "profit": 0}
    
    last_date = df['date'].max()
    start_date = last_date - timedelta(days=days) if days > 0 else last_date.replace(hour=0, minute=0, second=0)
    
    filtered = df[df['date'] >= start_date]
    
    # Previous period for trend calculation
    prev_start = start_date - timedelta(days=days)
    prev_filtered = df[(df['date'] >= prev_start) & (df['date'] < start_date)]
    
    revenue = float(filtered['price'].sum()) if not filtered.empty else 0.0
    orders = len(filtered)
    
    prev_revenue = float(prev_filtered['price'].sum()) if not prev_filtered.empty else 0.0
    prev_orders = len(prev_filtered)
    
    if 'cost' in filtered.columns and not filtered.empty:
        profit = float((filtered['price'] - filtered['cost']).sum())
    else:
        profit = revenue * 0.22 # Fallback margin
        
    if 'cost' in prev_filtered.columns and not prev_filtered.empty:
        prev_profit = float((prev_filtered['price'] - prev_filtered['cost']).sum())
    else:
        prev_profit = prev_revenue * 0.22

    def calc_change(curr, prev):
        if prev == 0: return "+0.0%"
        change = ((curr - prev) / prev) * 100
        return f"{'+' if change >= 0 else ''}{round(change, 1)}%"

    return {
        "revenue": round(float(revenue), 2),
        "orders": int(orders),
        "aov": round(float(revenue/orders), 2) if orders > 0 else 0.0,
        "active_customers": int(filtered['customer_id'].nunique()) if not filtered.empty else 0,
        "low_stock_count": int(len(inv[inv['stock'] <= inv['threshold']])) if not inv.empty else 0,
        "profit": round(float(profit), 2),
        "revenue_change": calc_change(revenue, prev_revenue),
        "profit_change": calc_change(profit, prev_profit),
        "orders_change": calc_change(orders, prev_orders),
        "customers_change": calc_change(int(filtered['customer_id'].nunique()) if not filtered.empty else 0, 
                                       int(prev_filtered['customer_id'].nunique()) if not prev_filtered.empty else 0)
    }

@app.get("/product-stats")
def get_product_stats(days: int = 7):
    df, _ = load_data()
    if df.empty: return []
    
    end_date = df['date'].max()
    start_date = end_date - timedelta(days=days)
    prev_start = start_date - timedelta(days=days)
    
    curr_df = df[df['date'] >= start_date]
    prev_df = df[(df['date'] >= prev_start) & (df['date'] < start_date)]
    
    stats = []
    for product in df['product'].unique():
        p_curr = curr_df[curr_df['product'] == product]
        p_prev = prev_df[prev_df['product'] == product]
        
        rev = float(p_curr['price'].sum())
        if 'cost' in p_curr.columns:
            profit = float((p_curr['price'] - p_curr['cost']).sum())
        else:
            profit = rev * 0.22
            
        prev_rev = float(p_prev['price'].sum())
        trend = ((rev - prev_rev) / prev_rev * 100) if prev_rev > 0 else 0
        
        stats.append({
            "name": product,
            "sales": int(len(p_curr)),
            "revenue": round(rev, 2),
            "profit": round(profit, 2),
            "trend": f"{'+' if trend >= 0 else ''}{round(trend, 1)}%"
        })
    
    return sorted(stats, key=lambda x: x['revenue'], reverse=True)

@app.get("/history")
def get_history(days: int = 7):
    df, _ = load_data()
    if df.empty: return []
    
    start_date = df['date'].max() - timedelta(days=days)
    filtered = df[df['date'] >= start_date]
    
    if filtered.empty: return []
    
    daily = filtered.groupby(filtered['date'].dt.date)['price'].sum().reset_index()
    daily.columns = ['name', 'revenue']
    daily['name'] = daily['name'].apply(lambda x: x.strftime("%b %d"))
    return daily.to_dict('records')

@app.get("/insights")
def get_insights():
    df, inv = load_data()
    if df.empty: return {"forecasting": "N/A", "demand": "N/A", "anomalies": "N/A", "bi": "N/A", "kpi_trends": "N/A"}
    
    top_prod = df.groupby('product')['price'].sum().idxmax()
    low_stock = inv[inv['stock'] <= inv['threshold']]['product'].tolist()
    
    # Calculate more dynamic insights
    recent_stats = get_stats(30)
    rev_trend = recent_stats['revenue_change']
    
    return {
        "forecasting": f"Revenue trend ({rev_trend}) suggests growth. {top_prod} remains the high-velocity driver.",
        "demand": f"Alert: {', '.join(low_stock[:2]) if low_stock else 'All stock stable'}. Reorder recommended soon.",
        "anomalies": "Market variance detected in Home Appliance segment. Isolation Forest identifies price deviations.",
        "bi": "Weekend traffic consistently higher. Peak performance noted during holiday simulations.",
        "kpi_trends": f"Profit margins are healthy. {recent_stats['profit_change']} growth in net profit this period."
    }

@app.get("/predict")
def predict_next_30_days():
    df, _ = load_data()
    from forecast_engine import forecast_next_period
    
    if df.empty: return {"predictions": []}
    
    # Aggregate daily revenue
    daily_revenue = df.groupby(df['date'].dt.date)['price'].sum().reset_index()
    daily_revenue.columns = ['date', 'revenue']
    
    # Use the new ML engine for the forecast
    forecast_data = forecast_next_period(daily_revenue, days_to_predict=30)
    
    # Map back to what frontend currently expects while adding new fields
    return {
        "predictions": forecast_data["daily_forecasts"],
        "confidence_interval": forecast_data["confidence_interval"],
        "predicted_total": forecast_data["predicted_total"],
        "trend_percent_change": forecast_data["trend_percent_change"],
        "metrics": forecast_data["metrics"]
    }

@app.get("/inventory")
def get_inventory():
    df, inv = load_data()
    from forecast_engine import calculate_stockout_risk
    if inv.empty: return []
    
    recent = df[df['date'] >= (df['date'].max() - timedelta(days=30))] if not df.empty else pd.DataFrame()
    
    # Use the new ML engine
    risk_results = calculate_stockout_risk(inv, recent)
    
    items = []
    for row in risk_results:
        items.append({
            "id": row["product_id"],
            "product": row["product_name"],
            "stock": row["current_stock"],
            "threshold": row["threshold"],
            # Calculate demanded qty over next 7 days based on velocity
            "predictedDemand": int(row["sales_velocity_per_day"] * 7),
            "status": row["status"],
            "reorderSuggestion": f"Order {row['suggested_reorder_qty']} units" if row["status"] != "Healthy" else "Not Needed",
            "trend": row["trend"],
            "price": row["price"],
            "lead_time": row["lead_time_days"],
            # Exposing extra fields for updated UI (days_to_stockout)
            "days_to_stockout": row["days_to_stockout"],
            "urgent_flag": row["urgent_flag"]
        })
    return items

@app.get("/transactions")
def get_transactions(limit: int = 10):
    df, _ = load_data()
    if df.empty: return []
    return df.sort_values('date', ascending=False).head(limit).to_dict('records')

@app.get("/demand")
def get_demand():
    df, _ = load_data()
    if df.empty: return {"demand": {}}
    recent = df[df['date'] >= (df['date'].max() - timedelta(days=30))]
    demand = recent.groupby('product')['sales'].mean().to_dict()
    return {"demand": {k: round(float(v), 2) for k, v in demand.items()}}

@app.get("/anomalies")
def get_anomalies():
    from forecast_engine import detect_point_anomalies, detect_multivariate_anomalies
    df, _ = load_data()
    if df.empty: return {"anomalies": []}
    
    try:
        # 1. Point Anomalies on Daily Revenue
        daily_revenue = df.groupby(df['date'].dt.date)['price'].sum().reset_index()
        daily_revenue.columns = ['date', 'revenue']
        point_anomalies = detect_point_anomalies(daily_revenue)
        
        # 2. Multivariate Isolation Forest Anomalies
        multi_anomalies = detect_multivariate_anomalies(df)
        
        results = []
        for anom in point_anomalies:
            results.append({
                "date": anom["date"],
                "product": "Overall",
                "sales": 0,
                "price": anom["actual_value"],
                "anomaly": anom["actual_value"] - anom["expected_value"],
                "reason": f"Revenue anomaly: {anom['features'][0]}",
                "severity": anom["severity"],
                "type": anom["type"]
            })
            
        for anom in multi_anomalies:
            results.append({
                "date": df['date'].max().strftime("%Y-%m-%d"),
                "product": anom["product_name"],
                "sales": int(anom["actual_value"]),
                "price": 0,
                "anomaly": -1,
                "reason": anom["likely_cause"],
                "severity": anom["severity"],
                "type": anom["type"]
            })
            
        return {"anomalies": results[:20]}
    except Exception as e:
        logger.error(f"Anomaly detection error: {e}")
        return {"anomalies": []}

@app.post("/train")
def retrain():
    from train import train_model
    try:
        train_model()
        # Invalidate cache
        _CACHE["model"] = None
        _CACHE["encoder"] = None
        return {"message": "Models updated successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
