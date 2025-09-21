from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.user import User
from app.models.trip import Bus, Trip, Feedback
from app.api.deps import get_current_active_user
from pydantic import BaseModel
from datetime import datetime, timedelta
from sqlalchemy import func

router = APIRouter()

class ActiveBusResponse(BaseModel):
    id: int
    busNumber: str
    routeName: str
    currentStop: str
    nextStop: str
    latitude: float
    longitude: float
    speed: float
    occupancy: str
    driverName: str
    lastUpdated: str
    
    class Config:
        from_attributes = True

class AnalyticsResponse(BaseModel):
    totalTrips: int
    activeTrips: int
    totalBuses: int
    activeBuses: int
    totalFeedbacks: int
    averageSpeed: float
    onTimeRate: float

class TripHistoryResponse(BaseModel):
    id: int
    tripId: str
    routeName: str
    driverName: str
    startTime: str
    endTime: Optional[str]
    status: str
    distance: float

@router.get("/buses", response_model=List[ActiveBusResponse])
def get_all_buses(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all active buses for authority monitoring"""
    if current_user.role.value != "authority":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Authority role required."
        )
    
    # Get active buses with their routes
    buses = db.query(Bus).filter(Bus.is_active == True).all()
    
    result = []
    for bus in buses:
        # Mock data for demonstration
        result.append(ActiveBusResponse(
            id=bus.id,
            busNumber=bus.bus_number,
            routeName=f"Route {bus.bus_number}",
            currentStop="Market St & 5th St",
            nextStop="Mission St & 6th St",
            latitude=bus.current_latitude or 0.0,
            longitude=bus.current_longitude or 0.0,
            speed=bus.speed or 0.0,
            occupancy=bus.occupancy.value,
            driverName=f"Driver {bus.id}",
            lastUpdated=bus.last_updated.isoformat() if bus.last_updated else datetime.utcnow().isoformat()
        ))
    
    return result

@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get system analytics for authority dashboard"""
    if current_user.role.value != "authority":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Authority role required."
        )
    
    # Get statistics
    total_trips = db.query(Trip).count()
    active_trips = db.query(Trip).filter(Trip.status == "active").count()
    total_buses = db.query(Bus).count()
    active_buses = db.query(Bus).filter(Bus.is_active == True).count()
    total_feedbacks = db.query(Feedback).count()
    
    # Calculate average speed
    avg_speed_result = db.query(func.avg(Bus.speed)).filter(Bus.is_active == True).scalar()
    average_speed = float(avg_speed_result) if avg_speed_result else 0.0
    
    # Mock on-time rate (in production, calculate based on actual data)
    on_time_rate = 94.2
    
    return AnalyticsResponse(
        totalTrips=total_trips,
        activeTrips=active_trips,
        totalBuses=total_buses,
        activeBuses=active_buses,
        totalFeedbacks=total_feedbacks,
        averageSpeed=round(average_speed, 2),
        onTimeRate=on_time_rate
    )

@router.get("/trips", response_model=List[TripHistoryResponse])
def get_trip_history(
    driverId: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get trip history for authority monitoring"""
    if current_user.role.value != "authority":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Authority role required."
        )
    
    # Build query
    query = db.query(Trip)
    if driverId:
        query = query.filter(Trip.driver_id == driverId)
    
    trips = query.order_by(Trip.start_time.desc()).limit(50).all()
    
    result = []
    for trip in trips:
        result.append(TripHistoryResponse(
            id=trip.id,
            tripId=trip.trip_id,
            routeName=f"Route {trip.route_id}",
            driverName=f"Driver {trip.driver_id}",
            startTime=trip.start_time.isoformat(),
            endTime=trip.end_time.isoformat() if trip.end_time else None,
            status=trip.status.value,
            distance=trip.distance_traveled
        ))
    
    return result
