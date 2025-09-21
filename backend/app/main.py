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

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Real-time bus tracking API for Saarthi",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "*.yourdomain.com"]
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

asgi = socketio.ASGIApp(sio_app, other_asgi_app=app)

if __name__ == "__main__":
    uvicorn.run("app.main:asgi", host="0.0.0.0", port=8000, reload=True)
