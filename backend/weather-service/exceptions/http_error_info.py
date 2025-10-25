from pydantic import BaseModel
from typing import Optional

class HttpErrorInfo(BaseModel):
    status_code: int
    message: str
    detail: Optional[str] = None
    timestamp: Optional[str] = None
