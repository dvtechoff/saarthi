from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import sys
import logging

logger = logging.getLogger(__name__)

# Validate DATABASE_URL
if not settings.DATABASE_URL or settings.DATABASE_URL.strip() == "":
    error_msg = (
        "❌ DATABASE_URL environment variable is empty or not set!\n"
        "🔧 Railway Setup Required:\n"
        "1. Add PostgreSQL service in Railway Dashboard\n"
        "2. Set environment variable: DATABASE_URL=${{Postgres.DATABASE_URL}}\n"
        "3. Ensure PostgreSQL service is named 'Postgres'\n"
        f"📋 Current DATABASE_URL: '{settings.DATABASE_URL}'"
    )
    logger.error(error_msg)
    print(error_msg)
    sys.exit(1)

logger.info(f"🔗 Connecting to database: {settings.DATABASE_URL.split('@')[0]}@***")

# Create database engine
try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        echo=settings.DEBUG
    )
    # Test connection
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    logger.info("✅ Database connection successful")
except Exception as e:
    logger.error(f"❌ Database connection failed: {e}")
    print(f"Database URL format: {settings.DATABASE_URL[:50]}...")
    raise

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
