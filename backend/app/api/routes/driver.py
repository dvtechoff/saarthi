from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.user import User
from app.models.trip import Route, Trip, Bus, Stop
from app.api.deps import get_current_active_user
from app.schemas.common import LocationData
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter()

class RouteResponse(BaseModel):
    id: int
    name: str
    description: str
    stops: List[dict]
    
    class Config:
        from_attributes = True

class TripStartResponse(BaseModel):
    tripId: str
    message: str

class TripStopResponse(BaseModel):
    success: bool
    message: str

@router.get("/routes", response_model=List[RouteResponse])
def get_assigned_routes(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get routes assigned to the driver"""
    if current_user.role.value != "driver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Driver role required."
        )
    
    routes = db.query(Route).filter(Route.is_active == True).all()
    
    result = []
    for route in routes:
        stops = db.query(Stop).filter(
            Stop.route_id == route.id,
            Stop.is_active == True
        ).order_by(Stop.sequence_order).all()
        
        route_data = {
            "id": route.id,
            "name": route.name,
            "description": route.description or "",
            "stops": [
                {
                    "id": stop.id,
                    "name": stop.name,
                    "latitude": stop.latitude,
                    "longitude": stop.longitude
                }
                for stop in stops
            ]
        }
        result.append(route_data)
    
    return result

@router.post("/trip/start", response_model=TripStartResponse)
def start_trip(
    routeId: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Start a new trip"""
    if current_user.role.value != "driver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Driver role required."
        )
    
    # Check if route exists
    route = db.query(Route).filter(Route.id == routeId).first()
    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    # Check if driver has an active trip
    active_trip = db.query(Trip).filter(
        Trip.driver_id == current_user.id,
        Trip.status == "active"
    ).first()
    
    if active_trip:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Driver already has an active trip"
        )
    
    # Get available bus for this route
    bus = db.query(Bus).filter(
        Bus.route_id == routeId,
        Bus.is_active == False
    ).first()
    
    if not bus:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No available bus for this route"
        )
    
    # Create new trip
    trip_id = f"trip_{uuid.uuid4().hex[:8]}"
    trip = Trip(
        trip_id=trip_id,
        driver_id=current_user.id,
        bus_id=bus.id,
        route_id=routeId,
        status="active"
    )
    
    # Mark bus as active
    bus.is_active = True
    
    db.add(trip)
    db.commit()
    db.refresh(trip)
    
    return TripStartResponse(
        tripId=trip_id,
        message="Trip started successfully"
    )

@router.post("/trip/stop", response_model=TripStopResponse)
def stop_trip(
    tripId: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Stop an active trip"""
    if current_user.role.value != "driver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Driver role required."
        )
    
    # Find active trip
    trip = db.query(Trip).filter(
        Trip.trip_id == tripId,
        Trip.driver_id == current_user.id,
        Trip.status == "active"
    ).first()
    
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active trip not found"
        )
    
    # Update trip status
    trip.status = "completed"
    trip.end_time = datetime.utcnow()
    
    # Mark bus as inactive
    bus = db.query(Bus).filter(Bus.id == trip.bus_id).first()
    if bus:
        bus.is_active = False
    
    db.commit()
    
    return TripStopResponse(
        success=True,
        message="Trip stopped successfully"
    )

@router.post("/location")
def update_location(
    location_data: LocationData,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update driver's current location"""
    if current_user.role.value != "driver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Driver role required."
        )
    
    # Find active trip
    trip = db.query(Trip).filter(
        Trip.driver_id == current_user.id,
        Trip.status == "active"
    ).first()
    
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active trip found"
        )
    
    # Update bus location
    bus = db.query(Bus).filter(Bus.id == trip.bus_id).first()
    if bus:
        bus.current_latitude = location_data.latitude
        bus.current_longitude = location_data.longitude
        bus.heading = location_data.heading
        bus.speed = location_data.speed or 0.0
        bus.last_updated = datetime.utcnow()
        
        db.commit()
    
    return {"message": "Location updated successfully"}
