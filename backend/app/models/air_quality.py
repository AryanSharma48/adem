from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone
from app.core.database import Base

class AirQualityLog(Base):
    __tablename__ = "air_quality_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    district = Column(String, index=True)
    pm25_actual = Column(Float, nullable=True)
    pm25_predicted = Column(Float)
    vehicle_count = Column(Integer)
    primary_source = Column(String)
    # SHAP feature importance (0.0–1.0, sum = 1.0)
    shap_pm25 = Column(Float, nullable=True)      # contribution of PM2.5 history
    shap_heating = Column(Float, nullable=True)   # contribution of heating degree days
    shap_traffic = Column(Float, nullable=True)   # contribution of vehicle count
