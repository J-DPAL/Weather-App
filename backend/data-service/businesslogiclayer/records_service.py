"""
Business logic for records/data-service. This layer validates inputs and composes operations.
"""
from dataaccesslayer.repository import Repository
from presentationlayer.schemas import LocationCreate, WeatherRecordCreate
import json

repo = Repository()

class RecordsService:
    def create_location_and_weather_snapshot(self, location_payload: dict, weather_payload: dict):
        """
        Convenient helper to create a Location record and a linked WeatherRecord snapshot.
        location_payload: dict with keys expected by LocationCreate
        weather_payload: dict (raw JSON) - we'll stringify and store summary fields.
        """
        loc_schema = LocationCreate(**location_payload)
        loc = repo.create_location(loc_schema)

        # Prepare weather record
        raw_json = json.dumps(weather_payload)
        summary = weather_payload.get("summary") or weather_payload.get("current_weather", {}).get("weathercode", "")
        temp = None
        min_temp = None
        max_temp = None
        # try to extract temperatures if present
        if "current_weather" in weather_payload:
            temp = weather_payload["current_weather"].get("temperature")
        if "daily" in weather_payload:
            # daily min/max arrays exist
            mins = weather_payload["daily"].get("temperature_2m_min")
            maxs = weather_payload["daily"].get("temperature_2m_max")
            if isinstance(mins, list) and isinstance(maxs, list) and mins:
                min_temp = float(mins[0])
                max_temp = float(maxs[0])

        weather_schema = WeatherRecordCreate(
            location_id=loc.id,
            raw_data=raw_json,
            summary=str(summary),
            temp=temp,
            min_temp=min_temp,
            max_temp=max_temp
        )
        rec = repo.create_weather(weather_schema)
        return loc, rec
