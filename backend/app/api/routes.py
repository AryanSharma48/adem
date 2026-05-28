from fastapi import APIRouter, Depends
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
import math

from app.core.database import SessionLocal
from app.models.air_quality import AirQualityLog

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/api/live")
def get_live_data(db: Session = Depends(get_db)):
    latest_log = db.query(AirQualityLog).order_by(AirQualityLog.timestamp.desc()).first()
    if not latest_log:
        return {
            "id": 0,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "district": "Unknown",
            "pm25_actual": 0.0,
            "pm25_predicted": 0.0,
            "vehicle_count": 0,
            "primary_source": "unknown",
            "shap_pm25": None,
            "shap_heating": None,
            "shap_traffic": None,
        }
    return {
        "id": latest_log.id,
        "timestamp": latest_log.timestamp.isoformat() if latest_log.timestamp else datetime.now(timezone.utc).isoformat(),
        "district": latest_log.district,
        "pm25_actual": latest_log.pm25_actual,
        "pm25_predicted": latest_log.pm25_predicted,
        "vehicle_count": latest_log.vehicle_count,
        "primary_source": latest_log.primary_source,
        "shap_pm25": latest_log.shap_pm25,
        "shap_heating": latest_log.shap_heating,
        "shap_traffic": latest_log.shap_traffic,
    }

@router.get("/api/forecast")
def get_forecast(db: Session = Depends(get_db)):
    latest_log = db.query(AirQualityLog).order_by(AirQualityLog.timestamp.desc()).first()
    base_time = datetime.now(timezone.utc)
    forecast = []
    
    if latest_log and latest_log.forecast_array:
        for i, val in enumerate(latest_log.forecast_array):
            forecast_time = base_time + timedelta(hours=i+1)
            forecast.append({
                "time": forecast_time.strftime("%H:00"),
                "pm25": round(val, 2)
            })
    else:
        base_pm25 = latest_log.pm25_predicted if latest_log and latest_log.pm25_predicted is not None else 40.0
        for i in range(1, 25):
            forecast_time = base_time + timedelta(hours=i)
            variation = math.sin(i * math.pi / 12) * 10
            forecast.append({
                "time": forecast_time.strftime("%H:00"),
                "pm25": round(max(0, base_pm25 + variation), 2)
            })
    return forecast
