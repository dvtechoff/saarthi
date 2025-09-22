from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Saarthi API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Saarthi API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/routes")
async def get_routes():
    """Get all routes for drivers"""
    return [
        {
            "id": 1,
            "name": "Route 101 - Downtown Loop",
            "description": "Circular route covering downtown area",
            "stops": [
                {"id": 1, "name": "Central Station", "latitude": 28.6139, "longitude": 77.209, "sequence_order": 1},
                {"id": 2, "name": "Downtown Mall", "latitude": 28.6149, "longitude": 77.219, "sequence_order": 2},
                {"id": 3, "name": "City Hall", "latitude": 28.6159, "longitude": 77.229, "sequence_order": 3},
                {"id": 4, "name": "Business District", "latitude": 28.6169, "longitude": 77.239, "sequence_order": 4},
                {"id": 5, "name": "Central Station", "latitude": 28.6139, "longitude": 77.209, "sequence_order": 5}
            ]
        },
        {
            "id": 2,
            "name": "Route 102 - University Express", 
            "description": "Direct route from downtown to university",
            "stops": [
                {"id": 6, "name": "Central Station", "latitude": 28.6139, "longitude": 77.209, "sequence_order": 1},
                {"id": 7, "name": "University Gate", "latitude": 28.6239, "longitude": 77.309, "sequence_order": 2},
                {"id": 8, "name": "Student Center", "latitude": 28.6249, "longitude": 77.319, "sequence_order": 3},
                {"id": 9, "name": "Library", "latitude": 28.6259, "longitude": 77.329, "sequence_order": 4}
            ]
        },
        {
            "id": 3,
            "name": "Route 103 - Airport Shuttle",
            "description": "Express service to and from airport", 
            "stops": [
                {"id": 10, "name": "Central Station", "latitude": 28.6139, "longitude": 77.209, "sequence_order": 1},
                {"id": 11, "name": "Airport Terminal 1", "latitude": 28.6339, "longitude": 77.409, "sequence_order": 2},
                {"id": 12, "name": "Airport Terminal 2", "latitude": 28.6349, "longitude": 77.419, "sequence_order": 3}
            ]
        }
    ]

@app.post("/api/v1/driver/trip/start")
async def start_trip(routeId: str):
    """Start a new trip for the driver"""
    import time
    trip_id = f"trip_{int(time.time())}"
    return {
        "tripId": trip_id,
        "routeId": routeId,
        "status": "active",
        "message": "Trip started successfully"
    }

@app.post("/api/v1/driver/trip/stop")
async def stop_trip(tripId: str):
    """Stop the current trip"""
    return {
        "tripId": tripId,
        "status": "completed",
        "message": "Trip stopped successfully"
    }

@app.get("/api/v1/driver/trip/active")
async def get_active_trip():
    """Get the driver's active trip (mock implementation)"""
    return {
        "tripId": None,
        "routeId": None,
        "status": "inactive",
        "message": "No active trip"
    }

if __name__ == "__main__":
    print("Starting Saarthi API server on http://localhost:8002")
    uvicorn.run(app, host="0.0.0.0", port=8002, log_level="info")
