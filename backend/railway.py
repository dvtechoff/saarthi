#!/usr/bin/env python3
"""
Railway deployment configuration
"""
import os
import sys
import uvicorn
from alembic.config import Config
from alembic import command

def check_environment():
    """Check required environment variables"""
    required_vars = [
        "DATABASE_URL",
        "JWT_SECRET",
        "JWT_ALGORITHM",
        "PROJECT_NAME"
    ]
    
    missing_vars = []
    for var in required_vars:
        value = os.environ.get(var)
        if not value or value.strip() == "":
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\n🔧 Railway Setup Required:")
        print("1. Add PostgreSQL service in Railway Dashboard")
        print("2. Copy environment variables from RAILWAY_VARS_COPY_PASTE.txt")
        print("3. Set variables in Railway Dashboard → Variables Tab")
        print("\n📋 Check these specific variables:")
        print("   DATABASE_URL=${{Postgres.DATABASE_URL}}")
        print("   JWT_SECRET=your-production-secret")
        sys.exit(1)
    
    print("✅ Environment variables validated")
    print(f"🔗 Database: {os.environ.get('DATABASE_URL', '').split('@')[0] if '@' in os.environ.get('DATABASE_URL', '') else 'Not set'}@***")

def run_migrations():
    """Run database migrations on startup"""
    try:
        print("🔄 Running database migrations...")
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        print("✅ Database migrations completed")
    except Exception as e:
        print(f"❌ Migration error: {e}")
        print("💡 This might be because:")
        print("   - Database connection failed")
        print("   - DATABASE_URL is incorrect")
        print("   - PostgreSQL service not ready")
        
        # Try to apply schema fixes directly
        try:
            print("🔧 Attempting to fix bus_number field length...")
            from sqlalchemy import create_engine, text
            engine = create_engine(os.environ.get("DATABASE_URL"))
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE buses ALTER COLUMN bus_number TYPE VARCHAR(50)"))
                conn.commit()
            print("✅ Schema fix applied successfully")
        except Exception as schema_error:
            print(f"⚠️ Schema fix failed: {schema_error}")
        
        raise

if __name__ == "__main__":
    print("🚀 Starting Saarthi Backend on Railway...")
    
    # Check environment first
    check_environment()
    
    # Import app after environment check
    try:
        from app.main import asgi
        print("✅ Application imported successfully")
    except Exception as e:
        print(f"❌ Failed to import application: {e}")
        print("💡 This is likely due to DATABASE_URL issues")
        sys.exit(1)
    
    # Run migrations
    run_migrations()
    
    # Run data seeding (if enabled)
    if os.environ.get("AUTO_SEED_DATA", "True").lower() in ["true", "1", "yes"]:
        try:
            print("🌱 Seeding initial data...")
            from seed_data import create_initial_data
            create_initial_data()
            print("✅ Initial data seeded successfully")
        except Exception as e:
            print(f"⚠️ Data seeding failed (non-critical): {e}")
    
    # Start server
    port = int(os.environ.get("PORT", 8000))
    print(f"🌐 Starting server on 0.0.0.0:{port}")
    
    uvicorn.run(
        "app.main:asgi",
        host="0.0.0.0",
        port=port,
        log_level="info"
    )