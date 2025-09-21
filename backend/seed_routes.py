#!/usr/bin/env python3
"""
Seed script to add sample routes and stops to the database
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.trip import Route, Stop
from datetime import datetime

def seed_routes():
    """Add sample routes and stops data"""
    db = SessionLocal()
    
    try:
        # Clear existing data
        db.query(Stop).delete()
        db.query(Route).delete()
        db.commit()
        
        # Sample routes data
        routes_data = [
            {
                "name": "Route 101 - Downtown Loop",
                "description": "Circular route covering downtown area",
                "is_active": True
            },
            {
                "name": "Route 102 - University Express",
                "description": "Direct route from downtown to university",
                "is_active": True
            },
            {
                "name": "Route 103 - Airport Shuttle",
                "description": "Express service to and from airport",
                "is_active": True
            }
        ]
        
        # Create routes
        created_routes = []
        for route_data in routes_data:
            route = Route(**route_data)
            db.add(route)
            created_routes.append(route)
        
        db.commit()
        
        # Sample stops data for each route
        stops_data = [
            # Route 101 stops
            {
                "route_id": created_routes[0].id,
                "name": "Central Station",
                "latitude": 28.6139,
                "longitude": 77.209,
                "sequence_order": 1,
                "is_active": True
            },
            {
                "route_id": created_routes[0].id,
                "name": "Downtown Mall",
                "latitude": 28.6149,
                "longitude": 77.219,
                "sequence_order": 2,
                "is_active": True
            },
            {
                "route_id": created_routes[0].id,
                "name": "City Hall",
                "latitude": 28.6159,
                "longitude": 77.229,
                "sequence_order": 3,
                "is_active": True
            },
            {
                "route_id": created_routes[0].id,
                "name": "Business District",
                "latitude": 28.6169,
                "longitude": 77.239,
                "sequence_order": 4,
                "is_active": True
            },
            {
                "route_id": created_routes[0].id,
                "name": "Central Station",
                "latitude": 28.6139,
                "longitude": 77.209,
                "sequence_order": 5,
                "is_active": True
            },
            
            # Route 102 stops
            {
                "route_id": created_routes[1].id,
                "name": "Central Station",
                "latitude": 28.6139,
                "longitude": 77.209,
                "sequence_order": 1,
                "is_active": True
            },
            {
                "route_id": created_routes[1].id,
                "name": "University Gate",
                "latitude": 28.6239,
                "longitude": 77.309,
                "sequence_order": 2,
                "is_active": True
            },
            {
                "route_id": created_routes[1].id,
                "name": "Student Center",
                "latitude": 28.6249,
                "longitude": 77.319,
                "sequence_order": 3,
                "is_active": True
            },
            {
                "route_id": created_routes[1].id,
                "name": "Library",
                "latitude": 28.6259,
                "longitude": 77.329,
                "sequence_order": 4,
                "is_active": True
            },
            
            # Route 103 stops
            {
                "route_id": created_routes[2].id,
                "name": "Central Station",
                "latitude": 28.6139,
                "longitude": 77.209,
                "sequence_order": 1,
                "is_active": True
            },
            {
                "route_id": created_routes[2].id,
                "name": "Airport Terminal 1",
                "latitude": 28.6339,
                "longitude": 77.409,
                "sequence_order": 2,
                "is_active": True
            },
            {
                "route_id": created_routes[2].id,
                "name": "Airport Terminal 2",
                "latitude": 28.6349,
                "longitude": 77.419,
                "sequence_order": 3,
                "is_active": True
            }
        ]
        
        # Create stops
        for stop_data in stops_data:
            stop = Stop(**stop_data)
            db.add(stop)
        
        db.commit()
        print(f"✅ Added {len(routes_data)} routes and {len(stops_data)} stops to the database")
        
        # Verify the data
        route_count = db.query(Route).count()
        stop_count = db.query(Stop).count()
        print(f"📊 Total routes in database: {route_count}")
        print(f"📊 Total stops in database: {stop_count}")
        
        # Show route details
        for route in created_routes:
            stops = db.query(Stop).filter(Stop.route_id == route.id).order_by(Stop.sequence_order).all()
            print(f"  - {route.name}: {len(stops)} stops")
        
    except Exception as e:
        print(f"❌ Error seeding routes: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_routes()
