import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, IsolationForest

def detect_point_anomalies(daily_sales_df, threshold=3.0):
    """
    Detects single unusually high/low days using Z-Score.
    """
    if daily_sales_df.empty or len(daily_sales_df) < 5:
        return []

    mean_rev = daily_sales_df['revenue'].mean()
    std_rev = daily_sales_df['revenue'].std()
    
    if std_rev == 0:
        return []

    daily_sales_df['z_score'] = (daily_sales_df['revenue'] - mean_rev) / std_rev
    anomalies = daily_sales_df[np.abs(daily_sales_df['z_score']) > threshold]
    
    results = []
    for _, row in anomalies.iterrows():
        results.append({
            "type": "point_anomaly",
            "date": row['date'].strftime('%Y-%m-%d') if pd.api.types.is_datetime64_any_dtype(row['date']) else str(row['date']),
            "actual_value": float(row['revenue']),
            "expected_value": float(mean_rev),
            "severity": "CRITICAL" if abs(row['z_score']) > 4.0 else "WARNING",
            "features": [f"z_score: {row['z_score']:.2f}"]
        })
    return results

def detect_multivariate_anomalies(transactions_df, contamination=0.02):
    """
    Detects abnormal patterns (e.g., price vs sales volume mismatch).
    """
    if transactions_df.empty or len(transactions_df) < 20: 
        return []

    features = ['price', 'sales'] # Using 'sales' as quantity in this dataset
    available_features = [f for f in features if f in transactions_df.columns]
    
    if len(available_features) < 2:
        return []

    model = IsolationForest(contamination=contamination, random_state=42)
    # Using a copy to avoid SettingWithCopyWarning
    df_eval = transactions_df.copy()
    
    # Fill NAs
    for col in available_features:
        df_eval[col] = df_eval[col].fillna(df_eval[col].median())

    df_eval['anomaly_score'] = model.fit_predict(df_eval[available_features])
    
    # -1 means anomaly
    anomalies = df_eval[df_eval['anomaly_score'] == -1]
    
    results = []
    # Limit to top anomalies if too many
    if len(anomalies) > 50:
        anomalies = anomalies.head(50)

    for _, row in anomalies.iterrows():
        results.append({
            "type": "multivariate_anomaly",
            "product_name": str(row.get('product', 'Unknown')),
            "actual_value": float(row.get('sales', 0)),
            "severity": "WARNING",
            "likely_cause": "Unusual price/volume combination"
        })
    return results

def forecast_next_period(historical_df, days_to_predict=30):
    """
    Forecasts total revenue for the next N days.
    historical_df needs columns: 'date' and 'revenue'
    """
    if historical_df.empty or len(historical_df) < 7:
        return {
            "predicted_total": 0,
            "confidence_interval": {"lower": 0, "upper": 0},
            "metrics": {"mae": 0, "rmse": 0},
            "trend_percent_change": 0,
            "daily_forecasts": []
        }

    df = historical_df.copy()
    if not pd.api.types.is_datetime64_any_dtype(df['date']):
         df['date'] = pd.to_datetime(df['date'])
    
    df['dayofyear'] = df['date'].dt.dayofyear
    df['dayofweek'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    
    X = df[['dayofyear', 'dayofweek', 'month']]
    y = df['revenue']
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    last_date = df['date'].max()
    future_dates = [last_date + pd.Timedelta(days=i) for i in range(1, days_to_predict + 1)]
    
    future_X = pd.DataFrame({
        'dayofyear': [d.dayofyear for d in future_dates],
        'dayofweek': [d.dayofweek for d in future_dates],
        'month': [d.month for d in future_dates]
    })
    
    predictions = model.predict(future_X)
    
    # Estimate simple confidence interval (using std of residuals)
    residuals = y - model.predict(X)
    std_resid = residuals.std()
    
    total_predicted = predictions.sum()
    
    # Calculate naive trend % change 
    # Compare predicted total vs last `days_to_predict` actual total
    recent_actuals = y.tail(min(days_to_predict, len(y))).sum()
    trend_pct = 0
    if recent_actuals > 0:
        trend_pct = ((total_predicted - recent_actuals) / recent_actuals) * 100

    return {
        "predicted_total": round(float(total_predicted), 2),
        "confidence_interval": {
            "lower": round(float(total_predicted - (1.96 * std_resid * np.sqrt(days_to_predict))), 2),
            "upper": round(float(total_predicted + (1.96 * std_resid * np.sqrt(days_to_predict))), 2)
        },
        "metrics": {
            "mae": round(float(np.abs(residuals).mean()), 2),
            "rmse": round(float(np.sqrt((residuals**2).mean())), 2)
        },
        "trend_percent_change": round(float(trend_pct), 2),
        "daily_forecasts": [
            {"date": d.strftime("%Y-%m-%d"), "predicted_revenue": round(float(p), 2)}
            for d, p in zip(future_dates, predictions)
        ]
    }

def calculate_stockout_risk(inventory_df, recent_sales_df):
    """
    Calculates Days to Stockout and Reorder Suggestions based on sales velocity and lead times.
    """
    results = []
    
    if inventory_df.empty: return results
    
    # Calculate velocity map (sales per day over last 30 days)
    velocity_map = {}
    if not recent_sales_df.empty:
        # Assuming recent_sales_df is already filtered for last X days (e.g. 30)
        days_in_period = max((recent_sales_df['date'].max() - recent_sales_df['date'].min()).days, 1)
        if days_in_period == 0: days_in_period = 1
        product_totals = recent_sales_df.groupby('product')['sales'].sum().to_dict()
        velocity_map = {k: v / days_in_period for k, v in product_totals.items()}
    
    for _, row in inventory_df.iterrows():
        prod = row['product']
        stock = float(row.get('stock', 0))
        lead_time = float(row.get('lead_time_days', 7))
        threshold = float(row.get('threshold', 10))
        price = float(row.get('price', 0))
        
        velocity = velocity_map.get(prod, 0.5) # Default 0.5 units/day if no history
        if velocity <= 0: velocity = 0.1
        
        days_to_stockout = stock / velocity
        
        # Urgent flag: if days left < lead time
        is_urgent = days_to_stockout <= lead_time
        status = "Healthy"
        if is_urgent or stock <= threshold:
            status = "Critical"
        elif days_to_stockout <= lead_time + 7:
             status = "Low Stock"
             
        suggested_qty = max(0, int((velocity * (lead_time + 14)) - stock)) # order for 14 days buffer
        if suggested_qty < threshold: 
            suggested_qty = int(threshold * 1.5)
            
        results.append({
            "product_id": f"P-{str(hash(prod))[-4:]}",
            "product_name": prod,
            "current_stock": int(stock),
            "threshold": int(threshold),
            "sales_velocity_per_day": round(float(velocity), 2),
            "days_to_stockout": int(days_to_stockout),
            "lead_time_days": int(lead_time),
            "urgent_flag": is_urgent,
            "status": status,
            "suggested_reorder_qty": int(suggested_qty),
            "price": price,
            "trend": f"{'+' if velocity > 1 else ''}{int(velocity * 10)}%"  # Dummy trend representation
        })
        
    return results
