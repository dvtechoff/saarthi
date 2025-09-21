from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, Enum, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

class OccupancyLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class TripStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Bus(Base):
    __tablename__ = "buses"
    
    id = Column(Integer, primary_key=True, index=True)
    bus_number = Column(String(20), unique=True, nullable=False)
    route_id = Column(Integer, ForeignKey("routes.id"))
    current_latitude = Column(Float, nullable=True)
    current_longitude = Column(Float, nullable=True)
    speed = Column(Float, default=0.0)
    heading = Column(Float, nullable=True)
    occupancy = Column(Enum(OccupancyLevel), default=OccupancyLevel.LOW)
    is_active = Column(Boolean, default=False)
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    route = relationship("Route", back_populates="buses")
    trips = relationship("Trip", back_populates="bus")

class Route(Base):
    __tablename__ = "routes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    buses = relationship("Bus", back_populates="route")
    stops = relationship("Stop", back_populates="route")
    trips = relationship("Trip", back_populates="route")

class Stop(Base):
    __tablename__ = "stops"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    route_id = Column(Integer, ForeignKey("routes.id"))
    sequence_order = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    route = relationship("Route", back_populates="stops")

class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(String(50), unique=True, nullable=False)
    driver_id = Column(Integer, ForeignKey("users.id"))
    bus_id = Column(Integer, ForeignKey("buses.id"))
    route_id = Column(Integer, ForeignKey("routes.id"))
    status = Column(Enum(TripStatus), default=TripStatus.ACTIVE)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    distance_traveled = Column(Float, default=0.0)
    
    # Relationships
    driver = relationship("User")
    bus = relationship("Bus", back_populates="trips")
    route = relationship("Route", back_populates="trips")

class Feedback(Base):
    __tablename__ = "feedbacks"
    
    id = Column(Integer, primary_key=True, index=True)
    commuter_id = Column(Integer, ForeignKey("users.id"))
    bus_id = Column(Integer, ForeignKey("buses.id"))
    occupancy = Column(Enum(OccupancyLevel), nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    commuter = relationship("User")
    bus = relationship("Bus")
