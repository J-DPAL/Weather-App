"""
SQLAlchemy models: LocationRecord, WeatherRecord, RangeRecord
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.sql import func
from .database import Base

class LocationRecord(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    query = Column(String, index=True)
    lat = Column(Float)
    lng = Column(Float)
    display_name = Column(String)
    source = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class WeatherRecord(Base):
    __tablename__ = "weather_records"
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer)  # optionally link to location record
    lat = Column(Float)
    lng = Column(Float)
    snapshot = Column(JSON)  # full JSON snapshot of weather fetched
    kind = Column(String, default="current") # current or forecast
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class RangeRecord(Base):
    __tablename__ = "range_records"
    id = Column(Integer, primary_key=True, index=True)
    # Optional query string (city name or landmark) for traceability
    query = Column(String, index=True)
    lat = Column(Float)
    lng = Column(Float)
    start_date = Column(String)  # store as ISO YYYY-MM-DD
    end_date = Column(String)    # store as ISO YYYY-MM-DD
    # Store a compact summary instead of the full series
    # e.g., {"avg_temp": 22.4, "min_temp": 18.0, "max_temp": 27.2, "count": 5}
    summary = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
