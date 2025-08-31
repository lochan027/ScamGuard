#!/bin/bash

echo "🚀 Deploying ScamGuard Backend to Railway"
echo "=========================================="

echo "📋 Prerequisites:"
echo "1. Create Railway account at https://railway.app"
echo "2. Sign in with GitHub"
echo "3. Create new project"
echo "4. Connect your GitHub repository"
echo ""

echo "🔧 Setting up Railway CLI..."
if ! command -v railway &> /dev/null; then
    echo "📥 Installing Railway CLI..."
    npm install -g @railway/cli
else
    echo "✅ Railway CLI already installed"
fi

echo ""
echo "🔐 Login to Railway..."
railway login

echo ""
echo "📦 Deploying to Railway..."
railway up

echo ""
echo "🎉 Backend deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your Railway app URL from the dashboard"
echo "2. Go to Netlify dashboard → Site settings → Environment variables"
echo "3. Add: REACT_APP_API_URL=https://your-railway-url.com"
echo "4. Test your live app!"
echo ""
echo "🔗 Railway Dashboard: https://railway.app/dashboard"
