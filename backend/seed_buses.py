#!/usr/bin/env python3
"""
Seed script to add sample bus data to the database
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.trip import Bus, OccupancyLevel, Route
from datetime import datetime, timedelta
import random

def seed_buses():
    """Add sample bus data"""
    db = SessionLocal()
    
    try:
        # Clear existing buses
        db.query(Bus).delete()
        db.commit()
        
        # Get available routes
        routes = db.query(Route).filter(Route.is_active == True).all()
        if not routes:
            print("❌ No active routes found. Please run seed_routes.py first.")
            return
        
        print(f"📊 Found {len(routes)} active routes")
        
        # Sample bus data with route assignments
        buses_data = [
            {
                "bus_number": "BUS001",
                "route_id": routes[0].id,  # Assign to first route
                "current_latitude": 28.6139 + random.uniform(-0.01, 0.01),
                "current_longitude": 77.209 + random.uniform(-0.01, 0.01),
                "speed": random.uniform(20, 40),
                "occupancy": OccupancyLevel.LOW,
                "is_active": False,  # Set to False so they can be assigned to trips
                "last_updated": datetime.utcnow()
            },
            {
                "bus_number": "BUS002", 
                "route_id": routes[0].id,  # Assign to first route
                "current_latitude": 28.6139 + random.uniform(-0.01, 0.01),
                "current_longitude": 77.209 + random.uniform(-0.01, 0.01),
                "speed": random.uniform(20, 40),
                "occupancy": OccupancyLevel.MEDIUM,
                "is_active": False,
                "last_updated": datetime.utcnow()
            },
            {
                "bus_number": "BUS003",
                "route_id": routes[1].id if len(routes) > 1 else routes[0].id,  # Assign to second route
                "current_latitude": 28.6139 + random.uniform(-0.01, 0.01),
                "current_longitude": 77.209 + random.uniform(-0.01, 0.01),
                "speed": random.uniform(20, 40),
                "occupancy": OccupancyLevel.HIGH,
                "is_active": False,
                "last_updated": datetime.utcnow()
            },
            {
                "bus_number": "BUS004",
                "route_id": routes[2].id if len(routes) > 2 else routes[0].id,  # Assign to third route
                "current_latitude": 28.6139 + random.uniform(-0.01, 0.01),
                "current_longitude": 77.209 + random.uniform(-0.01, 0.01),
                "speed": random.uniform(20, 40),
                "occupancy": OccupancyLevel.LOW,
                "is_active": False,
                "last_updated": datetime.utcnow()
            },
            {
                "bus_number": "BUS005",
                "route_id": routes[0].id,  # Assign to first route
                "current_latitude": 28.6139 + random.uniform(-0.01, 0.01),
                "current_longitude": 77.209 + random.uniform(-0.01, 0.01),
                "speed": random.uniform(20, 40),
                "occupancy": OccupancyLevel.MEDIUM,
                "is_active": False,
                "last_updated": datetime.utcnow()
            }
        ]
        
        # Create bus objects
        for bus_data in buses_data:
            bus = Bus(**bus_data)
            db.add(bus)
        
        db.commit()
        print(f"✅ Added {len(buses_data)} sample buses to the database")
        
        # Verify the data
        bus_count = db.query(Bus).count()
        print(f"📊 Total buses in database: {bus_count}")
        
    except Exception as e:
        print(f"❌ Error seeding buses: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_buses()
