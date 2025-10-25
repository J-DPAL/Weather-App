"""
LocationService orchestrates geocoding and posting to data-service for persistence.
"""
from domainclientlayer.geocode_client import GeocodeClient
import os
import httpx
from dotenv import load_dotenv

load_dotenv()
DATA_SERVICE_URL = os.getenv("DATA_SERVICE_URL", "http://127.0.0.1:8003")

class LocationService:
    def __init__(self):
        self.client = GeocodeClient()

    async def resolve_location_only(self, query: str) -> dict:
        """
        Resolve location without storing to database.
        Returns geocoding data only.
        """
        resolution = await self.client.geocode(query)
        payload = {
            "query": query,
            "lat": float(resolution["lat"]),
            "lng": float(resolution["lng"]),
            "display_name": resolution.get("display_name"),
            "source": resolution.get("source", "opencage")
        }
        return payload

    async def resolve_location_and_store(self, query: str) -> dict:
        # 1) get geocoding
        resolution = await self.client.geocode(query)
        # 2) build payload for data-service
        payload = {
            "query": query,
            "lat": float(resolution["lat"]),
            "lng": float(resolution["lng"]),
            "display_name": resolution.get("display_name"),
            "source": resolution.get("source", "opencage")
        }
        # 3) POST to data-service to persist
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(f"{DATA_SERVICE_URL}/api/v1/records/location", json=payload)
            # If data-service returns non-2xx raise for upstream error
            resp.raise_for_status()
            stored = resp.json()
        # return combined info
        return {**payload, "id": stored.get("id")}
