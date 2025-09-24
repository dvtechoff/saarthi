"""
Graph-based API endpoints for route optimization and stop management
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User, UserRole
from app.db.neo4j import get_neo4j_session
from app.models.graph import GraphService, Stop, Route, Connection
from neo4j import Session as Neo4jSession
from typing import List, Dict, Any
from pydantic import BaseModel

router = APIRouter()

def check_neo4j_available(neo4j_session):
    """Check if Neo4j is available, raise HTTP 503 if not"""
    if neo4j_session is None:
        raise HTTPException(
            status_code=503, 
            detail="Graph database unavailable. Neo4j connection not configured."
        )

class StopCreate(BaseModel):
    id: str
    name: str
    latitude: float
    longitude: float
    stop_type: str = "regular"
    facilities: List[str] = []

class RouteCreate(BaseModel):
    id: str
    name: str
    number: str
    direction: str
    route_type: str = "city"
    frequency: int = 15

class ConnectionCreate(BaseModel):
    from_stop: str
    to_stop: str
    route_id: str
    distance: float
    travel_time: int
    sequence: int

class PathRequest(BaseModel):
    start_stop: str
    end_stop: str
    route_id: str = None

@router.post("/stops")
def create_stop(
    stop_data: StopCreate, 
    current_user: User = Depends(get_current_user),
    neo4j_session: Neo4jSession = Depends(get_neo4j_session)
):
    """Create a new bus stop"""
    if current_user.role != UserRole.authority:
        raise HTTPException(status_code=403, detail="Only authority can create stops")
    
    check_neo4j_available(neo4j_session)
    graph_service = GraphService(neo4j_session)
    stop = Stop(
        id=stop_data.id,
        name=stop_data.name,
        latitude=stop_data.latitude,
        longitude=stop_data.longitude,
        stop_type=stop_data.stop_type,
        facilities=stop_data.facilities
    )
    
    success = graph_service.create_stop(stop)
    if success:
        return {"message": "Stop created successfully", "stop_id": stop.id}
    else:
        raise HTTPException(status_code=500, detail="Failed to create stop")

@router.post("/routes")
def create_route(
    route_data: RouteCreate,
    current_user: User = Depends(get_current_user),
    neo4j_session: Neo4jSession = Depends(get_neo4j_session)
):
    """Create a new bus route"""
    if current_user.role != UserRole.authority:
        raise HTTPException(status_code=403, detail="Only authority can create routes")
    
    graph_service = GraphService(neo4j_session)
    route = Route(
        id=route_data.id,
        name=route_data.name,
        number=route_data.number,
        direction=route_data.direction,
        route_type=route_data.route_type,
        frequency=route_data.frequency
    )
    
    success = graph_service.create_route(route)
    if success:
        return {"message": "Route created successfully", "route_id": route.id}
    else:
        raise HTTPException(status_code=500, detail="Failed to create route")

@router.post("/connections")
def create_connection(
    connection_data: ConnectionCreate,
    current_user: User = Depends(get_current_user),
    neo4j_session: Neo4jSession = Depends(get_neo4j_session)
):
    """Create connection between stops"""
    if current_user.role != UserRole.authority:
        raise HTTPException(status_code=403, detail="Only authority can create connections")
    
    graph_service = GraphService(neo4j_session)
    connection = Connection(
        from_stop=connection_data.from_stop,
        to_stop=connection_data.to_stop,
        route_id=connection_data.route_id,
        distance=connection_data.distance,
        travel_time=connection_data.travel_time,
        sequence=connection_data.sequence
    )
    
    success = graph_service.create_connection(connection)
    if success:
        return {"message": "Connection created successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to create connection")

@router.get("/stops/nearby")
def get_nearby_stops(
    lat: float,
    lng: float,
    radius: float = 1000,
    neo4j_session: Neo4jSession = Depends(get_neo4j_session)
):
    """Get stops within radius of given coordinates"""
    graph_service = GraphService(neo4j_session)
    stops = graph_service.get_nearby_stops(lat, lng, radius)
    return {"stops": stops}

@router.get("/routes/{route_id}/stops")
def get_route_stops(
    route_id: str,
    neo4j_session: Neo4jSession = Depends(get_neo4j_session)
):
    """Get all stops for a route in sequence"""
    graph_service = GraphService(neo4j_session)
    stops = graph_service.get_route_stops(route_id)
    return {"route_id": route_id, "stops": stops}

@router.get("/stops/{stop_id}/routes")
def get_routes_through_stop(
    stop_id: str,
    neo4j_session: Neo4jSession = Depends(get_neo4j_session)
):
    """Get all routes that pass through a stop"""
    graph_service = GraphService(neo4j_session)
    routes = graph_service.get_routes_through_stop(stop_id)
    return {"stop_id": stop_id, "routes": routes}

@router.post("/path")
def find_shortest_path(
    path_request: PathRequest,
    neo4j_session: Neo4jSession = Depends(get_neo4j_session)
):
    """Find shortest path between two stops"""
    graph_service = GraphService(neo4j_session)
    path = graph_service.find_shortest_path(
        path_request.start_stop,
        path_request.end_stop,
        path_request.route_id
    )
    return {"path": path}

@router.post("/optimize")
def optimize_route(
    path_request: PathRequest,
    neo4j_session: Neo4jSession = Depends(get_neo4j_session)
):
    """Find optimal route between two stops"""
    graph_service = GraphService(neo4j_session)
    optimization = graph_service.optimize_route(
        path_request.start_stop,
        path_request.end_stop
    )
    return optimization

@router.post("/eta")
def calculate_eta(
    bus_location: Dict[str, Any],
    target_stop: str,
    route_id: str,
    neo4j_session: Neo4jSession = Depends(get_neo4j_session)
):
    """Calculate estimated time of arrival"""
    graph_service = GraphService(neo4j_session)
    eta = graph_service.calculate_eta(bus_location, target_stop, route_id)
    return {"eta_minutes": eta, "target_stop": target_stop, "route_id": route_id}
