from fastapi import Request
from fastapi.responses import JSONResponse
from .custom_exceptions import (
    NotFoundException,
    InvalidRequestException,
    DuplicateLocationException,
    DuplicateWeatherException,
)
from .http_error_info import HttpErrorInfo
import datetime

def _payload(status_code, message, detail=None):
    return HttpErrorInfo(status_code=status_code, message=message, detail=detail, timestamp=datetime.datetime.utcnow().isoformat()).dict()

def register_exception_handlers(app):
    @app.exception_handler(NotFoundException)
    async def not_found_handler(request: Request, exc: NotFoundException):
        return JSONResponse(status_code=404, content=_payload(404, "Not found", str(exc)))

    @app.exception_handler(InvalidRequestException)
    async def invalid_handler(request: Request, exc: InvalidRequestException):
        return JSONResponse(status_code=400, content=_payload(400, "Invalid request", str(exc)))

    @app.exception_handler(DuplicateLocationException)
    async def duplicate_location_handler(request: Request, exc: DuplicateLocationException):
        return JSONResponse(status_code=409, content=_payload(409, "Location already saved", str(exc)))

    @app.exception_handler(DuplicateWeatherException)
    async def duplicate_weather_handler(request: Request, exc: DuplicateWeatherException):
        return JSONResponse(status_code=409, content=_payload(409, "Weather already saved recently", str(exc)))

    @app.exception_handler(Exception)
    async def generic_handler(request: Request, exc: Exception):
        return JSONResponse(status_code=500, content=_payload(500, "Server error", str(exc)))
