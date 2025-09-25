from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl
from typing import List, Union
import os

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/bustrackr"
    NEO4J_URL: str = "neo4j://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "neo4jpassword"
    JWT_SECRET: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 10080
    CORS_ORIGINS: List[Union[str, AnyHttpUrl]] = [
        "http://localhost:8081",
        "http://localhost:19006", 
        "http://localhost:5173",  # Admin panel development
        "http://10.0.2.2:8000",
        "http://10.0.2.2:8081",
        "http://10.0.2.2:19006",
        "exp://192.168.0.0/16",
        "exp://localhost:8081",
        "https://*.railway.app",
        "https://*.up.railway.app",
        "https://*.vercel.app",
        "*"
    ]
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Saarthi Bus Tracker API"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
