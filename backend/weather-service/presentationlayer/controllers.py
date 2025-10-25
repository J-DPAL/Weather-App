"""
Weather presentation layer: exposes endpoints used by the frontend:
  - GET /api/v1/weather/current?lat=&lng= (no auto-save)
  - GET /api/v1/weather/current-and-save?lat=&lng=&location_id= (with auto-save)
  - GET /api/v1/weather/forecast?lat=&lng=&days= (no auto-save)
  - GET /api/v1/weather/forecast-and-save?lat=&lng=&days=&location_id= (with auto-save)
"""
from fastapi import APIRouter, HTTPException, Query
from businesslogiclayer.weather_service import WeatherService

router = APIRouter()
service = WeatherService()

@router.get("/current")
async def get_current(lat: float = Query(...), lng: float = Query(...)):
    """
    Fetch current weather WITHOUT persisting. Returns snapshot only.
    """
    try:
        return await service.get_current_only(lat, lng)
    except Exception as e:
        # Let global exception handler convert to HTTP error
        raise

@router.get("/current-and-save")
async def get_current_and_save(lat: float = Query(...), lng: float = Query(...), location_id: int | None = None):
    """
    Fetch current weather AND persist snapshot. Returns snapshot + DB record info.
    """
    try:
        return await service.get_current_and_store(lat, lng, location_id)
    except Exception as e:
        # Let global exception handler convert to HTTP error
        raise

@router.get("/forecast")
async def get_forecast(lat: float = Query(...), lng: float = Query(...), days: int = Query(5)):
    """
    Fetch 5-day forecast WITHOUT persisting. Returns aggregated daily forecast.
    """
    try:
        return await service.get_forecast_only(lat, lng, days)
    except Exception as e:
        raise

@router.get("/forecast-and-save")
async def get_forecast_and_save(lat: float = Query(...), lng: float = Query(...), days: int = Query(5), location_id: int | None = None):
    """
    Fetch 5-day forecast AND persist raw forecast. Returns aggregated daily forecast + DB record.
    """
    try:
        return await service.get_forecast_and_store(lat, lng, days, location_id)
    except Exception as e:
        raise

@router.get("/historical")
async def get_historical(
    lat: float = Query(...),
    lng: float = Query(...),
    start: str = Query(..., description="YYYY-MM-DD"),
    end: str = Query(..., description="YYYY-MM-DD")
):
    """
    Simulated historical endpoint using forecast window. Validates date range and returns daily series
    for dates within [start, end], up to 7 days.
    """
    try:
        return await service.get_historical_range_only(lat, lng, start, end)
    except Exception as e:
        raise
