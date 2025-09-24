# 🚀 COMPLETE RAILWAY DEPLOYMENT GUIDE FOR SAARTHI

## 📋 STEP-BY-STEP DEPLOYMENT PROCESS

### 1️⃣ **Push Your Code to GitHub**
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### 2️⃣ **Create Railway Project**
1. Go to [railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your **`saarthi`** repository
6. ⚠️ **IMPORTANT**: Set root directory to **`backend`**

### 3️⃣ **Add PostgreSQL Database**
1. In Railway dashboard, click **"New Service"**
2. Select **"Database"** → **"PostgreSQL"**
3. ✅ Railway automatically provides `DATABASE_URL`

### 4️⃣ **Set Environment Variables**

**In Railway Dashboard → Your Project → Variables Tab, add these:**

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=saarthi-super-secret-production-jwt-key-change-this-immediately-2024
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
API_V1_STR=/api/v1
PROJECT_NAME=Saarthi Bus Tracker API
DEBUG=False
ADMIN_EMAIL=authority@saarthi.com
ADMIN_PASSWORD=Admin@Saarthi2024
PORT=8000
```

**📂 Copy from:** `backend/RAILWAY_ENV_SIMPLE.txt`

### 5️⃣ **Deploy & Test**
1. Railway auto-deploys from GitHub
2. Wait for build to complete (5-10 minutes)
3. Get your Railway URL (e.g., `https://saarthi-backend-production.up.railway.app`)

**Test these endpoints:**
- ✅ Health: `https://your-url/health`
- ✅ API Docs: `https://your-url/docs`
- ✅ Routes: `https://your-url/api/routes`

### 6️⃣ **Update Mobile & Admin Apps**

**Mobile App** (`mobile/config/api.ts`):
```typescript
PRODUCTION_BASE_URL: 'https://YOUR-ACTUAL-RAILWAY-URL',
PRODUCTION_WS_URL: 'wss://YOUR-ACTUAL-RAILWAY-URL',
```

**Admin Panel** (`admin/src/api/config.ts`):
```typescript
const PRODUCTION_API_URL = 'https://YOUR-ACTUAL-RAILWAY-URL';
```

## 🎯 **WHAT GETS DEPLOYED**

### ✅ **Working Features:**
- 🔐 Authentication (Login/Register)
- 🚌 Bus tracking and real-time location
- 🗺️ Route management
- 👥 User management (Authority, Driver, Commuter)
- 📱 Real-time WebSocket updates
- 🛠️ Admin panel connectivity
- 📊 Trip and occupancy tracking

### ⚠️ **Optional Features (Need Neo4j):**
- 🔗 Graph-based route optimization
- 📍 Advanced stop connections
- 🧭 Shortest path calculations

## 👤 **DEFAULT LOGIN CREDENTIALS**

After deployment, use these to login:

**Authority/Admin:**
- Email: `authority@saarthi.com`
- Password: `Admin@Saarthi2024`

**Test Users (Auto-created):**
- Driver: `driver@test.com` / `password123`
- Commuter: `commuter@test.com` / `password123`

## 🔧 **DATABASE SETUP**

**✅ Automatic on Railway:**
- PostgreSQL database created
- Migrations run automatically on startup
- Test data seeded automatically
- Default users created

## 📊 **Neo4j Setup (Optional)**

### Option 1: Skip Neo4j (Recommended for quick start)
- Leave Neo4j variables blank
- Graph endpoints return "Service unavailable"
- All core features work perfectly

### Option 2: Add Neo4j AuraDB Later
1. Go to [neo4j.com/cloud/aura](https://neo4j.com/cloud/aura)
2. Create free AuraDB instance
3. Add to Railway variables:
   ```
   NEO4J_URL=neo4j+s://your-instance.databases.neo4j.io
   NEO4J_USER=neo4j
   NEO4J_PASSWORD=your-password
   ```
4. Restart Railway deployment

## 🌐 **API ENDPOINTS**

Your deployed API will have:

```
Base URL: https://your-app.railway.app

🔐 Authentication:
POST /api/v1/auth/login
POST /api/v1/auth/register

🚌 Bus Tracking:
GET  /api/v1/commuter/buses
GET  /api/v1/commuter/routes
POST /api/v1/driver/location

👥 Management:
GET  /api/v1/authority/users
POST /api/v1/authority/buses
GET  /api/v1/driver/trips

📡 Real-time:
WebSocket: wss://your-app.railway.app/socket.io/

📚 Documentation:
GET  /docs (Swagger UI)
GET  /redoc (ReDoc)
```

## 🐛 **Troubleshooting**

### **Build Fails:**
- Check Railway build logs
- Verify `requirements.txt` has all dependencies
- Ensure `railway.py` and `Procfile` exist

### **Database Connection Error:**
- Verify `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- Check PostgreSQL service is running
- Look for migration errors in logs

### **App Won't Start:**
- Check `PORT` environment variable
- Verify `railway.py` startup script
- Look for import errors in logs

### **CORS Errors:**
- Your Railway URL is pre-configured in CORS
- Check `app/core/config.py` CORS_ORIGINS

### **Authentication Issues:**
- Verify `JWT_SECRET` is set
- Check admin user was created
- Look for password hashing errors

## 📱 **Mobile App Integration**

After Railway deployment:

1. **Update API URLs** in mobile config
2. **Test login** with default credentials
3. **Verify real-time** WebSocket connection
4. **Test core features**: bus tracking, route viewing
5. **Build production APK** with Railway backend

## 🎉 **SUCCESS INDICATORS**

✅ Railway build completes without errors
✅ `/health` endpoint returns `{"status": "healthy"}`
✅ `/docs` loads Swagger documentation
✅ Login works with `authority@saarthi.com`
✅ Mobile app connects to production backend
✅ WebSocket real-time updates work
✅ Bus tracking and routes display correctly

## 🔄 **Post-Deployment Updates**

To update your deployed app:
```bash
git add .
git commit -m "Update backend"
git push origin main
```
Railway automatically redeploys on GitHub push! 🚀

---

## 📞 **Need Help?**

1. **Railway Logs:** Railway Dashboard → Deployments → View Logs
2. **API Docs:** `https://your-url/docs`
3. **Health Check:** `https://your-url/health`
4. **Database:** Railway Dashboard → PostgreSQL service

Your Saarthi backend is now production-ready! 🎯