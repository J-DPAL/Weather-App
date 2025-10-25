"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LocationCreate(BaseModel):
    query: str
    display_name: Optional[str]
    lat: float
    lng: float
    source: Optional[str]

class WeatherRecordCreate(BaseModel):
    location_id: int
    raw_data: str
    summary: Optional[str]
    temp: Optional[float]
    min_temp: Optional[float]
    max_temp: Optional[float]

class LocationOut(BaseModel):
    id: int
    query: str
    display_name: Optional[str]
    lat: float
    lng: float
    source: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True

class WeatherRecordOut(BaseModel):
    id: int
    location_id: int
    timestamp: datetime
    raw_data: str
    summary: Optional[str]
    temp: Optional[float]
    min_temp: Optional[float]
    max_temp: Optional[float]

    class Config:
        orm_mode = True
