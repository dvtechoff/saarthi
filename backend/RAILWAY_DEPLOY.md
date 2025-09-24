# Railway Deployment Guide

## Quick Deploy Steps

1. **Fork or Push to GitHub**: Make sure your code is on GitHub

2. **Create Railway Account**: Go to [railway.app](https://railway.app) and sign up

3. **Deploy Backend**:
   - Click "New Project" → "Deploy from GitHub repo"
   - Select this repository
   - Set root directory to `backend`
   - Railway will automatically detect it's a Python project

4. **Add PostgreSQL Database**:
   - In Railway dashboard, click "New Service" → "Database" → "PostgreSQL"
   - Railway will automatically set DATABASE_URL

5. **Set Environment Variables**:
   Copy these to Railway's environment variables:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-super-secret-production-jwt-key-change-this
   JWT_ALGORITHM=HS256
   JWT_EXPIRE_MINUTES=10080
   API_V1_STR=/api/v1
   PROJECT_NAME=Saarthi Bus Tracker API
   DEBUG=False
   ADMIN_EMAIL=authority@example.com
   ADMIN_PASSWORD=admin123456
   PORT=8000
   ```

6. **Deploy**: Railway will automatically build and deploy your app

7. **Test**: Visit your Railway URL (e.g., `https://your-app.railway.app/health`)

## Important Files Added for Railway:

- `railway.py` - Railway startup script with auto-migrations
- `Procfile` - Tells Railway how to start the app
- `.env.railway` - Template for environment variables
- Updated `requirements.txt` - Added production dependencies
- Updated CORS settings in `config.py` - Allow Railway domains

## After Deployment:

1. Update mobile app's API configuration with your Railway URL
2. Test all endpoints at `https://your-app.railway.app/docs`
3. Login with authority@example.com / admin123456

## Optional: Neo4j Setup

For graph features, you can:
1. Use Neo4j AuraDB (free tier available)
2. Or skip Neo4j features for now

## Monitoring:

- View logs in Railway dashboard → Deployments → Deploy Logs
- Monitor health at `/health` endpoint
- API docs available at `/docs`