import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from datetime import datetime

def train_model():
    print("Initializing Model Training...")
    
    if not os.path.exists("data/sales.csv"):
        print("Required data missing. Aborting training.")
        return

    df = pd.read_csv("data/sales.csv")
    df['date'] = pd.to_datetime(df['date'])
    
    # Feature Engineering
    df['month_sin'] = np.sin(2 * np.pi * df['date'].dt.month / 12)
    df['month_cos'] = np.cos(2 * np.pi * df['date'].dt.month / 12)
    df['day_sin'] = np.sin(2 * np.pi * df['date'].dt.dayofweek / 7)
    df['day_cos'] = np.cos(2 * np.pi * df['date'].dt.dayofweek / 7)
    df['is_weekend'] = (df['date'].dt.dayofweek >= 5).astype(int)
    
    # Target: Weekly aggregate sales per product
    # For this simplified intelligence service, we train on transaction-level price/volume correlations
    
    le = LabelEncoder()
    df['product_encoded'] = le.fit_transform(df['product'])
    
    features = ['product_encoded', 'month_sin', 'month_cos', 'day_sin', 'day_cos', 'is_weekend', 'price']
    X = df[features]
    y = df['sales']
    
    # We use a Regressor to predict "probability/volume" of sales
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/model.pkl")
    joblib.dump(le, "models/label_encoder.pkl")
    
    print(f"Training Complete. Model saved with {len(features)} features.")

if __name__ == "__main__":
    train_model()
