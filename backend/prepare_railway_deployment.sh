#!/bin/bash
# Railway Deployment Preparation Script

echo "🚀 Preparing Saarthi for Railway Deployment..."

# Check if we're in the backend directory
if [ ! -f "railway.py" ] || [ ! -f "Procfile" ] || [ ! -d "app" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    echo "💡 Run: cd backend && bash prepare_railway_deployment.sh"
    exit 1
fi

echo "✅ All required files have been created for Railway deployment!"
echo ""
echo "📁 Files created/updated:"
echo "  - backend/railway.py (Railway startup script)"
echo "  - backend/Procfile (Railway process file)"
echo "  - backend/railway.json (Railway configuration)"
echo "  - backend/requirements.txt (Updated with production deps)"
echo "  - backend/.env.railway (Environment variables template)"
echo "  - RAILWAY_DEPLOY.md (Deployment guide)"
echo "  - COMPLETE_RAILWAY_GUIDE.md (Complete setup guide)"
echo "  - DEPLOYMENT_CHECKLIST.md (Deployment checklist)"
echo "  - NEO4J_SETUP_GUIDE.md (Neo4j configuration guide)"
echo "  - RAILWAY_VARS_COPY_PASTE.txt (Environment variables)"
echo "  - app/core/config.py (Updated CORS settings)"
echo "  - ../mobile/config/api.ts (Updated for production)"
echo "  - ../admin/src/api/config.ts (Updated for production)"
echo ""
echo "🎯 Next Steps:"
echo "1. Commit and push these changes to GitHub:"
echo "   git add ."
echo "   git commit -m 'Add Railway deployment configuration'"
echo "   git push origin main"
echo ""
echo "2. Go to railway.app and create a new project"
echo "3. Deploy from GitHub repo (select 'backend' as root directory)"
echo "4. Add PostgreSQL database service"
echo "5. Set environment variables (see .env.railway template)"
echo "6. Update mobile and admin URLs with your Railway URL"
echo ""
echo ""
echo "📖 Read these guides for detailed instructions:"
echo "   - DEPLOYMENT_CHECKLIST.md (Step-by-step deployment)"
echo "   - COMPLETE_RAILWAY_GUIDE.md (Complete setup guide)"
echo "   - NEO4J_SETUP_GUIDE.md (Neo4j configuration)"
echo "   - RAILWAY_VARS_COPY_PASTE.txt (Environment variables)"
echo ""
echo "🎉 Your backend is ready for Railway deployment!"