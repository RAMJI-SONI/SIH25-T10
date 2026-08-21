# ISRO-Inspired Earth Observation Monitoring Backend

This is a backend prototype for the monitoring dashboard.

## Setup

### Windows

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### macOS/Linux

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## URLs

Backend:
http://127.0.0.1:8000

Swagger API documentation:
http://127.0.0.1:8000/docs

Health:
http://127.0.0.1:8000/health

## API

GET /
GET /health
GET /satellite
GET /monitoring/status
POST /analyze

## Important

The `/analyze` endpoint currently accepts a selected polygon and returns a prototype result.
It does not claim to perform real satellite or AI analysis yet.

For a real monitoring system, connect an authorized/public Earth-observation data source and add image preprocessing and a validated change-detection model.
