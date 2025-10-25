"""
HTTP error info model that the global exception handler will return.
We will construct a consistent error response payload using this shape.
"""
from pydantic import BaseModel
from typing import Optional

class HttpErrorInfo(BaseModel):
    status_code: int
    message: str
    detail: Optional[str] = None
    timestamp: Optional[str] = None
