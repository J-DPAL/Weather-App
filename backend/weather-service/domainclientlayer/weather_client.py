"""
OpenWeather client that fetches current weather and 5-day forecast.
We use 'onecall' style API if available; otherwise we call current + daily forecast endpoints.
OpenWeather's One Call requires lat/lon and an API key.
"""
import os
import httpx
from dotenv import load_dotenv
load_dotenv()

OPENWEATHER_KEY = os.getenv("OPENWEATHER_API_KEY")
BASE_URL = "https://api.openweathermap.org/data/2.5"

class WeatherClient:
    def __init__(self):
        self.key = OPENWEATHER_KEY

    async def current(self, lat: float, lng: float) -> dict:
        """
        Fetch current weather for lat/lng.
        If no key, return a development mock (so frontend can continue).
        """
        if not self.key:
            return {
                "temp": 20.5,
                "feels_like": 20.0,
                "humidity": 60,
                "wind_speed": 3.4,
                "weather": [{"main": "Clear", "description": "clear sky", "icon": "01d"}],
                "source": "mock"
            }
        url = f"{BASE_URL}/weather"
        params = {"lat": lat, "lon": lng, "appid": self.key, "units": "metric"}
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(url, params=params)
            r.raise_for_status()
            return r.json()

    async def forecast_5day(self, lat: float, lng: float) -> dict:
        """
        Fetch 5-day forecast (OpenWeather 'forecast' endpoint gives 3-hour steps for 5 days).
        We'll aggregate daily maxima/minima server-side.
        """
        if not self.key:
            # mocked 5-day: return simplified daily list
            return {"daily": [
                {"dt": 0, "temp": {"min": 10, "max": 20}, "weather": [{"main": "Clear", "description": "clear sky"}]},
                {"dt": 1, "temp": {"min": 11, "max": 21}, "weather": [{"main": "Clouds", "description": "few clouds"}]},
            ], "source": "mock"}

        url = f"{BASE_URL}/forecast"
        params = {"lat": lat, "lon": lng, "appid": self.key, "units": "metric"}
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(url, params=params)
            r.raise_for_status()
            return r.json()
