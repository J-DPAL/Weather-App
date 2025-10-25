"""
Registers exception handlers on FastAPI to map our custom exceptions to HTTP responses.
"""
from fastapi import Request
from fastapi.responses import JSONResponse
from exceptions.custom_exceptions import (
    LocationNotFoundException, 
    ExternalAPIException, 
    InvalidInputException,
    InvalidLocationException
)
from exceptions.http_error_info import HttpErrorInfo
import datetime

def _make_payload(status_code: int, message: str, detail: str = None):
    return HttpErrorInfo(
        status_code=status_code,
        message=message,
        detail=detail,
        timestamp=datetime.datetime.utcnow().isoformat()
    ).dict()

def register_exception_handlers(app):
    @app.exception_handler(LocationNotFoundException)
    async def location_not_found_handler(request: Request, exc: LocationNotFoundException):
        payload = _make_payload(404, "Location not found", str(exc))
        return JSONResponse(status_code=404, content=payload)

    @app.exception_handler(ExternalAPIException)
    async def external_api_handler(request: Request, exc: ExternalAPIException):
        payload = _make_payload(502, "Upstream service error", str(exc))
        return JSONResponse(status_code=502, content=payload)

    @app.exception_handler(InvalidInputException)
    async def invalid_input_handler(request: Request, exc: InvalidInputException):
        payload = _make_payload(400, "Invalid input", str(exc))
        return JSONResponse(status_code=400, content=payload)

    @app.exception_handler(InvalidLocationException)
    async def invalid_location_handler(request: Request, exc: InvalidLocationException):
        payload = _make_payload(404, "Location not found", str(exc) or "The location you entered does not exist or could not be found")
        return JSONResponse(status_code=404, content=payload)

    # Generic fallback
    @app.exception_handler(Exception)
    async def generic_error_handler(request: Request, exc: Exception):
        payload = _make_payload(500, "Internal Server Error", str(exc))
        return JSONResponse(status_code=500, content=payload)
