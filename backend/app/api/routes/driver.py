from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.user import User
from app.models.trip import Route, Trip, Bus, Stop, DriverRouteAssignment, OccupancyLevel
from app.api.deps import get_current_active_user
from app.schemas.common import LocationData
from pydantic import BaseModel
from datetime import datetime
import uuid
from sqlalchemy import func

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

class ActiveTripResponse(BaseModel):
    tripId: Optional[str]
    routeId: Optional[int]
    status: str

class DriverStatsResponse(BaseModel):
    totalTrips: int
    kmDriven: float
    passengers: int

class DriverTripHistoryItem(BaseModel):
    id: int
    tripId: str
    routeName: str
    startTime: str
    endTime: Optional[str]
    status: str
    distance: float

@router.get("/routes", response_model=List[RouteResponse])
def get_assigned_routes(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get routes assigned to the driver. If none explicitly assigned, return active routes as fallback."""
    if current_user.role.value != "driver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Driver role required."
        )
    
    # Assigned route IDs
    assigned_ids = [r.route_id for r in db.query(DriverRouteAssignment).filter(DriverRouteAssignment.driver_id == current_user.id).all()]
    if assigned_ids:
        routes = db.query(Route).filter(Route.id.in_(assigned_ids), Route.is_active == True).all()
    else:
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
        # Auto-create a virtual bus for this route
        from datetime import datetime
        bus = Bus(
            bus_number=f"AUTO_{routeId}_{datetime.now().strftime('%m%d_%H%M')}",
            route_id=routeId,
            current_latitude=28.6139,  # Default Delhi location
            current_longitude=77.209,
            speed=0.0,
            occupancy=OccupancyLevel.LOW,
            is_active=False,
            last_updated=datetime.utcnow()
        )
        db.add(bus)
        db.flush()  # Get the bus ID without committing
        print(f"🚌 Auto-created bus {bus.bus_number} for route {routeId}")
    
    
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

@router.get("/trip/active", response_model=ActiveTripResponse)
def get_active_trip(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get the current active trip for the logged-in driver"""
    if current_user.role.value != "driver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Driver role required."
        )

    trip = db.query(Trip).filter(
        Trip.driver_id == current_user.id,
        Trip.status == "active"
    ).first()

    if not trip:
        return ActiveTripResponse(tripId=None, routeId=None, status="inactive")

    return ActiveTripResponse(
        tripId=trip.trip_id,
        routeId=trip.route_id,
        status="active"
    )

@router.get("/stats", response_model=DriverStatsResponse)
def get_driver_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Aggregated stats for driver profile: total trips, km driven, passengers."""
    if current_user.role.value != "driver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Driver role required."
        )

    total_trips = db.query(func.count()).select_from(Trip).filter(Trip.driver_id == current_user.id).scalar() or 0
    km_driven = db.query(func.coalesce(func.sum(Trip.distance_traveled), 0.0)).filter(Trip.driver_id == current_user.id).scalar() or 0.0
    # Passengers not tracked explicitly; return 0 for now or derive from future ticketing
    passengers = 0

    return DriverStatsResponse(totalTrips=int(total_trips), kmDriven=float(km_driven), passengers=passengers)

@router.get("/trips", response_model=List[DriverTripHistoryItem])
def get_driver_trip_history(
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get trip history for the logged-in driver."""
    if current_user.role.value != "driver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Driver role required."
        )

    trips = (
        db.query(Trip)
        .filter(Trip.driver_id == current_user.id)
        .order_by(Trip.start_time.desc())
        .limit(min(max(limit, 1), 100))
        .all()
    )

    items: List[DriverTripHistoryItem] = []
    for t in trips:
        items.append(DriverTripHistoryItem(
            id=t.id,
            tripId=t.trip_id,
            routeName=f"Route {t.route_id}",
            startTime=t.start_time.isoformat() if t.start_time else None,
            endTime=t.end_time.isoformat() if t.end_time else None,
            status=t.status.value if hasattr(t.status, 'value') else str(t.status),
            distance=t.distance_traveled or 0.0,
        ))

    return items
