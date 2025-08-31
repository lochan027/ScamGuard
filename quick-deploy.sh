#!/bin/bash

echo "🚀 Quick Netlify Deployment for ScamGuard"
echo "=========================================="

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📥 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Build the frontend
echo "📦 Building frontend..."
cd frontend
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Netlify
    echo "🌐 Deploying to Netlify..."
    echo "📝 Note: You'll need to login to Netlify if this is your first time"
    
    netlify deploy --prod --dir=build
    
    echo ""
    echo "🎉 Deployment complete!"
    echo "🔗 Your app is now live on Netlify!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set environment variables in Netlify dashboard"
    echo "2. Deploy your backend to Railway/Heroku/Vercel"
    echo "3. Update REACT_APP_API_URL to point to your backend"
    echo "4. Test your deployed app!"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
