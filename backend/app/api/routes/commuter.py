from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.user import User
from app.models.trip import Bus, Feedback, OccupancyLevel
from app.api.deps import get_current_active_user
from pydantic import BaseModel
from datetime import datetime, timedelta

router = APIRouter()

class BusResponse(BaseModel):
    id: int
    routeName: str
    currentStop: str
    nextStop: str
    latitude: float
    longitude: float
    speed: float
    occupancy: str
    lastUpdated: str
    
    class Config:
        from_attributes = True

class ETAResponse(BaseModel):
    eta: str

class FeedbackRequest(BaseModel):
    busId: int
    occupancy: str
    comment: str = ""

@router.get("/buses/nearby", response_model=List[BusResponse])
def get_nearby_buses(
    lat: float,
    lng: float,
    radius: int = 5000,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get nearby active buses"""
    if current_user.role.value != "commuter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Commuter role required."
        )
    
    # Import required models
    from app.models.trip import Route, Stop, Trip
    
    # Get active buses with their routes and current trip information
    buses = db.query(Bus).join(Route, Bus.route_id == Route.id).filter(
        Bus.is_active == True,
        Bus.current_latitude.isnot(None),
        Bus.current_longitude.isnot(None),
        Route.is_active == True
    ).all()
    
    # If no active buses found, return some demo data for testing
    if not buses:
        # Check if we have any buses at all (even inactive ones)
        all_buses = db.query(Bus).join(Route, Bus.route_id == Route.id).filter(
            Bus.current_latitude.isnot(None),
            Bus.current_longitude.isnot(None),
            Route.is_active == True
        ).limit(5).all()
        
        if all_buses:
            # Use existing buses but show them as active for demo
            buses = all_buses
        else:
            # Return demo data if no buses exist in database
            return [
                BusResponse(
                    id=1,
                    routeName="Demo Route A",
                    currentStop="Central Station",
                    nextStop="University Square",
                    latitude=lat + 0.005,
                    longitude=lng + 0.005,
                    speed=25.0,
                    occupancy="medium",
                    lastUpdated=datetime.utcnow().isoformat()
                ),
                BusResponse(
                    id=2,
                    routeName="Demo Route B", 
                    currentStop="Shopping Mall",
                    nextStop="City Center",
                    latitude=lat - 0.003,
                    longitude=lng + 0.008,
                    speed=30.0,
                    occupancy="low",
                    lastUpdated=datetime.utcnow().isoformat()
                )
            ]
    
    result = []
    for bus in buses:
        # Get route stops for this bus
        route_stops = db.query(Stop).filter(
            Stop.route_id == bus.route_id,
            Stop.is_active == True
        ).order_by(Stop.sequence_order).all()
        
        current_stop_name = "Route Start"
        next_stop_name = "Route End"
        
        if route_stops:
            # For now, use a simple logic: assume bus is at the first stop
            # In a real system, you'd calculate the closest stop based on GPS coordinates
            current_stop_name = route_stops[0].name
            if len(route_stops) > 1:
                next_stop_name = route_stops[1].name
            
            # Better logic: find closest stop to bus current location
            if bus.current_latitude and bus.current_longitude:
                min_distance = float('inf')
                closest_stop_index = 0
                
                for i, stop in enumerate(route_stops):
                    # Simple distance calculation (not precise, but works for demo)
                    distance = ((bus.current_latitude - stop.latitude) ** 2 + 
                              (bus.current_longitude - stop.longitude) ** 2) ** 0.5
                    if distance < min_distance:
                        min_distance = distance
                        closest_stop_index = i
                
                current_stop_name = route_stops[closest_stop_index].name
                if closest_stop_index + 1 < len(route_stops):
                    next_stop_name = route_stops[closest_stop_index + 1].name
        
        # Use real route name or fallback to bus number
        route_name = bus.route.name if bus.route else f"Bus {bus.bus_number}"
        
        result.append(BusResponse(
            id=bus.id,
            routeName=route_name,
            currentStop=current_stop_name,
            nextStop=next_stop_name,
            latitude=bus.current_latitude,
            longitude=bus.current_longitude,
            speed=bus.speed or 0.0,
            occupancy=bus.occupancy.value,
            lastUpdated=bus.last_updated.isoformat() if bus.last_updated else datetime.utcnow().isoformat()
        ))
    
    return result

@router.get("/bus/{bus_id}/eta/{stop_id}", response_model=ETAResponse)
def get_bus_eta(
    bus_id: int,
    stop_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get estimated time of arrival for a bus at a specific stop"""
    if current_user.role.value != "commuter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Commuter role required."
        )
    
    # Mock ETA calculation (in production, use real-time data and algorithms)
    return ETAResponse(eta="5 minutes")

@router.post("/feedback")
def submit_feedback(
    feedback_data: FeedbackRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Submit crowd feedback for a bus"""
    if current_user.role.value != "commuter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Commuter role required."
        )
    
    # Validate bus exists
    bus = db.query(Bus).filter(Bus.id == feedback_data.busId).first()
    if not bus:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bus not found"
        )
    
    # Validate occupancy level
    try:
        occupancy = OccupancyLevel(feedback_data.occupancy)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid occupancy level. Must be 'low', 'medium', or 'high'"
        )
    
    # Create feedback
    feedback = Feedback(
        commuter_id=current_user.id,
        bus_id=feedback_data.busId,
        occupancy=occupancy,
        comment=feedback_data.comment
    )
    
    db.add(feedback)
    db.commit()
    
    return {"message": "Feedback submitted successfully"}
