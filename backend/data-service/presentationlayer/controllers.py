"""
Presentation layer for data-service: CRUD endpoints for locations, weather, ranges and export.
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks, Response
from pydantic import BaseModel
from dataaccesslayer import repository
import asyncio
import csv
import io
from typing import Optional
from xml.etree.ElementTree import Element, SubElement, tostring as xml_tostring
from xml.dom import minidom
import json
from typing import Optional

router = APIRouter()

class CreateLocationRequest(BaseModel):
    query: str
    lat: float
    lng: float
    display_name: str
    source: str


class CreateWeatherRequest(BaseModel):
    location_id: Optional[int] = None
    lat: float
    lng: float
    snapshot: dict
    kind: Optional[str] = "current"


class UpdateLocationRequest(BaseModel):
    query: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    display_name: Optional[str] = None
    source: Optional[str] = None


class UpdateWeatherRequest(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    kind: Optional[str] = None
    location_id: Optional[int] = None
    snapshot: Optional[dict] = None


class CreateRangeRequest(BaseModel):
    query: Optional[str] = None
    lat: float
    lng: float
    start_date: str
    end_date: str
    summary: Optional[dict] = None


class UpdateRangeRequest(BaseModel):
    query: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    summary: Optional[dict] = None


@router.post("/location", summary="Create location record")
async def create_location(req: CreateLocationRequest):
    created = await repository.create_location_record(req.model_dump())
    return created


@router.get("/location", summary="List saved locations")
async def list_locations():
    return await repository.list_location_records()


@router.post("/weather", summary="Create weather snapshot")
async def create_weather(req: CreateWeatherRequest):
    created = await repository.create_weather_record(req.model_dump())
    return created


@router.get("/weather", summary="List weather snapshots")
async def list_weather(limit: int = 100):
    return await repository.list_weather_records(limit=limit)


@router.put("/location/{location_id}", summary="Update location record")
async def update_location(location_id: int, req: UpdateLocationRequest):
    updated = await repository.update_location_record(location_id, req.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail=f"Location {location_id} not found")
    return updated


@router.put("/weather/{weather_id}", summary="Update weather record")
async def update_weather(weather_id: int, req: UpdateWeatherRequest):
    updated = await repository.update_weather_record(weather_id, req.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail=f"Weather record {weather_id} not found")
    return updated


@router.delete("/all/{resource}")
async def delete_all_records(resource: str):
    if resource == "location":
        count = await repository.delete_all_location_records()
        return {"deleted_count": count, "resource": "locations"}
    elif resource == "weather":
        count = await repository.delete_all_weather_records()
        return {"deleted_count": count, "resource": "weather"}
    else:
        raise HTTPException(status_code=400, detail="Resource must be 'location' or 'weather'")


@router.delete("/{resource}/{item_id}")
async def delete_item(resource: str, item_id: int):
    from sqlalchemy import delete
    from dataaccesslayer.database import AsyncSessionLocal
    from dataaccesslayer.models import LocationRecord, WeatherRecord, RangeRecord

    async with AsyncSessionLocal() as session:
        if resource == "location":
            stmt = delete(LocationRecord).where(LocationRecord.id == item_id)
        elif resource == "weather":
            stmt = delete(WeatherRecord).where(WeatherRecord.id == item_id)
        elif resource == "range":
            stmt = delete(RangeRecord).where(RangeRecord.id == item_id)
        else:
            raise HTTPException(status_code=400, detail="Resource must be 'location' or 'weather' or 'range'")

        await session.execute(stmt)
        await session.commit()
        return {"deleted": item_id}


@router.get("/export")
async def export_data(format: str = "json"):
    """Export data in JSON, CSV, Markdown, XML, or PDF format."""
    locations = await repository.list_location_records()
    weather = await repository.list_weather_records(limit=1000)

    if format == "json":
        payload = {"locations": locations, "weather": weather}
        return payload

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["type", "id", "query_or_kind", "lat", "lng", "created_at"])
        for loc in locations:
            writer.writerow(["location", loc["id"], loc["query"], loc["lat"], loc["lng"], loc["created_at"]])
        for w in weather:
            writer.writerow(["weather", w["id"], w["kind"], w["lat"], w["lng"], w["created_at"]])
        return Response(content=output.getvalue(), media_type="text/csv")

    if format == "md":
        md = "# Exported Data\n\n## Locations\n"
        for loc in locations:
            md += f"- {loc['id']}: {loc['query']} ({loc['lat']},{loc['lng']}) - {loc['created_at']}\n"
        md += "\n## Weather\n"
        for w in weather:
            md += f"- {w['id']}: {w['kind']} @ ({w['lat']},{w['lng']}) - {w['created_at']}\n"
        return Response(content=md, media_type="text/markdown")

    if format == "xml":
        root = Element("export")
        locs_el = SubElement(root, "locations")
        for loc in locations:
            el = SubElement(locs_el, "location", id=str(loc["id"]))
            SubElement(el, "query").text = str(loc.get("query", ""))
            SubElement(el, "lat").text = str(loc.get("lat", ""))
            SubElement(el, "lng").text = str(loc.get("lng", ""))
            SubElement(el, "created_at").text = str(loc.get("created_at", ""))
        ws_el = SubElement(root, "weather")
        for w in weather:
            el = SubElement(ws_el, "record", id=str(w["id"]))
            SubElement(el, "kind").text = str(w.get("kind", ""))
            SubElement(el, "lat").text = str(w.get("lat", ""))
            SubElement(el, "lng").text = str(w.get("lng", ""))
            SubElement(el, "created_at").text = str(w.get("created_at", ""))
        rough = xml_tostring(root)
        pretty = minidom.parseString(rough).toprettyxml(indent="  ")
        return Response(content=pretty, media_type="application/xml")

    if format == "pdf":
        try:
            import importlib
            pagesizes = importlib.import_module("reportlab.lib.pagesizes")
            pdfgen_canvas = importlib.import_module("reportlab.pdfgen.canvas")
            units = importlib.import_module("reportlab.lib.units")
            letter = pagesizes.letter
            Canvas = pdfgen_canvas.Canvas
            inch = units.inch
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"PDF generation not available: {e}")

        buf = io.BytesIO()
        c = Canvas(buf, pagesize=letter)
        width, height = letter
        y = height - 1 * inch
        c.setFont("Helvetica-Bold", 16)
        c.drawString(1 * inch, y, "Exported Data Summary")
        y -= 0.4 * inch
        c.setFont("Helvetica", 12)
        c.drawString(1 * inch, y, f"Locations: {len(locations)} | Weather: {len(weather)}")
        y -= 0.3 * inch
        c.setFont("Helvetica-Bold", 12)
        c.drawString(1 * inch, y, "Locations")
        y -= 0.25 * inch
        c.setFont("Helvetica", 10)
        for loc in locations[:20]:
            line = f"#{loc['id']} {loc['query']} ({loc['lat']},{loc['lng']})"
            c.drawString(1 * inch, y, line[:95])
            y -= 0.2 * inch
            if y < 1 * inch:
                c.showPage(); y = height - 1 * inch
        y -= 0.1 * inch
        c.setFont("Helvetica-Bold", 12)
        c.drawString(1 * inch, y, "Weather")
        y -= 0.25 * inch
        c.setFont("Helvetica", 10)
        for w in weather[:20]:
            line = f"#{w['id']} {w['kind']} @ ({w['lat']},{w['lng']})"
            c.drawString(1 * inch, y, line[:95])
            y -= 0.2 * inch
            if y < 1 * inch:
                c.showPage(); y = height - 1 * inch
        c.showPage()
        c.save()
        pdf_bytes = buf.getvalue()
        buf.close()
        return Response(content=pdf_bytes, media_type="application/pdf")

    raise HTTPException(status_code=400, detail="Unsupported format. Use json|csv|md|xml|pdf")


@router.post("/range", summary="Create range record")
async def create_range(req: CreateRangeRequest):
    created = await repository.create_range_record(req.model_dump())
    return created


@router.get("/range", summary="List range records")
async def list_ranges(limit: int = 100):
    return await repository.list_range_records(limit=limit)


@router.put("/range/{range_id}", summary="Update range record")
async def update_range(range_id: int, req: UpdateRangeRequest):
    updated = await repository.update_range_record(range_id, req.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail=f"Range record {range_id} not found")
    return updated
