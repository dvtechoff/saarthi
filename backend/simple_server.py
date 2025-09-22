from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Simple server is running"}

@app.get("/api/routes")
async def get_routes():
    """Mock routes endpoint for testing"""
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
