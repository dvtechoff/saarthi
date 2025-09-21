# Saarthi — Backend + Mobile Monorepo

End-to-end project for a real-time bus tracking system:
- Backend: FastAPI + PostgreSQL + Neo4j + Socket.IO
- Mobile: React Native (Expo Router)

This README walks you through a complete setup on Windows PowerShell, local development with Docker for databases, running the API, and launching the mobile app.

## Repository layout

```
backend/          # FastAPI app, DB models, migrations, seeds
infra/            # Local infra with docker-compose (Postgres, Neo4j)
mobile/           # Expo (React Native) app for commuter/driver/authority
```

## Prerequisites

- Git
- Python 3.11+
- Node.js 18+ (LTS recommended) and npm or yarn
- Docker Desktop (for local Postgres and Neo4j via Compose)
- Android Studio (for Android emulator) or a physical device with Expo Go

Optional but handy:
- Neo4j Desktop (if you prefer running Neo4j locally without Docker)

## Quick start (local development)

The easiest path is: run Postgres and Neo4j with Docker, run FastAPI locally in a virtualenv, then run the mobile app with Expo.

### 1) Start infrastructure (Postgres + Neo4j)

From the repo root:

```powershell
cd infra
docker compose up -d
```

This launches:
- Postgres 15 at localhost:5432 (db bustrackr, user: postgres, pass: postgres)
- Neo4j 5 at http://localhost:7474 and bolt at neo4j://localhost:7687 (user: neo4j, pass: neo4jpassword)

### 2) Configure backend environment

Create `backend/.env` by copying the example and adjusting as needed:

```powershell
Copy-Item backend/.env.example backend/.env
```

Key variables (defaults align with the infra compose):

```
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/bustrackr
NEO4J_URL=neo4j://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=neo4jpassword
JWT_SECRET=change-me-in-prod
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
CORS_ORIGINS=http://localhost:8081,http://localhost:19006,http://10.0.2.2:8000
API_V1_STR=/api/v1
PROJECT_NAME=Saarthi Bus Tracker API
DEBUG=True
```

### 3) Create Python virtual environment and install deps

```powershell
cd ..\backend
python -m venv .venv
./.venv/Scripts/Activate.ps1
pip install -r requirements.txt
```

If script execution is blocked, run PowerShell as Administrator once:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 4) Initialize database and seed data

With the virtualenv active and inside `backend/`:

```powershell
alembic upgrade head
python seed_data.py        # base users/fixtures
# Optional specialized seeds
python seed_routes.py
python seed_buses.py
python seed_neo4j.py
```

### 5) Run the API

From `backend/`:

```powershell
uvicorn app.main:asgi --host 0.0.0.0 --port 8000 --reload
```

Open:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health check: http://localhost:8000/health

## Mobile app (Expo)

### Configure API base URL

The app reads URLs from `mobile/config/api.ts` (code-level), and `mobile/app.json` has `extra` defaults for convenience. Typical values:

- Windows + Android emulator: use 10.0.2.2 instead of localhost
- Physical device on same Wi-Fi: use your PC’s LAN IP (e.g., 192.168.1.50)

Adjust if needed in `mobile/config/api.ts`:
- `BASE_URL`/`WS_URL` for desktop web/iOS simulator
- `ANDROID_BASE_URL`/`ANDROID_WS_URL` for Android emulator

### Install and run

From the repo root:

```powershell
cd mobile
npm install
npx expo start
```

Then:
- Press `a` for Android emulator
- Press `w` for web
- Scan the QR in Expo Go on your device (same network)

Test accounts after seeding (`seed_data.py`):
- commuter@test.com / password123
- driver@test.com / password123
- authority@test.com / password123

## Running everything with Docker (production-ish)

There is a production-oriented compose file at `backend/docker-compose.prod.yml` that builds and runs the API behind Nginx and adds Redis. It expects production-ready secrets via environment variables. For local dev, prefer `infra/docker-compose.yml` + local uvicorn as shown above.

## Common issues on Windows

- Virtualenv activation blocked: run `Set-ExecutionPolicy RemoteSigned` once (CurrentUser scope).
- Port already in use: stop prior services or change ports (8000 for API, 5432 Postgres, 7474/7687 Neo4j).
- Android cannot reach `localhost`: use `10.0.2.2` from the Android emulator.
- Neo4j auth errors: confirm `NEO4J_USER/NEO4J_PASSWORD` match your running instance.

## Development

Create a migration:

```powershell
cd backend
./.venv/Scripts/Activate.ps1
alembic revision --autogenerate -m "describe changes"
alembic upgrade head
```

Run tests (when available):

```powershell
pytest
```

## GitHub: initialize and push

We’ve added a robust `.gitignore` to keep secrets and build artifacts out of git. To create your repo and push:

1) Initialize and commit locally (from repo root):

```powershell
git init
git add .
git commit -m "chore: initial commit (docs + setup)"
```

2) Create a GitHub repository in your account (via the website) and copy its HTTPS or SSH URL.

3) Add the remote and push the `main` branch:

```powershell
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

If you use GitHub CLI and have it installed, you can also run:

```powershell
gh repo create --source . --private --push
```

## Security note

Do not commit real secrets. Keep `.env` files local (they’re ignored by git). The backend reads configuration from `backend/.env` via Pydantic Settings.

