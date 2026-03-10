# Satguru SmartShop AI Service

AI-powered analytics service for retail forecasting and anomaly detection.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Train the model:
   ```bash
   python train.py
   ```

3. Run the service:
   ```bash
   uvicorn app:app --reload
   ```

## Endpoints

- `GET /predict`: Returns predicted sales for upcoming months.
- `GET /demand`: Returns demand forecast for products.
- `GET /anomalies`: Detects abnormal sales events.
- `POST /train`: Retrains the model.
