from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime, timezone

app = FastAPI(
    title="Earth Observation Monitoring API",
    description="Backend prototype for satellite-based area monitoring.",
    version="1.0.0",
)

# React/Vite frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Coordinate(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class AnalyzeRequest(BaseModel):
    coordinates: List[Coordinate]
    change_type: Optional[str] = "All Changes"
    monitoring_date: Optional[str] = None


class AnalyzeResponse(BaseModel):
    success: bool
    message: str
    coordinates: List[Coordinate]
    change_detected: bool
    confidence: float
    change_type: str
    affected_area: float
    analyzed_at: str


@app.get("/")
def home():
    return {
        "success": True,
        "message": "Earth Observation Monitoring API is running",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "backend": "online",
        "time": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/satellite")
def satellite_info():
    # Placeholder. Connect an authorized/public satellite data provider here.
    return {
        "success": True,
        "source": "Earth Observation Data",
        "status": "prototype",
        "message": "Satellite imagery service endpoint is ready.",
    }


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_area(request: AnalyzeRequest):
    if len(request.coordinates) < 3:
        return AnalyzeResponse(
            success=False,
            message="At least 3 coordinates are required to define an area.",
            coordinates=request.coordinates,
            change_detected=False,
            confidence=0,
            change_type="None",
            affected_area=0,
            analyzed_at=datetime.now(timezone.utc).isoformat(),
        )

    # Prototype result.
    # Future implementation:
    # 1. Query authorized satellite imagery.
    # 2. Clip imagery to the selected polygon.
    # 3. Preprocess/cloud-mask images.
    # 4. Compare dates or run a trained change-detection model.
    # 5. Return detected changes and geometry.
    return AnalyzeResponse(
        success=True,
        message="Area received successfully. Satellite/AI analysis is currently in prototype mode.",
        coordinates=request.coordinates,
        change_detected=False,
        confidence=0,
        change_type="None",
        affected_area=0,
        analyzed_at=datetime.now(timezone.utc).isoformat(),
    )


@app.get("/monitoring/status")
def monitoring_status():
    return {
        "system": "Earth Observation Monitoring System",
        "api": "online",
        "satellite_service": "prototype",
        "ai_change_detection": "not_configured",
        "database": "not_configured",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
