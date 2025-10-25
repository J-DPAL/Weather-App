"""
WeatherService: orchestrates calls to the WeatherClient (domainclientlayer) and
the data-service for persistence. Contains helper to aggregate 3-hour steps to daily summary.
"""
from domainclientlayer.weather_client import WeatherClient
import os
import httpx
from dotenv import load_dotenv
from datetime import datetime, timezone
from collections import defaultdict

load_dotenv()
DATA_SERVICE_URL = os.getenv("DATA_SERVICE_URL", "http://127.0.0.1:8003")

class WeatherService:
    def __init__(self):
        self.client = WeatherClient()

    async def get_current_only(self, lat: float, lng: float):
        """
        Fetch current weather WITHOUT persisting to database.
        Returns only the weather snapshot.
        """
        current = await self.client.current(lat, lng)
        return {"snapshot": current}

    async def get_current_and_store(self, lat: float, lng: float, location_id: int = None):
        """
        Fetch current weather and persist snapshot to data-service.
        Returns the raw snapshot and the stored DB record.
        """
        current = await self.client.current(lat, lng)
        payload = {"location_id": location_id, "lat": lat, "lng": lng, "snapshot": current, "kind": "current"}
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(f"{DATA_SERVICE_URL}/api/v1/records/weather", json=payload)
            resp.raise_for_status()
            stored = resp.json()
        return {"snapshot": current, "stored": stored}

    async def get_forecast_only(self, lat: float, lng: float, days: int = 5):
        """
        Fetch forecast WITHOUT persisting to database.
        Returns only the aggregated daily forecast.
        """
        raw = await self.client.forecast_5day(lat, lng)
        aggregated = self._aggregate_to_daily(raw, days)
        return {"raw": raw, "aggregated": aggregated}

    async def get_forecast_and_store(self, lat: float, lng: float, days: int = 5, location_id: int = None):
        """
        Fetch forecast (raw) and persist to data-service as a 'forecast' record.
        Also return an aggregated daily forecast for the requested number of days.
        """
        raw = await self.client.forecast_5day(lat, lng)
        # persist raw forecast snapshot
        payload = {"location_id": location_id, "lat": lat, "lng": lng, "snapshot": raw, "kind": "forecast"}
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(f"{DATA_SERVICE_URL}/api/v1/records/weather", json=payload)
            resp.raise_for_status()
            stored = resp.json()

        # If raw is already daily (mock), try to shape; else aggregate list items (OpenWeather 3-hour blocks)
        aggregated = self._aggregate_to_daily(raw, days)
        return {"raw": raw, "aggregated": aggregated, "stored": stored}

    async def get_historical_range_only(self, lat: float, lng: float, start_iso: str, end_iso: str):
        """
        Simulated historical range using the available 5-day forecast window.
        Validates date range, aggregates forecast to daily, then filters inclusive of [start, end].
        Constraints:
          - start <= end
          - range length <= 7 days
          - dates must be within the available forecast daily dates
        Returns: { range: {start, end}, series: [ {date, min_temp, max_temp, summary, icon} ] }
        """
        from datetime import datetime as dt, timedelta
        from exceptions.custom_exceptions import InvalidRequestException, NotFoundException

        try:
            start_date = dt.fromisoformat(start_iso).date()
            end_date = dt.fromisoformat(end_iso).date()
        except Exception:
            raise InvalidRequestException("Invalid date format. Use YYYY-MM-DD")

        if start_date > end_date:
            raise InvalidRequestException("start must be on or before end")

        if (end_date - start_date).days + 1 > 7:
            raise InvalidRequestException("Date range too large. Maximum 7 days supported")

        # Use forecast as a proxy for near-term range
        raw = await self.client.forecast_5day(lat, lng)
        aggregated = self._aggregate_to_daily(raw, days=7)

        # aggregated dates are strings "YYYY-MM-DD"; normalize inputs to same format
        def _to_str(d):
            return d.isoformat()

        start_s = _to_str(start_date)
        end_s = _to_str(end_date)

        series = [d for d in aggregated if start_s <= d.get("date", "") <= end_s]
        if not series:
            # If outside available forecast dates
            raise NotFoundException("Requested range is outside supported forecast window")

        return {"range": {"start": start_s, "end": end_s}, "series": series}

    def _aggregate_to_daily(self, raw_forecast: dict, days: int = 5):
        """
        Convert OpenWeather 3-hourly forecast (list at raw_forecast["list"]) into daily summary:
        {
          date: "YYYY-MM-DD",
          min_temp: float,
          max_temp: float,
          summary: "Mostly clear",
          icon: "04d"
        }
        If the raw forecast matches the 'daily' mock structure we adapt that too.
        """
        # If mock daily provided
        if "daily" in raw_forecast and isinstance(raw_forecast["daily"], list):
            out = []
            for day in raw_forecast["daily"][:days]:
                # OpenWeatherOneCall uses day["temp"]["min"/"max"]
                tmin = day.get("temp", {}).get("min")
                tmax = day.get("temp", {}).get("max")
                weather = day.get("weather", [{}])[0]
                out.append({
                    "date": day.get("dt"),  # might be epoch in mock
                    "min_temp": tmin,
                    "max_temp": tmax,
                    "summary": weather.get("description"),
                    "icon": weather.get("icon")
                })
            return out

        # Typical 5-day OpenWeather 'forecast' endpoint structure: raw_forecast["list"] -> items with dt (epoch)
        items = raw_forecast.get("list") or []
        if not items:
            return []

        # bucket by date (UTC)
        buckets = defaultdict(list)
        for it in items:
            dt = it.get("dt")
            if dt is None:
                continue
            d = datetime.fromtimestamp(dt, tz=timezone.utc).date().isoformat()
            buckets[d].append(it)

        # sort dates ascending and produce summary
        daily = []
        for i, (date_str, arr) in enumerate(sorted(buckets.items())):
            if i >= days:
                break
            temps = [entry.get("main", {}).get("temp") for entry in arr if entry.get("main")]
            mins = [entry.get("main", {}).get("temp_min") for entry in arr if entry.get("main")]
            maxs = [entry.get("main", {}).get("temp_max") for entry in arr if entry.get("main")]
            # choose summary by most common weather main
            weather_terms = [entry.get("weather", [{}])[0].get("main") for entry in arr]
            # fallback handling
            min_temp = min(mins) if mins else (min(temps) if temps else None)
            max_temp = max(maxs) if maxs else (max(temps) if temps else None)
            # pick a representative description (first non-empty)
            desc = None
            icon = None
            for entry in arr:
                w = entry.get("weather", [{}])[0]
                if w.get("description"):
                    desc = w.get("description")
                    icon = w.get("icon")
                    break
            daily.append({
                "date": date_str,
                "min_temp": min_temp,
                "max_temp": max_temp,
                "summary": desc,
                "icon": icon
            })
        return daily
