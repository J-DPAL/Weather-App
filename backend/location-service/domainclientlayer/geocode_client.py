"""
OpenCage-based geocode client. If GEOCODING_API_KEY is set in .env, this will call OpenCage.
If not set, fallback to Day1 mock behavior.
"""
import os
import httpx
from dotenv import load_dotenv
from exceptions.custom_exceptions import InvalidLocationException

load_dotenv()
GEOCODING_API_KEY = os.getenv("GEOCODING_API_KEY")
GEOCODING_PROVIDER = os.getenv("GEOCODING_PROVIDER", "opencage")

class GeocodeClient:
    def __init__(self):
        self.key = GEOCODING_API_KEY
        self.provider = GEOCODING_PROVIDER

    async def geocode(self, query: str) -> dict:
        # If key absent, return deterministic mock (helpful for development)
        if not self.key:
            lower = query.lower()
            mapping = {
                "toronto": {"lat": 43.6532, "lng": -79.3832, "display_name": "Toronto, ON, Canada", "source": "mock"},
                "paris": {"lat": 48.8566, "lng": 2.3522, "display_name": "Paris, France", "source": "mock"},
                "new york": {"lat": 40.7128, "lng": -74.0060, "display_name": "New York, NY, USA", "source": "mock"}
            }
            for k, v in mapping.items():
                if k in lower:
                    return v
            # Invalid location in mock mode - raise exception instead of returning 0,0
            raise InvalidLocationException(f"Location '{query}' not found in mock database")

        # Real OpenCage geocoding
        url = "https://api.opencagedata.com/geocode/v1/json"
        params = {"q": query, "key": self.key, "limit": 1, "no_annotations": 1}
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(url, params=params)
            r.raise_for_status()
            data = r.json()
            if not data.get("results"):
                # No results found - raise exception instead of returning fallback coordinates
                raise InvalidLocationException(f"Location '{query}' could not be found")
            top = data["results"][0]
            geometry = top.get("geometry", {})
            lat = geometry.get("lat")
            lng = geometry.get("lng")
            
            # Validate that we got actual coordinates
            if lat is None or lng is None:
                raise InvalidLocationException(f"Invalid coordinates returned for '{query}'")
                
            return {"lat": lat, "lng": lng, "display_name": top.get("formatted"), "source": "opencage"}
