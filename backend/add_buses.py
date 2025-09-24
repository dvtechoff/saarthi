#!/usr/bin/env python3
"""
Script to add additional buses for routes that need more available buses
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.trip import Bus, OccupancyLevel, Route
from datetime import datetime
import random

def add_buses():
    """Add additional buses to routes that need them"""
    db = SessionLocal()
    
    try:
        # Get current buses and routes
        buses = db.query(Bus).all()
        routes = db.query(Route).filter(Route.is_active == True).all()
        
        print(f"📊 Found {len(routes)} active routes")
        
        buses_to_add = []
        
        # Check each route and add buses if needed
        for route in routes:
            route_buses = [b for b in buses if b.route_id == route.id]
            available_buses = [b for b in route_buses if not b.is_active]
            
            print(f"Route {route.id} ({route.name}): {len(route_buses)} total, {len(available_buses)} available")
            
            # If less than 2 available buses, add more
            if len(available_buses) < 2:
                buses_needed = 2 - len(available_buses)
                print(f"  → Adding {buses_needed} buses for route {route.id}")
                
                for i in range(buses_needed):
                    bus_number = f"BUS_{route.id}_{len(route_buses) + i + 1:02d}"
                    bus_data = {
                        "bus_number": bus_number,
                        "route_id": route.id,
                        "current_latitude": 28.6139 + random.uniform(-0.01, 0.01),
                        "current_longitude": 77.209 + random.uniform(-0.01, 0.01),
                        "speed": random.uniform(20, 40),
                        "occupancy": random.choice([OccupancyLevel.LOW, OccupancyLevel.MEDIUM, OccupancyLevel.HIGH]),
                        "is_active": False,  # Available for assignment
                        "last_updated": datetime.utcnow()
                    }
                    buses_to_add.append(bus_data)
        
        # Add the new buses
        if buses_to_add:
            for bus_data in buses_to_add:
                bus = Bus(**bus_data)
                db.add(bus)
            
            db.commit()
            print(f"✅ Added {len(buses_to_add)} new buses to the database")
        else:
            print("✅ All routes have sufficient available buses")
        
        # Verify the final state
        print("\n=== Final Bus Distribution ===")
        buses = db.query(Bus).all()  # Refresh data
        for route in routes:
            route_buses = [b for b in buses if b.route_id == route.id]
            available_buses = [b for b in route_buses if not b.is_active]
            print(f"Route {route.id} ({route.name}): {len(route_buses)} total buses, {len(available_buses)} available")
        
    except Exception as e:
        print(f"❌ Error adding buses: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_buses()