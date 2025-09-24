from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.user import User
from app.models.trip import Bus, Trip, Feedback, Route, Stop, DriverRouteAssignment
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

class UserOut(BaseModel):
    id: int
    email: str
    role: str
    name: str | None
    phone: str | None
    is_active: bool

class UserCreate(BaseModel):
    email: str
    password: str
    role: str = "commuter"
    name: str | None = None
    phone: str | None = None

class UserUpdate(BaseModel):
    role: str | None = None
    name: str | None = None
    phone: str | None = None
    is_active: bool | None = None

class BusOut(BaseModel):
    id: int
    bus_number: str
    route_id: int | None
    is_active: bool
    current_latitude: float | None
    current_longitude: float | None

class BusCreate(BaseModel):
    bus_number: str
    route_id: int | None = None

class BusUpdate(BaseModel):
    route_id: int | None = None
    is_active: bool | None = None

class StopOut(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    sequence_order: int

class RouteOut(BaseModel):
    id: int
    name: str
    description: str | None
    is_active: bool
    stops: list[StopOut]

class RouteCreate(BaseModel):
    name: str
    description: str | None = None

class RouteUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    is_active: bool | None = None

class StopCreate(BaseModel):
    route_id: int
    name: str
    latitude: float
    longitude: float
    sequence_order: int

class StopUpdate(BaseModel):
    name: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    sequence_order: int | None = None

class DriverRoutesPayload(BaseModel):
    route_ids: List[int]

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

# Buses CRUD
@router.get("/buses/all", response_model=List[BusOut])
def list_buses(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role.value != "authority":
        raise HTTPException(status_code=403, detail="Access denied. Authority role required.")
    buses = db.query(Bus).all()
    return [BusOut(
        id=b.id,
        bus_number=b.bus_number,
        route_id=b.route_id,
        is_active=b.is_active,
        current_latitude=b.current_latitude,
        current_longitude=b.current_longitude,
    ) for b in buses]

@router.post("/buses", response_model=BusOut, status_code=201)
def create_bus(payload: BusCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role.value != "authority":
        raise HTTPException(status_code=403, detail="Access denied. Authority role required.")
    if db.query(Bus).filter(Bus.bus_number == payload.bus_number).first():
        raise HTTPException(status_code=400, detail="Bus number already exists")
    b = Bus(bus_number=payload.bus_number, route_id=payload.route_id or None, is_active=False)
    db.add(b)
    db.commit()
    db.refresh(b)
    return BusOut(id=b.id, bus_number=b.bus_number, route_id=b.route_id, is_active=b.is_active, current_latitude=b.current_latitude, current_longitude=b.current_longitude)

@router.patch("/buses/{bus_id}", response_model=BusOut)
def update_bus(bus_id: int, payload: BusUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role.value != "authority":
        raise HTTPException(status_code=403, detail="Access denied. Authority role required.")
    b = db.query(Bus).filter(Bus.id == bus_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Bus not found")
    if payload.route_id is not None:
        b.route_id = payload.route_id
    if payload.is_active is not None:
        b.is_active = payload.is_active
    db.commit()
    db.refresh(b)
    return BusOut(id=b.id, bus_number=b.bus_number, route_id=b.route_id, is_active=b.is_active, current_latitude=b.current_latitude, current_longitude=b.current_longitude)

# Routes CRUD
@router.get("/routes/all", response_model=List[RouteOut])
def list_routes(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role.value != "authority":
        raise HTTPException(status_code=403, detail="Access denied. Authority role required.")
    routes = db.query(Route).all()
    result: List[RouteOut] = []
    for r in routes:
        stops = db.query(Stop).filter(Stop.route_id == r.id).order_by(Stop.sequence_order).all()
        result.append(RouteOut(
            id=r.id,
            name=r.name,
            description=r.description,
            is_active=r.is_active,
            stops=[StopOut(id=s.id, name=s.name, latitude=s.latitude, longitude=s.longitude, sequence_order=s.sequence_order) for s in stops]
        ))
    return result

@router.post("/routes", response_model=RouteOut, status_code=201)
def create_route(payload: RouteCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role.value != "authority":
        raise HTTPException(status_code=403, detail="Access denied. Authority role required.")
    r = Route(name=payload.name, description=payload.description, is_active=True)
    db.add(r)
    db.commit()
    db.refresh(r)
    return RouteOut(id=r.id, name=r.name, description=r.description, is_active=r.is_active, stops=[])

@router.patch("/routes/{route_id}", response_model=RouteOut)
def update_route(route_id: int, payload: RouteUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role.value != "authority":
        raise HTTPException(status_code=403, detail="Access denied. Authority role required.")
    r = db.query(Route).filter(Route.id == route_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Route not found")
    if payload.name is not None:
        r.name = payload.name
    if payload.description is not None:
        r.description = payload.description
    if payload.is_active is not None:
        r.is_active = payload.is_active
    db.commit()
    stops = db.query(Stop).filter(Stop.route_id == r.id).order_by(Stop.sequence_order).all()
    return RouteOut(id=r.id, name=r.name, description=r.description, is_active=r.is_active, stops=[StopOut(id=s.id, name=s.name, latitude=s.latitude, longitude=s.longitude, sequence_order=s.sequence_order) for s in stops])

# Stops CRUD
@router.post("/stops", response_model=StopOut, status_code=201)
def create_stop(payload: StopCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role.value != "authority":
        raise HTTPException(status_code=403, detail="Access denied. Authority role required.")
    s = Stop(route_id=payload.route_id, name=payload.name, latitude=payload.latitude, longitude=payload.longitude, sequence_order=payload.sequence_order)
    db.add(s)
    db.commit()
    db.refresh(s)
    return StopOut(id=s.id, name=s.name, latitude=s.latitude, longitude=s.longitude, sequence_order=s.sequence_order)

@router.get("/drivers/{driver_id}/routes", response_model=List[int])
def get_driver_routes(driver_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role.value != "authority":
        raise HTTPException(status_code=403, detail="Access denied. Authority role required.")
    assignments = db.query(DriverRouteAssignment).filter(DriverRouteAssignment.driver_id == driver_id).all()
    return [a.route_id for a in assignments]

@router.put("/drivers/{driver_id}/routes", response_model=List[int])
def set_driver_routes(driver_id: int, payload: DriverRoutesPayload, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role.value != "authority":
        raise HTTPException(status_code=403, detail="Access denied. Authority role required.")
    # Remove existing
    db.query(DriverRouteAssignment).filter(DriverRouteAssignment.driver_id == driver_id).delete()
    # Add new
    for rid in payload.route_ids:
        db.add(DriverRouteAssignment(driver_id=driver_id, route_id=rid))
    db.commit()
    return payload.route_ids

@router.patch("/stops/{stop_id}", response_model=StopOut)
def update_stop(stop_id: int, payload: StopUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if current_user.role.value != "authority":
        raise HTTPException(status_code=403, detail="Access denied. Authority role required.")
    s = db.query(Stop).filter(Stop.id == stop_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Stop not found")
    if payload.name is not None:
        s.name = payload.name
    if payload.latitude is not None:
        s.latitude = payload.latitude
    if payload.longitude is not None:
        s.longitude = payload.longitude
    if payload.sequence_order is not None:
        s.sequence_order = payload.sequence_order
    db.commit()
    db.refresh(s)
    return StopOut(id=s.id, name=s.name, latitude=s.latitude, longitude=s.longitude, sequence_order=s.sequence_order)


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

@router.get("/users", response_model=List[UserOut])
def list_users(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "authority":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Authority role required.")
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        UserOut(
            id=u.id,
            email=u.email,
            role=u.role.value,
            name=u.name,
            phone=u.phone,
            is_active=u.is_active,
        ) for u in users
    ]

@router.post("/users", response_model=UserOut, status_code=201)
def create_user(
    payload: UserCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "authority":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Authority role required.")
    # simplistic creation using auth hashing utilities if available
    from app.core.security import get_password_hash
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    try:
        role_value = payload.role
        u = User(
            email=payload.email,
            password_hash=get_password_hash(payload.password),
            role=role_value,
            name=payload.name,
            phone=payload.phone,
            is_active=True,
        )
        db.add(u)
        db.commit()
        db.refresh(u)
        return UserOut(id=u.id, email=u.email, role=u.role.value, name=u.name, phone=u.phone, is_active=u.is_active)
    except Exception:
        db.rollback()
        raise

@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    payload: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if current_user.role.value != "authority":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied. Authority role required.")
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.role is not None:
        u.role = payload.role
    if payload.name is not None:
        u.name = payload.name
    if payload.phone is not None:
        u.phone = payload.phone
    if payload.is_active is not None:
        u.is_active = payload.is_active
    db.commit()
    db.refresh(u)
    return UserOut(id=u.id, email=u.email, role=u.role.value, name=u.name, phone=u.phone, is_active=u.is_active)
