import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from datetime import datetime

def train_model():
    print("Initializing Intelligent Financial ML Training...")
    
    if not os.path.exists("data/sales.csv"):
        print("Required data missing. Aborting training.")
        return

    df = pd.read_csv("data/sales.csv")
    df['date'] = pd.to_datetime(df['date'])
    
    # We want to predict Daily Revenue per product for accurate business forecasting
    daily_df = df.groupby([df['date'].dt.date, 'product']).agg(
        daily_sales=('sales', 'sum'),
        daily_revenue=('price', 'sum')
    ).reset_index()
    
    daily_df['date'] = pd.to_datetime(daily_df['date'])
    
    # Feature Engineering
    daily_df['month_sin'] = np.sin(2 * np.pi * daily_df['date'].dt.month / 12)
    daily_df['month_cos'] = np.cos(2 * np.pi * daily_df['date'].dt.month / 12)
    daily_df['day_sin'] = np.sin(2 * np.pi * daily_df['date'].dt.dayofweek / 7)
    daily_df['day_cos'] = np.cos(2 * np.pi * daily_df['date'].dt.dayofweek / 7)
    daily_df['is_weekend'] = (daily_df['date'].dt.dayofweek >= 5).astype(int)
    
    le = LabelEncoder()
    daily_df['product_encoded'] = le.fit_transform(daily_df['product'])
    
    features = ['product_encoded', 'month_sin', 'month_cos', 'day_sin', 'day_cos', 'is_weekend']
    X = daily_df[features]
    y_revenue = daily_df['daily_revenue']
    
    # Model configuration for financial scale data
    model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X, y_revenue)
    
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/model.pkl")
    joblib.dump(le, "models/label_encoder.pkl")
    
    print(f"Training Complete. Model saved for {len(le.classes_)} electrical appliances.")

if __name__ == "__main__":
    train_model()
