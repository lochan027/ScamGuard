#!/bin/bash

echo "🚀 Deploying ScamGuard Backend to Railway"
echo "=========================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📥 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway first..."
    railway login
fi

echo "📦 Preparing backend for deployment..."

# Create .env file for Railway if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating one for Railway..."
    cat > .env << EOF
# Firebase Configuration
FIREBASE_DATABASE_URL=https://scammerdetection.firebaseio.com

# Server Configuration
PORT=5000

# Railway will automatically set PORT
EOF
fi

echo "🌐 Deploying to Railway..."
railway up

echo ""
echo "🎉 Backend deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Check Railway dashboard for deployment status"
echo "2. Copy your Railway app URL"
echo "3. Update Netlify environment variables:"
echo "   - Go to Netlify dashboard → Site settings → Environment variables"
echo "   - Add: REACT_APP_API_URL=https://your-railway-url.com"
echo "4. Test your live app!"
echo ""
echo "🔗 Railway Dashboard: https://railway.app/dashboard"
