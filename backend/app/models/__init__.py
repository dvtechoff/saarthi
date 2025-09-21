from app.db.base import Base
from app.models.user import User
from app.models.trip import Trip, Bus, Route, Stop, Feedback

# Import all models here so they are registered with SQLAlchemy
__all__ = ["User", "Trip", "Bus", "Route", "Stop", "Feedback"]
