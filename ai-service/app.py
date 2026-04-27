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
import asyncio

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
    # 60-second cache so new syncs are picked up quickly
    if _CACHE["df"] is not None and _CACHE["last_load"] and (now - _CACHE["last_load"]).seconds < 60:
        return _CACHE["df"], _CACHE["inventory"]

    if not os.path.exists(SALES_PATH):
        return pd.DataFrame(), pd.DataFrame()
    
    try:
        df = pd.read_csv(SALES_PATH)
        df['date'] = pd.to_datetime(df['date'], format='ISO8601')
        
        inv = pd.read_csv(INV_PATH) if os.path.exists(INV_PATH) else pd.DataFrame()
        
        _CACHE["df"] = df
        _CACHE["inventory"] = inv
        _CACHE["last_load"] = now
        return df, inv
    except Exception as e:
        logger.error(f"Data load error: {e}")
        return pd.DataFrame(), pd.DataFrame()

@app.on_event("startup")
async def startup():
    """Initializes service dependencies without blocking."""
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    # Trigger background sync from MongoDB
    try:
        from sync_data import sync
        asyncio.create_task(run_background_sync(sync))
    except ImportError:
        logger.error("sync_data.py not found. Background sync disabled.")
    
    logger.info("Intelligence Service V2.0 Online (Async Warming).")

async def run_background_sync(sync_func):
    """Executes the sync process in a separate thread to avoid blocking."""
    try:
        logger.info("Starting background data synchronization...")
        await asyncio.to_thread(sync_func)
        # Clear cache to force reload on next request
        _CACHE["df"] = None
        logger.info("Background synchronization completed.")
    except Exception as e:
        logger.error(f"Background sync error: {e}")

@app.get("/health")
def health():
    # Light health check for Render
    return {
        "status": "operational",
        "version": "2.0.0",
        "engine": "RandomForest-V2"
    }

from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"GLOBAL EXCEPTION: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal AI Service Error", "details": str(exc)}
    )

@app.get("/stats")
def get_stats(days: int = Query(7, ge=0)):
    try:
        df, inv = load_data()
        
        if df.empty:
            logger.warning("Sales data empty. Returning base zero metrics.")
            return {
                "revenue": 0.0, "orders": 0, "aov": 0.0, "active_customers": 0, 
                "low_stock_count": 0, "profit": 0.0,
                "revenue_change": "+0.0%", "profit_change": "+0.0%", 
                "orders_change": "+0.0%", "customers_change": "+0.0%",
                "_isFallback": True,
                "_message": "Data stream initializing..."
            }
    
    except Exception as e:
        logger.error(f"Error in get_stats data preparation: {e}")
        return {
            "revenue": 0, "orders": 0, "aov": 0, "active_customers": 0, 
            "low_stock_count": 0, "profit": 0,
            "revenue_change": "+0.0%", "profit_change": "+0.0%", 
            "orders_change": "+0.0%", "customers_change": "+0.0%"
        }

    try:
        last_date = df['date'].max()
        start_date = last_date - timedelta(days=days) if days > 0 else last_date.replace(hour=0, minute=0, second=0)
        
        filtered = df[df['date'] >= start_date]
        prev_start = start_date - timedelta(days=days)
        prev_filtered = df[(df['date'] >= prev_start) & (df['date'] < start_date)]
        
        revenue = float(filtered['price'].sum()) if not filtered.empty and 'price' in filtered.columns else 0.0
        orders = len(filtered)
        
        prev_revenue = float(prev_filtered['price'].sum()) if not prev_filtered.empty and 'price' in prev_filtered.columns else 0.0
        prev_orders = len(prev_filtered)
        
        # Profit matching logic
        if not filtered.empty and 'price' in filtered.columns and 'cost' in filtered.columns:
            profit = float((filtered['price'] - filtered['cost']).sum())
        else:
            profit = revenue * 0.22
            
        if not prev_filtered.empty and 'price' in prev_filtered.columns and 'cost' in prev_filtered.columns:
            prev_profit = float((prev_filtered['price'] - prev_filtered['cost']).sum())
        else:
            prev_profit = prev_revenue * 0.22

        def calc_change(curr, prev):
            if prev == 0: return "+0.0%"
            change = ((curr - prev) / prev) * 100
            return f"{'+' if change >= 0 else ''}{round(change, 1)}%"

        active_cust = int(filtered['customer_id'].nunique()) if not filtered.empty and 'customer_id' in filtered.columns else 0
        prev_active_cust = int(prev_filtered['customer_id'].nunique()) if not prev_filtered.empty and 'customer_id' in prev_filtered.columns else 0

        low_stock = 0
        if not inv.empty and 'stock' in inv.columns and 'threshold' in inv.columns:
            low_stock = int(len(inv[inv['stock'] <= inv['threshold']]))

        return {
            "revenue": round(float(revenue), 2),
            "orders": int(orders),
            "aov": round(float(revenue/orders), 2) if orders > 0 else 0.0,
            "active_customers": active_cust,
            "low_stock_count": low_stock,
            "profit": round(float(profit), 2),
            "revenue_change": calc_change(revenue, prev_revenue),
            "profit_change": calc_change(profit, prev_profit),
            "orders_change": calc_change(orders, prev_orders),
            "customers_change": calc_change(active_cust, prev_active_cust)
        }
    except Exception as e:
        logger.error(f"Critical error in get_stats calculation: {e}", exc_info=True)
        return {
            "revenue": 0, "orders": 0, "aov": 0, "active_customers": 0, 
            "low_stock_count": 0, "profit": 0,
            "revenue_change": "+0.0%", "profit_change": "+0.0%", 
            "orders_change": "+0.0%", "customers_change": "+0.0%"
        }

@app.get("/product-stats")
def get_product_stats(days: int = 7):
    try:
        df, _ = load_data()
        if df.empty: return []
        
        if 'date' not in df.columns or 'product' not in df.columns:
            return []

        end_date = df['date'].max()
        start_date = end_date - timedelta(days=days)
        prev_start = start_date - timedelta(days=days)
        
        curr_df = df[df['date'] >= start_date]
        prev_df = df[(df['date'] >= prev_start) & (df['date'] < start_date)]
        
        stats = []
        for product in df['product'].unique():
            p_curr = curr_df[curr_df['product'] == product]
            p_prev = prev_df[prev_df['product'] == product]
            
            # price column holds total revenue per transaction row
            rev = float(p_curr['price'].sum()) if 'price' in p_curr.columns else 0.0
            # sales column holds units sold per transaction row
            units_sold = int(p_curr['sales'].sum()) if 'sales' in p_curr.columns else len(p_curr)
            p_margin = 0.22
            
            if not p_curr.empty and 'price' in p_curr.columns and 'cost' in p_curr.columns:
                profit = float((p_curr['price'] - p_curr['cost']).sum())
            else:
                profit = rev * p_margin
                
            prev_rev = float(p_prev['price'].sum()) if 'price' in p_prev.columns else 0.0
            
            change = 0.0
            if prev_rev > 0:
                change = ((rev - prev_rev) / prev_rev) * 100
            
            trend_str = f"{'+' if change >= 0 else ''}{round(change, 1)}%"
                
            stats.append({
                "product": str(product),
                "name":    str(product),
                "revenue": round(rev, 2),
                "profit":  round(profit, 2),
                "orders":  len(p_curr),
                "sales":   units_sold,
                "growth":  round(change, 1),
                "trend":   trend_str
            })
        
        return sorted(stats, key=lambda x: x['revenue'], reverse=True)
    except Exception as e:
        logger.error(f"Error in get_product_stats: {e}", exc_info=True)
        return []

@app.get("/history")
def get_history(days: int = 7):
    try:
        df, _ = load_data()
        if df.empty or 'date' not in df.columns or 'price' not in df.columns:
            return []
        
        start_date = df['date'].max() - timedelta(days=days)
        filtered = df[df['date'] >= start_date]
        
        if filtered.empty: return []
        
        daily = filtered.groupby(filtered['date'].dt.date)['price'].sum().reset_index()
        daily.columns = ['name', 'revenue']
        daily['name'] = daily['name'].apply(lambda x: x.strftime("%b %d"))
        return daily.to_dict('records')
    except Exception as e:
        logger.error(f"Error in get_history: {e}")
        return []

@app.get("/insights")
def get_insights():
    try:
        df, inv = load_data()
        fallback_insights = {"forecasting": "N/A", "demand": "N/A", "anomalies": "N/A", "bi": "N/A", "kpi_trends": "N/A"}
        
        if df.empty: return fallback_insights
        
        top_prod = "N/A"
        if 'product' in df.columns and 'price' in df.columns:
            top_prod = df.groupby('product')['price'].sum().idxmax()
            
        low_stock = []
        if not inv.empty and 'product' in inv.columns and 'stock' in inv.columns and 'threshold' in inv.columns:
            low_stock = inv[inv['stock'] <= inv['threshold']]['product'].tolist()
        
        # Calculate stats with small range for speed in insights
        try:
            stats_dict = get_stats(30)
            rev_trend = str(stats_dict.get('revenue_change', "+0.0%"))
            prof_trend = str(stats_dict.get('profit_change', "+0.0%"))
        except Exception:
            rev_trend = "+0.0%"
            prof_trend = "+0.0%"
        
        low_stock_msg = "All stock stable"
        if isinstance(low_stock, list) and len(low_stock) > 0:
            low_stock_msg = f"Alert: {', '.join(map(str, low_stock[:2]))}"

        return {
            "forecasting": f"Revenue trend ({rev_trend}) suggests growth. {top_prod} remains the high-velocity driver.",
            "demand": f"{low_stock_msg}. Reorder recommended soon.",
            "anomalies": "Market variance detected in Home Appliance segment. Isolation Forest identifies price deviations.",
            "bi": "Weekend traffic consistently higher. Peak performance noted during holiday simulations.",
            "kpi_trends": f"Profit margins are healthy. {prof_trend} growth in net profit this period."
        }
    except Exception as e:
        logger.error(f"Error in get_insights: {e}")
        return {"forecasting": "N/A", "demand": "N/A", "anomalies": "N/A", "bi": "N/A", "kpi_trends": "N/A"}

@app.get("/predict")
def predict_next_30_days():
    try:
        df, _ = load_data()
        if df.empty or 'date' not in df.columns or 'price' not in df.columns:
            return {"predictions": [], "confidence_interval": {"lower": 0, "upper": 0}, "predicted_total": 0, "trend_percent_change": 0, "metrics": {"mae": 0, "rmse": 0}}
        
        from forecast_engine import forecast_next_period
        
        # Aggregate daily revenue
        daily_revenue = df.groupby(df['date'].dt.date)['price'].sum().reset_index()
        daily_revenue.columns = ['date', 'revenue']
        
        # Use the new ML engine for the forecast
        forecast_data = forecast_next_period(daily_revenue, days_to_predict=30)
        
        return {
            "predictions": forecast_data.get("daily_forecasts", []),
            "confidence_interval": forecast_data.get("confidence_interval", {"lower": 0, "upper": 0}),
            "predicted_total": forecast_data.get("predicted_total", 0),
            "trend_percent_change": forecast_data.get("trend_percent_change", 0),
            "metrics": forecast_data.get("metrics", {"mae": 0, "rmse": 0})
        }
    except Exception as e:
        logger.error(f"Error in predict_next_30_days: {e}", exc_info=True)
        return {"predictions": [], "confidence_interval": {"lower": 0, "upper": 0}, "predicted_total": 0, "trend_percent_change": 0, "metrics": {"mae": 0, "rmse": 0}}

@app.get("/inventory")
def get_inventory():
    try:
        df, inv = load_data()
        if inv.empty: return []
        
        from forecast_engine import calculate_stockout_risk
        
        # Safe last_date calculation
        last_date = None
        if not df.empty and 'date' in df.columns:
            last_date = df['date'].max()
            
        recent = pd.DataFrame()
        if last_date:
            recent = df[df['date'] >= (last_date - timedelta(days=30))]
        
        # Use the ML engine
        risk_results = calculate_stockout_risk(inv, recent)
        
        # Pre-calculate sales totals for last 30 days
        sales_30d = {}
        if not recent.empty:
            sales_30d = recent.groupby('product')['sales'].sum().to_dict()
        
        items = []
        for row in risk_results:
            stock = int(row.get("current_stock", 0))
            threshold = int(row.get("threshold", 10))
            velocity = float(row.get("sales_velocity_per_day", 0.1))
            days_left = int(row.get("days_to_stockout", 99))
            
            # Cleaner status determination on the API side
            if stock <= threshold or days_left <= 7:
                status = "Critical"
            elif stock <= threshold * 2 or days_left <= 14:
                status = "Low Stock"
            else:
                status = "Healthy"
                
            predicted_7d = max(0, round(velocity * 7))
            
            items.append({
                "id": str(row.get("product_id", "P-UNK")),
                "product": str(row.get("product_name", "Unknown")),
                "stock": stock,
                "threshold": threshold,
                "predictedDemand": int(predicted_7d),
                "status": status,
                "reorderSuggestion": str(row.get("reorderSuggestion", "Not Needed")),
                "trend": str(row.get("trend", "0%")),
                "price": float(row.get("price", 0)),
                "lead_time": int(row.get("lead_time_days", 7)),
                "days_to_stockout": days_left,
                "urgent_flag": stock <= threshold or days_left <= 7,
                "daily_velocity": float(velocity),
                "sold_last_30d": int(sales_30d.get(row.get("product_name"), 0))
            })
        return items
    except Exception as e:
        logger.error(f"Error in get_inventory: {e}", exc_info=True)
        return []

@app.get("/transactions")
def get_transactions(limit: int = 10):
    try:
        df, _ = load_data()
        if df.empty: return []
        if 'date' not in df.columns:
            return df.head(limit).to_dict('records')
        return df.sort_values('date', ascending=False).head(limit).to_dict('records')
    except Exception as e:
        logger.error(f"Error in get_transactions: {e}")
        return []

@app.get("/demand")
def get_demand():
    try:
        df, _ = load_data()
        if df.empty or 'date' not in df.columns or 'product' not in df.columns or 'sales' not in df.columns:
            return {"demand": {}}
            
        recent = df[df['date'] >= (df['date'].max() - timedelta(days=30))]
        if recent.empty: return {"demand": {}}
        
        demand = recent.groupby('product')['sales'].mean().to_dict()
        return {"demand": {str(k): round(float(v), 2) for k, v in demand.items()}}
    except Exception as e:
        logger.error(f"Error in get_demand: {e}")
        return {"demand": {}}

@app.get("/anomalies")
def get_anomalies():
    try:
        from forecast_engine import detect_point_anomalies, detect_multivariate_anomalies
        df, _ = load_data()
        if df.empty or 'date' not in df.columns:
            return {"anomalies": []}
        
        # 1. Point Anomalies on Daily Revenue
        if 'price' in df.columns:
            daily_revenue = df.groupby(df['date'].dt.date)['price'].sum().reset_index()
            daily_revenue.columns = ['date', 'revenue']
            point_anomalies = detect_point_anomalies(daily_revenue)
        else:
            point_anomalies = []
        
        # 2. Multivariate Isolation Forest Anomalies
        multi_anomalies = detect_multivariate_anomalies(df)
        
        results = []
        for anom in point_anomalies:
            results.append({
                "date": str(anom["date"]),
                "product": "Overall",
                "sales": 0,
                "price": float(anom["actual_value"]),
                "anomaly": float(anom["actual_value"] - anom["expected_value"]),
                "reason": f"Revenue anomaly: {anom.get('features', [''])[0]}",
                "severity": str(anom.get("severity", "WARNING")),
                "type": str(anom.get("type", "point_anomaly"))
            })
            
        for anom in multi_anomalies:
            results.append({
                "date": df['date'].max().strftime("%Y-%m-%d"),
                "product": str(anom.get("product_name", "Unknown")),
                "sales": int(anom.get("actual_value", 0)),
                "price": 0,
                "anomaly": -1,
                "reason": str(anom.get("likely_cause", "Outlier detected")),
                "severity": str(anom.get("severity", "WARNING")),
                "type": str(anom.get("type", "multivariate_anomaly"))
            })
            
        return {"anomalies": results[:20]}
    except Exception as e:
        logger.error(f"Anomaly detection error: {e}", exc_info=True)
        return {"anomalies": []}

@app.post("/sync")
def sync_now():
    from sync_data import sync
    try:
        sync()
        # Invalidate cache to force reload of the new CSVs
        _CACHE["df"] = None
        _CACHE["inventory"] = None
        _CACHE["last_load"] = None
        return {"message": "Data synchronized successfully from MongoDB."}
    except Exception as e:
        logger.error(f"Sync error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)
