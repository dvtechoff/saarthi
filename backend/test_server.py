from fastapi import FastAPI, Depends
from app.db.session import get_db
from app.models.trip import Route, Stop
from sqlalchemy.orm import Session

app = FastAPI()

@app.get("/api/routes")
async def get_routes(db: Session = Depends(get_db)):
    """Get all active routes (public endpoint)"""
    routes = db.query(Route).filter(Route.is_active == True).all()
    
    result = []
    for route in routes:
        stops = db.query(Stop).filter(
            Stop.route_id == route.id,
            Stop.is_active == True
        ).order_by(Stop.sequence_order).all()
        
        stops_data = [
            {
                "id": stop.id,
                "name": stop.name,
                "latitude": stop.latitude,
                "longitude": stop.longitude,
                "sequence_order": stop.sequence_order
            }
            for stop in stops
        ]
        
        result.append({
            "id": route.id,
            "name": route.name,
            "description": route.description,
            "stops": stops_data
        })
    
    return result

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Test server is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
