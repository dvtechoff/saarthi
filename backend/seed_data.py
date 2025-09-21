"""
Seed script to populate the database with initial data
"""
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.models.trip import Route, Stop, Bus, OccupancyLevel
from app.core.security import get_password_hash

def create_initial_data():
    """Create initial data for the application"""
    db = SessionLocal()
    
    try:
        # Create test users
        users_data = [
            {
                "email": "commuter@test.com",
                "password": "password123",
                "role": UserRole.COMMUTER,
                "name": "Test Commuter"
            },
            {
                "email": "driver@test.com", 
                "password": "password123",
                "role": UserRole.DRIVER,
                "name": "Test Driver"
            },
            {
                "email": "authority@test.com",
                "password": "password123", 
                "role": UserRole.AUTHORITY,
                "name": "Test Authority"
            }
        ]
        
        for user_data in users_data:
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()
            if not existing_user:
                user = User(
                    email=user_data["email"],
                    password_hash=get_password_hash(user_data["password"]),
                    role=user_data["role"],
                    name=user_data["name"]
                )
                db.add(user)
        
        # Create routes
        routes_data = [
            {
                "name": "Downtown Express",
                "description": "Main downtown route connecting key areas",
                "stops": [
                    {"name": "Central Station", "lat": 28.6139, "lng": 77.209, "order": 1},
                    {"name": "Market Square", "lat": 28.6239, "lng": 77.219, "order": 2},
                    {"name": "City Hall", "lat": 28.6339, "lng": 77.229, "order": 3},
                    {"name": "University Gate", "lat": 28.6439, "lng": 77.239, "order": 4}
                ]
            },
            {
                "name": "Suburb Link",
                "description": "Connects suburbs to city center",
                "stops": [
                    {"name": "North Gate", "lat": 28.6039, "lng": 77.199, "order": 1},
                    {"name": "Green Park", "lat": 28.5939, "lng": 77.189, "order": 2},
                    {"name": "Tech Park", "lat": 28.5839, "lng": 77.179, "order": 3}
                ]
            }
        ]
        
        for route_data in routes_data:
            existing_route = db.query(Route).filter(Route.name == route_data["name"]).first()
            if not existing_route:
                route = Route(
                    name=route_data["name"],
                    description=route_data["description"]
                )
                db.add(route)
                db.flush()  # Get the route ID
                
                # Create stops for this route
                for stop_data in route_data["stops"]:
                    stop = Stop(
                        name=stop_data["name"],
                        latitude=stop_data["lat"],
                        longitude=stop_data["lng"],
                        route_id=route.id,
                        sequence_order=stop_data["order"]
                    )
                    db.add(stop)
        
        # Create buses
        buses_data = [
            {"bus_number": "14", "route_name": "Downtown Express"},
            {"bus_number": "38", "route_name": "Downtown Express"},
            {"bus_number": "30", "route_name": "Suburb Link"},
            {"bus_number": "49", "route_name": "Suburb Link"}
        ]
        
        for bus_data in buses_data:
            existing_bus = db.query(Bus).filter(Bus.bus_number == bus_data["bus_number"]).first()
            if not existing_bus:
                route = db.query(Route).filter(Route.name == bus_data["route_name"]).first()
                if route:
                    bus = Bus(
                        bus_number=bus_data["bus_number"],
                        route_id=route.id,
                        current_latitude=28.6139 + 0.01,
                        current_longitude=77.209 + 0.01,
                        speed=25.0,
                        occupancy=OccupancyLevel.MEDIUM,
                        is_active=False
                    )
                    db.add(bus)
        
        db.commit()
        print("✅ Initial data created successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating initial data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_initial_data()
