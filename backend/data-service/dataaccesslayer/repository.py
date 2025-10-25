"""Repository functions for DB CRUD operations."""
from .database import AsyncSessionLocal, engine, Base
from .models import LocationRecord, WeatherRecord, RangeRecord
from exceptions.custom_exceptions import DuplicateLocationException, DuplicateWeatherException
import sqlalchemy as sa
from typing import List, Optional, Dict, Any
import asyncio
from datetime import datetime, timezone


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(sa.orm.configure_mappers)
        await conn.run_sync(lambda sync_conn: Base.metadata.create_all(sync_conn))


async def create_location_record(data: Dict[str, Any]) -> Dict:
    async with AsyncSessionLocal() as session:
        query_str = (data.get("query") or "").strip()
        if query_str:
            q = await session.execute(
                sa.select(LocationRecord).where(sa.func.lower(LocationRecord.query) == query_str.lower())
            )
            existing = q.scalar_one_or_none()
            if existing:
                raise DuplicateLocationException(f"'{query_str}' is already saved (id={existing.id}).")

        loc = LocationRecord(
            query=data.get("query"),
            lat=data.get("lat"),
            lng=data.get("lng"),
            display_name=data.get("display_name"),
            source=data.get("source"),
        )
        session.add(loc)
        await session.commit()
        await session.refresh(loc)
        return {
            "id": loc.id,
            "query": loc.query,
            "lat": loc.lat,
            "lng": loc.lng,
            "display_name": loc.display_name,
            "source": loc.source,
            "created_at": loc.created_at.isoformat()
        }


async def list_location_records() -> List[Dict]:
    async with AsyncSessionLocal() as session:
        q = await session.execute(sa.select(LocationRecord).order_by(LocationRecord.created_at.desc()))
        rows = q.scalars().all()
        return [
            {"id": r.id, "query": r.query, "lat": r.lat, "lng": r.lng, "display_name": r.display_name, "source": r.source, "created_at": r.created_at.isoformat()}
            for r in rows
        ]


async def create_weather_record(data: Dict[str, Any]) -> Dict:
    async with AsyncSessionLocal() as session:
        lat = data.get("lat")
        lng = data.get("lng")
        kind = data.get("kind", "current")

        if lat is not None and lng is not None and kind == "current":
            q = await session.execute(
                sa.select(WeatherRecord)
                .where(
                    (WeatherRecord.lat == lat)
                    & (WeatherRecord.lng == lng)
                    & (WeatherRecord.kind == kind)
                )
                .order_by(WeatherRecord.created_at.desc())
                .limit(1)
            )
            last = q.scalar_one_or_none()
            if last and last.created_at:
                now_utc = datetime.now(timezone.utc)
                if (now_utc - last.created_at).total_seconds() < 120:
                    raise DuplicateWeatherException(
                        f"Weather for ({lat},{lng}) was saved {int((now_utc - last.created_at).total_seconds())}s ago. Please wait before saving again."
                    )

        wr = WeatherRecord(
            location_id=data.get("location_id"),
            lat=data.get("lat"),
            lng=data.get("lng"),
            snapshot=data.get("snapshot"),
            kind=data.get("kind", "current")
        )
        session.add(wr)
        await session.commit()
        await session.refresh(wr)
        return {"id": wr.id, "location_id": wr.location_id, "lat": wr.lat, "lng": wr.lng, "snapshot": wr.snapshot, "kind": wr.kind, "created_at": wr.created_at.isoformat()}


async def list_weather_records(limit:int=100) -> List[Dict]:
    async with AsyncSessionLocal() as session:
        q = await session.execute(sa.select(WeatherRecord).order_by(WeatherRecord.created_at.desc()).limit(limit))
        rows = q.scalars().all()
        return [{"id": r.id, "location_id": r.location_id, "lat": r.lat, "lng": r.lng, "snapshot": r.snapshot, "kind": r.kind, "created_at": r.created_at.isoformat()} for r in rows]


async def update_location_record(location_id: int, data: Dict[str, Any]) -> Optional[Dict]:
    async with AsyncSessionLocal() as session:
        q = await session.execute(sa.select(LocationRecord).where(LocationRecord.id == location_id))
        loc = q.scalar_one_or_none()
        if not loc:
            return None
        
        if "query" in data:
            loc.query = data["query"]
        if "lat" in data:
            loc.lat = data["lat"]
        if "lng" in data:
            loc.lng = data["lng"]
        if "display_name" in data:
            loc.display_name = data["display_name"]
        if "source" in data:
            loc.source = data["source"]
        
        await session.commit()
        await session.refresh(loc)
        return {
            "id": loc.id,
            "query": loc.query,
            "lat": loc.lat,
            "lng": loc.lng,
            "display_name": loc.display_name,
            "source": loc.source,
            "created_at": loc.created_at.isoformat()
        }


async def update_weather_record(weather_id: int, data: Dict[str, Any]) -> Optional[Dict]:
    async with AsyncSessionLocal() as session:
        q = await session.execute(sa.select(WeatherRecord).where(WeatherRecord.id == weather_id))
        wr = q.scalar_one_or_none()
        if not wr:
            return None
        
        if "lat" in data:
            wr.lat = data["lat"]
        if "lng" in data:
            wr.lng = data["lng"]
        if "kind" in data:
            wr.kind = data["kind"]
        if "location_id" in data:
            wr.location_id = data["location_id"]
        if "snapshot" in data:
            wr.snapshot = data["snapshot"]
        
        await session.commit()
        await session.refresh(wr)
        return {
            "id": wr.id,
            "location_id": wr.location_id,
            "lat": wr.lat,
            "lng": wr.lng,
            "snapshot": wr.snapshot,
            "kind": wr.kind,
            "created_at": wr.created_at.isoformat()
        }


async def delete_all_location_records() -> int:
    async with AsyncSessionLocal() as session:
        result = await session.execute(sa.delete(LocationRecord))
        await session.commit()
        return result.rowcount


async def delete_all_weather_records() -> int:
    async with AsyncSessionLocal() as session:
        result = await session.execute(sa.delete(WeatherRecord))
        await session.commit()
        return result.rowcount


async def create_range_record(data: Dict[str, Any]) -> Dict:
    async with AsyncSessionLocal() as session:
        rr = RangeRecord(
            query=data.get("query"),
            lat=data.get("lat"),
            lng=data.get("lng"),
            start_date=data.get("start_date"),
            end_date=data.get("end_date"),
            summary=data.get("summary"),
        )
        session.add(rr)
        await session.commit()
        await session.refresh(rr)
        return {
            "id": rr.id,
            "query": rr.query,
            "lat": rr.lat,
            "lng": rr.lng,
            "start_date": rr.start_date,
            "end_date": rr.end_date,
            "summary": rr.summary,
            "created_at": rr.created_at.isoformat(),
        }


async def list_range_records(limit:int=100) -> List[Dict]:
    async with AsyncSessionLocal() as session:
        q = await session.execute(sa.select(RangeRecord).order_by(RangeRecord.created_at.desc()).limit(limit))
        rows = q.scalars().all()
        return [
            {
                "id": r.id,
                "query": r.query,
                "lat": r.lat,
                "lng": r.lng,
                "start_date": r.start_date,
                "end_date": r.end_date,
                "summary": r.summary,
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ]


async def update_range_record(range_id: int, data: Dict[str, Any]) -> Optional[Dict]:
    async with AsyncSessionLocal() as session:
        q = await session.execute(sa.select(RangeRecord).where(RangeRecord.id == range_id))
        rr = q.scalar_one_or_none()
        if not rr:
            return None

        if "query" in data:
            rr.query = data["query"]
        if "lat" in data:
            rr.lat = data["lat"]
        if "lng" in data:
            rr.lng = data["lng"]
        if "start_date" in data:
            rr.start_date = data["start_date"]
        if "end_date" in data:
            rr.end_date = data["end_date"]
        if "summary" in data:
            rr.summary = data["summary"]

        await session.commit()
        await session.refresh(rr)
        return {
            "id": rr.id,
            "query": rr.query,
            "lat": rr.lat,
            "lng": rr.lng,
            "start_date": rr.start_date,
            "end_date": rr.end_date,
            "summary": rr.summary,
            "created_at": rr.created_at.isoformat(),
        }


async def delete_range_record(range_id: int) -> int:
    async with AsyncSessionLocal() as session:
        result = await session.execute(sa.delete(RangeRecord).where(RangeRecord.id == range_id))
        await session.commit()
        return result.rowcount
