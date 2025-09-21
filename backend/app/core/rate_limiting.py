"""
Rate limiting configuration and middleware
"""

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
import time
from typing import Dict, Tuple
from collections import defaultdict, deque
import asyncio
from app.core.config import settings

class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        self.requests: Dict[str, deque] = defaultdict(deque)
        self.cleanup_interval = 300  # 5 minutes
        self.last_cleanup = time.time()
    
    def is_allowed(self, key: str, limit: int, window: int) -> Tuple[bool, int]:
        """
        Check if request is allowed
        Returns (is_allowed, remaining_requests)
        """
        now = time.time()
        
        # Cleanup old entries periodically
        if now - self.last_cleanup > self.cleanup_interval:
            self._cleanup_old_entries(now)
            self.last_cleanup = now
        
        # Get request history for this key
        requests = self.requests[key]
        
        # Remove requests outside the window
        while requests and requests[0] <= now - window:
            requests.popleft()
        
        # Check if under limit
        if len(requests) < limit:
            requests.append(now)
            return True, limit - len(requests)
        else:
            return False, 0
    
    def _cleanup_old_entries(self, now: float):
        """Remove old entries to prevent memory leaks"""
        cutoff = now - 3600  # 1 hour
        keys_to_remove = []
        
        for key, requests in self.requests.items():
            while requests and requests[0] <= cutoff:
                requests.popleft()
            
            if not requests:
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del self.requests[key]

# Global rate limiter instance
rate_limiter = RateLimiter()

# Rate limiting configurations
RATE_LIMITS = {
    "auth": {"limit": 10, "window": 60},  # 10 requests per minute
    "api": {"limit": 100, "window": 60},  # 100 requests per minute
    "websocket": {"limit": 30, "window": 60},  # 30 connections per minute
    "feedback": {"limit": 5, "window": 60},  # 5 feedback submissions per minute
}

def get_client_ip(request: Request) -> str:
    """Get client IP address"""
    # Check for forwarded headers first
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fallback to direct connection
    return request.client.host if request.client else "unknown"

def get_rate_limit_key(request: Request, limit_type: str = "api") -> str:
    """Generate rate limit key for client"""
    client_ip = get_client_ip(request)
    return f"{limit_type}:{client_ip}"

async def check_rate_limit(request: Request, limit_type: str = "api") -> bool:
    """Check if request is within rate limits"""
    if not settings.DEBUG:  # Skip rate limiting in debug mode
        return True
    
    key = get_rate_limit_key(request, limit_type)
    limit_config = RATE_LIMITS.get(limit_type, RATE_LIMITS["api"])
    
    is_allowed, remaining = rate_limiter.is_allowed(
        key, 
        limit_config["limit"], 
        limit_config["window"]
    )
    
    if not is_allowed:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "limit": limit_config["limit"],
                "window": limit_config["window"],
                "retry_after": limit_config["window"]
            }
        )
    
    return True

def rate_limit_middleware(limit_type: str = "api"):
    """Middleware factory for rate limiting"""
    async def middleware(request: Request, call_next):
        try:
            await check_rate_limit(request, limit_type)
        except HTTPException as e:
            return JSONResponse(
                status_code=e.status_code,
                content=e.detail
            )
        
        response = await call_next(request)
        
        # Add rate limit headers
        client_ip = get_client_ip(request)
        key = get_rate_limit_key(request, limit_type)
        limit_config = RATE_LIMITS.get(limit_type, RATE_LIMITS["api"])
        
        # Get current count
        requests = rate_limiter.requests[key]
        remaining = max(0, limit_config["limit"] - len(requests))
        
        response.headers["X-RateLimit-Limit"] = str(limit_config["limit"])
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(time.time() + limit_config["window"]))
        
        return response
    
    return middleware
