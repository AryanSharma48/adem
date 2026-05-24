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
