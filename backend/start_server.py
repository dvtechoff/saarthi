#!/usr/bin/env python3
"""
Simple script to start the backend server
"""
import uvicorn
from app.main import app

if __name__ == "__main__":
    print("Starting Saarthi Backend Server...")
    print("Server will be available at:")
    print("  - http://localhost:8000")
    print("  - http://127.0.0.1:8000")
    print("\nPress Ctrl+C to stop the server")
    print("-" * 50)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        access_log=True
    )
