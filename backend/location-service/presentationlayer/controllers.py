from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from businesslogiclayer.location_service import LocationService
from exceptions.custom_exceptions import InvalidInputException

router = APIRouter()
service = LocationService()

class ResolveRequest(BaseModel):
    query: str

@router.post("/resolve")
async def resolve_location(body: ResolveRequest):
    """
    Resolve location WITHOUT saving to database.
    Returns geocoding data only.
    """
    q = body.query.strip() if body.query else ""
    if not q:
        raise InvalidInputException("Empty query")
    try:
        result = await service.resolve_location_only(q)
        return result
    except Exception as e:
        # Let global exception handler translate it
        raise

@router.post("/resolve-and-save")
async def resolve_and_save_location(body: ResolveRequest):
    """
    Resolve location AND save to database.
    Returns geocoding data with database ID.
    """
    q = body.query.strip() if body.query else ""
    if not q:
        raise InvalidInputException("Empty query")
    try:
        result = await service.resolve_location_and_store(q)
        return result
    except Exception as e:
        # Let global exception handler translate it
        raise
