#!/bin/bash

echo "🔧 Fixing Netlify API URL Configuration"
echo "========================================"
echo ""

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
else
    echo "✅ Netlify CLI found"
fi

echo ""
echo "📋 Current Configuration:"
echo "   Frontend URL: https://scammerdetectionnetwork.netlify.app"
echo "   Backend API: https://scam-guard-production.up.railway.app"
echo ""

echo "🚀 Setting environment variable in Netlify..."
echo "   This will update REACT_APP_API_URL to point to your Railway backend"
echo ""

# Set the environment variable
netlify env:set REACT_APP_API_URL "https://scam-guard-production.up.railway.app"

echo ""
echo "✅ Environment variable set successfully!"
echo ""
echo "🔄 Triggering redeploy..."
netlify deploy --prod

echo ""
echo "🎉 Fix completed! Your frontend should now work correctly."
echo ""
echo "📱 Test your app at: https://scammerdetectionnetwork.netlify.app"
echo "🔗 Backend API: https://scam-guard-production.up.railway.app"
echo ""
echo "💡 If you still have issues, check the Netlify dashboard:"
echo "   https://app.netlify.com/sites/scammerdetectionnetwork/settings/environment"
