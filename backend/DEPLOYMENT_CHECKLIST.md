# Saarthi Railway Deployment Checklist

## ✅ Pre-Deployment (Completed)

- [x] Created `railway.py` startup script with auto-migrations
- [x] Created `Procfile` for Railway
- [x] Updated `requirements.txt` with production dependencies
- [x] Updated CORS settings to allow Railway domains
- [x] Updated trusted hosts for Railway
- [x] Created environment variables template
- [x] Updated mobile app configuration for production
- [x] Created deployment documentation

## 🚀 Railway Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Add Railway deployment configuration"
git push origin main
```

### 2. Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `saarthi` repository
6. Set root directory to `backend`

### 3. Add PostgreSQL Database
1. In Railway dashboard, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway automatically provides DATABASE_URL

### 4. Set Environment Variables
In Railway project settings → Variables tab, add these variables:
```
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

**📝 Copy from file:** See `backend/RAILWAY_ENV_SIMPLE.txt` for easy copy-paste

### 5. Deploy and Test
1. Railway auto-deploys from GitHub
2. Get your Railway URL (e.g., `https://saarthi-backend-production.up.railway.app`)
3. Test endpoints:
   - Health: `https://your-url/health`
   - API Docs: `https://your-url/docs`
   - Routes: `https://your-url/api/routes`

### 6. Update Mobile App
1. Replace `your-app-name.railway.app` in `mobile/config/api.ts` with your actual Railway URL
2. Test mobile app with production backend

### 7. Verify Deployment
- [ ] Backend responds at `/health`
- [ ] API documentation loads at `/docs`
- [ ] Database migrations ran successfully
- [ ] Default authority user created
- [ ] Mobile app connects to production backend
- [ ] Authentication works
- [ ] Real-time features work (WebSocket)

## 🔧 Troubleshooting

### Common Issues:
1. **Build fails**: Check Railway build logs for Python/dependency errors
2. **Database connection**: Verify DATABASE_URL is set to `${{Postgres.DATABASE_URL}}`
3. **CORS errors**: Check Railway URL is added to CORS_ORIGINS
4. **Migration errors**: Check database permissions and connection

### Useful Railway CLI Commands:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Run commands on Railway
railway run python manage.py shell
```

## 📱 Post-Deployment Tasks

### Update Mobile App for Production:
1. Update `PRODUCTION_BASE_URL` in `mobile/config/api.ts`
2. Test with authority@example.com / admin123456
3. Build production APK with updated backend URL

### Admin Panel Setup:
1. Update admin panel API endpoints to point to Railway URL
2. Test admin functionality with production backend

### Optional Enhancements:
- [ ] Set up custom domain
- [ ] Configure Neo4j AuraDB for graph features
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

## 🎉 Success!
Your Saarthi backend should now be live on Railway! 🚀