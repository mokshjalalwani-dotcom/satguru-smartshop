# Satguru AI Intelligence Service V2

Advanced retail intelligence engine providing predictive analytics, demand forecasting, and business insights.

## Features
- **Predictive Sales Modeling**: Using Random Forest Regressors to forecast future volume.
- **Dynamic Insight Generation**: Context-aware business recommendations.
- **Anomaly Detection**: Statistical and ML-based detection of market irregularities.
- **FastAPI Core**: High-performance asynchronous API endpoints.
- **Automated Data Synthesis**: Realistic market-driven data generation for training.

## API Endpoints
- `GET /stats`: High-level business KPIs.
- `GET /predict`: 30-day forward sales forecast.
- `GET /demand`: Categorical demand intelligence.
- `GET /insights`: AI-driven strategic recommendations.
- `GET /health`: Engine status and diagnostic info.

## Deployment
Managed via `render.yaml` as a background web service.
