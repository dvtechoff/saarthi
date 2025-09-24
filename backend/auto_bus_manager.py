#!/usr/bin/env python3
"""
Auto-bus management: Automatically ensure every route has sufficient virtual buses
This eliminates the manual bus seeding complexity while keeping the architecture
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.trip import Bus, OccupancyLevel, Route
from datetime import datetime

def ensure_route_buses(route_id: int, min_buses: int = 3):
    """Ensure a route has minimum number of available buses"""
    db = SessionLocal()
    try:
        # Check current available buses for this route
        available_buses = db.query(Bus).filter(
            Bus.route_id == route_id,
            Bus.is_active == False
        ).count()
        
        if available_buses < min_buses:
            buses_needed = min_buses - available_buses
            
            for i in range(buses_needed):
                # Auto-generate virtual bus
                bus = Bus(
                    bus_number=f"AUTO_{route_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{i+1}",
                    route_id=route_id,
                    current_latitude=28.6139,  # Default location
                    current_longitude=77.209,
                    speed=0.0,
                    occupancy=OccupancyLevel.LOW,
                    is_active=False,
                    last_updated=datetime.utcnow()
                )
                db.add(bus)
            
            db.commit()
            print(f"✅ Added {buses_needed} auto-buses for route {route_id}")
        
    finally:
        db.close()

def auto_manage_buses():
    """Automatically ensure all routes have sufficient buses"""
    db = SessionLocal()
    try:
        routes = db.query(Route).filter(Route.is_active == True).all()
        for route in routes:
            ensure_route_buses(route.id)
    finally:
        db.close()

if __name__ == "__main__":
    auto_manage_buses()