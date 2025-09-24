#!/usr/bin/env python3
"""
Railway deployment configuration
"""
import os
import uvicorn
from alembic.config import Config
from alembic import command
from app.main import asgi

def run_migrations():
    """Run database migrations on startup"""
    try:
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        print("✅ Database migrations completed")
    except Exception as e:
        print(f"❌ Migration error: {e}")

if __name__ == "__main__":
    # Run migrations first
    run_migrations()
    
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "app.main:asgi",
        host="0.0.0.0",
        port=port,
        log_level="info"
    )