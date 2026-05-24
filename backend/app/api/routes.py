from fastapi import APIRouter
from datetime import datetime, timezone, timedelta

router = APIRouter()

@router.get("/api/live")
def get_live_data():
    return {
        "id": 1,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "district": "Astana Center",
        "pm25_actual": 42.5,
        "pm25_predicted": 45.0,
        "vehicle_count": 31,
        "primary_source": "traffic"
    }

@router.get("/api/forecast")
def get_forecast():
    base_time = datetime.now(timezone.utc)
    forecast = []
    # Mock list of 24 objects representing the next 24 hours
    for i in range(1, 25):
        forecast_time = base_time + timedelta(hours=i)
        forecast.append({
            "time": forecast_time.strftime("%H:00"),
            "pm25": 40 + (i % 10)  # simple mock variation
        })
    return forecast
