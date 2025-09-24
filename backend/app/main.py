from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import socketio
import uvicorn
import time
import logging

from app.core.config import settings
from app.core.logging import logger
from app.core.rate_limiting import rate_limit_middleware
from app.core.security import SecurityHeaders
from app.api.routes import auth, driver, commuter, authority, graph
from app.realtime.socket import sio_app
from app.db.session import get_db, SessionLocal
from app.models.trip import Route, Stop
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from sqlalchemy.exc import SQLAlchemyError
import os
from sqlalchemy.orm import Session
from typing import List
from fastapi import Depends

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Real-time bus tracking API for Saarthi",
    docs_url="/docs",
    redoc_url="/redoc",
)

if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "*.railway.app", "*.up.railway.app"]
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(rate_limit_middleware("api"))

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"Request: {request.method} {request.url.path} from {request.client.host}")
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"Response: {response.status_code} in {process_time:.3f}s")
    # Skip strict headers for Swagger UI and OpenAPI JSON to avoid CSP conflicts
    path = request.url.path
    if not (path.startswith("/docs") or path.startswith("/redoc") or path.startswith("/openapi.json")):
        for header, value in SecurityHeaders.get_headers().items():
            response.headers[header] = value
    response.headers["X-Process-Time"] = str(process_time)
    return response

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(driver.router, prefix=f"{settings.API_V1_STR}/driver", tags=["Driver"])
app.include_router(commuter.router, prefix=f"{settings.API_V1_STR}/commuter", tags=["Commuter"])
app.include_router(authority.router, prefix=f"{settings.API_V1_STR}/authority", tags=["Authority"])
app.include_router(graph.router, prefix=f"{settings.API_V1_STR}/graph", tags=["Graph"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Saarthi API is running"}

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

asgi = socketio.ASGIApp(sio_app, other_asgi_app=app)

@app.on_event("startup")
def ensure_default_authority():
    """Ensure a default authority user exists for initial login."""
    admin_email = os.getenv("ADMIN_EMAIL", "authority@example.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "password123")
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == admin_email).first()
        if not existing:
            user = User(
                email=admin_email,
                password_hash=get_password_hash(admin_password),
                role=UserRole.AUTHORITY,
                name="Authority Admin",
                is_active=True,
            )
            db.add(user)
            db.commit()
    except SQLAlchemyError as e:
        logger.error(f"Failed to ensure default authority user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    uvicorn.run("app.main:asgi", host="0.0.0.0", port=8000, reload=True)
