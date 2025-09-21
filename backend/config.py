# Database Configuration
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/bustrackr
NEO4J_URL=neo4j://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=s5WnHaukXbh96cppv_-ABqQ7FOQolyrm8A5sAUDLLg4

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080

# CORS Configuration
CORS_ORIGINS=http://localhost:8081,http://localhost:19006,http://10.0.2.2:8000,exp://192.168.0.0/16

# API Configuration
API_V1_STR=/api/v1
PROJECT_NAME=Saarthi Bus Tracker API

# Development
DEBUG=True
