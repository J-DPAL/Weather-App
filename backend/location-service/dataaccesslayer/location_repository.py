"""
Data Access Layer (Repository) - handles persistence.
For Day1 this file contains stubs so frontend & business logic can be exercised.
Later (Day2) implement SQLAlchemy models and save to DB.
"""
from typing import Dict
import datetime

class LocationRepository:
    def __init__(self):
        # For Day1, we'll keep an in-memory list (no DB)
        self._store = []

    def save_location_stub(self, query: str, resolution: Dict):
        """
        Stub that pretends to save to a DB. It appends to an in-memory list.
        Later: replace with SQLAlchemy and persist to PostgreSQL/SQLite.
        """
        rec = {
            "id": len(self._store) + 1,
            "query": query,
            "lat": float(resolution.get("lat", 0.0)),
            "lng": float(resolution.get("lng", 0.0)),
            "display_name": resolution.get("display_name"),
            "source": resolution.get("source"),
            "created_at": datetime.datetime.utcnow().isoformat()
        }
        self._store.append(rec)
        return rec

    def list_stub(self):
        """Return all saved location records (stub)."""
        return list(self._store)
