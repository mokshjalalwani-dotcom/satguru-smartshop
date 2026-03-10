import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
import os

def train_model():
    # Load dataset
    data_path = "data/sales.csv"
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return

    df = pd.read_csv(data_path)
    df['date'] = pd.to_datetime(df['date'])
    
    # Feature engineering
    le = LabelEncoder()
    df['product_encoded'] = le.fit_transform(df['product'])
    
    # Cyclical features for month and day to capture seasonality correctly
    df['month_sin'] = np.sin(2 * np.pi * df['date'].dt.month / 12)
    df['month_cos'] = np.cos(2 * np.pi * df['date'].dt.month / 12)
    df['day_sin'] = np.sin(2 * np.pi * df['date'].dt.dayofweek / 7)
    df['day_cos'] = np.cos(2 * np.pi * df['date'].dt.dayofweek / 7)
    df['is_weekend'] = df['date'].dt.dayofweek >= 5
    
    # Target: Sales
    # Features: encoded product, month (cyclical), day of week (cyclical), weekend flag, price
    features = ['product_encoded', 'month_sin', 'month_cos', 'day_sin', 'day_cos', 'is_weekend', 'price']
    X = df[features]
    y = df['sales']
    
    model = RandomForestRegressor(n_estimators=200, max_depth=15, random_state=42)
    model.fit(X, y)
    
    # Save model and label encoder
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/model.pkl")
    joblib.dump(le, "models/label_encoder.pkl")
    print("Robust model trained and saved to models/model.pkl")

if __name__ == "__main__":
    train_model()
