from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MessageResponse(BaseModel):
    message: str

class ErrorResponse(BaseModel):
    detail: str

class LocationData(BaseModel):
    latitude: float
    longitude: float
    heading: Optional[float] = None
    speed: Optional[float] = None
    timestamp: Optional[datetime] = None
