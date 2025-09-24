# Saarthi Bus Tracker API

A FastAPI-based backend for real-time bus tracking system with PostgreSQL and Neo4j databases.

## 🚀 Railway Deployment Ready

This backend is **100% ready** for Railway deployment! All configuration files are included.

### 📋 Quick Deploy Steps:
1. **Environment Variables**: Copy from `RAILWAY_VARS_COPY_PASTE.txt` to Railway Dashboard
2. **Follow Guide**: Read `COMPLETE_RAILWAY_GUIDE.md` for complete instructions
3. **Deploy**: Push to Railway with PostgreSQL service

### 📁 Railway Files:
- `railway.py` - Railway startup script with auto-migrations
- `Procfile` - Railway process configuration  
- `railway.json` - Railway deployment settings
- `RAILWAY_VARS_COPY_PASTE.txt` - Ready-to-use environment variables
- `COMPLETE_RAILWAY_GUIDE.md` - Complete deployment guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `NEO4J_SETUP_GUIDE.md` - Neo4j setup instructions

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **Real-time Updates**: WebSocket support for live bus tracking
- **Multi-role Support**: Commuter, Driver, and Authority dashboards
- **Database**: PostgreSQL for relational data, Neo4j for graph-based route optimization
- **API Documentation**: Auto-generated OpenAPI/Swagger documentation

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **PostgreSQL**: Primary database for user data, trips, and feedback
- **Neo4j**: Graph database for route optimization and ETA calculations
- **SQLAlchemy**: ORM for database operations
- **Alembic**: Database migrations
- **Socket.IO**: Real-time WebSocket communication
- **JWT**: Authentication and authorization

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── driver.py        # Driver-specific endpoints
│   │   │   ├── commuter.py      # Commuter endpoints
│   │   │   └── authority.py     # Authority monitoring endpoints
│   │   └── deps.py              # Dependencies and auth helpers
│   ├── core/
│   │   ├── config.py            # Configuration settings
│   │   └── security.py          # JWT and password utilities
│   ├── db/
│   │   ├── base.py              # Database base class
│   │   └── session.py           # Database session management
│   ├── models/
│   │   ├── user.py              # User model
│   │   └── trip.py              # Trip, Bus, Route, Stop models
│   ├── schemas/
│   │   ├── auth.py              # Authentication schemas
│   │   └── common.py            # Common schemas
│   ├── realtime/
│   │   └── socket.py            # WebSocket handlers
│   └── main.py                  # FastAPI application
├── alembic/                     # Database migrations
├── requirements.txt             # Python dependencies
├── Dockerfile                   # Container configuration
└── seed_data.py                 # Initial data seeding
```

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Neo4j 5+
- Docker & Docker Compose (optional)

### Using Docker Compose (Recommended)

1. **Start the infrastructure:**
   ```bash
   cd infra
   docker-compose up -d
   ```

2. **Install dependencies and run migrations:**
   ```bash
   cd backend
   pip install -r requirements.txt
   alembic upgrade head
   python seed_data.py
   ```

3. **Start the API server:**
   ```bash
   uvicorn app.main:asgi --host 0.0.0.0 --port 8000 --reload
   ```

### Manual Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up databases:**
   - PostgreSQL: Create database `bustrackr`
   - Neo4j: Start Neo4j server

3. **Run migrations:**
   ```bash
   alembic upgrade head
   ```

4. **Seed initial data:**
   ```bash
   python seed_data.py
   ```

5. **Start the server:**
   ```bash
   uvicorn app.main:asgi --host 0.0.0.0 --port 8000 --reload
   ```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Driver Endpoints
- `GET /api/v1/driver/routes` - Get assigned routes
- `POST /api/v1/driver/trip/start` - Start new trip
- `POST /api/v1/driver/trip/stop` - Stop active trip
- `POST /api/v1/driver/location` - Update driver location

### Commuter Endpoints
- `GET /api/v1/commuter/buses/nearby` - Get nearby buses
- `GET /api/v1/commuter/bus/{bus_id}/eta/{stop_id}` - Get bus ETA
- `POST /api/v1/commuter/feedback` - Submit feedback

### Authority Endpoints
- `GET /api/v1/authority/buses` - Get all active buses
- `GET /api/v1/authority/analytics` - Get system analytics
- `GET /api/v1/authority/trips` - Get trip history

## WebSocket Events

### Client to Server
- `join_room` - Join user-specific room
- `driver_location_update` - Driver location update
- `bus_status_update` - Bus status change
- `ping` - Connection test

### Server to Client
- `bus:location` - Real-time bus location
- `bus:status` - Bus status updates
- `eta:update` - ETA updates
- `feedback:new` - New feedback notifications

## Configuration

Environment variables (create `.env` file):

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/bustrackr
NEO4J_URL=neo4j://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=neo4jpassword
JWT_SECRET=your-super-secret-jwt-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
CORS_ORIGINS=http://localhost:8081,http://localhost:19006
```

## Development

### Database Migrations

Create new migration:
```bash
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:
```bash
alembic upgrade head
```

### Testing

Run tests (when implemented):
```bash
pytest
```

## Production Deployment

1. **Environment Setup:**
   - Set production environment variables
   - Use production database credentials
   - Configure proper CORS origins

2. **Security:**
   - Use strong JWT secrets
   - Enable HTTPS
   - Configure rate limiting
   - Set up monitoring and logging

3. **Scaling:**
   - Use connection pooling
   - Implement Redis for session management
   - Set up load balancing for WebSocket connections

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Test Users

After running `seed_data.py`:

- **Commuter**: `commuter@test.com` / `password123`
- **Driver**: `driver@test.com` / `password123`
- **Authority**: `authority@test.com` / `password123`

## Next Steps

1. **Neo4j Integration**: Implement route optimization and ETA calculations
2. **Real-time Features**: Add live bus tracking and notifications
3. **Analytics**: Enhanced reporting and insights
4. **Mobile Integration**: Connect with React Native app
5. **Performance**: Add caching and optimization
6. **Monitoring**: Add logging, metrics, and health checks
