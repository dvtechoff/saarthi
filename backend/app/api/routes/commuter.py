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
    
    # Get active buses (simplified - in production, use proper geospatial queries)
    buses = db.query(Bus).filter(
        Bus.is_active == True,
        Bus.current_latitude.isnot(None),
        Bus.current_longitude.isnot(None)
    ).all()
    
    result = []
    for bus in buses:
        # Mock data for demonstration
        result.append(BusResponse(
            id=bus.id,
            routeName=f"Route {bus.bus_number}",
            currentStop="Market St & 5th St",
            nextStop="Mission St & 6th St",
            latitude=bus.current_latitude or lat + 0.01,
            longitude=bus.current_longitude or lng + 0.01,
            speed=bus.speed or 25.0,
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
