#!/bin/bash

echo "🚀 Deploying ScamGuard to Netlify..."

# Build the frontend
echo "📦 Building frontend..."
cd frontend
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Install Netlify CLI if not present
    if ! command -v netlify &> /dev/null; then
        echo "📥 Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    # Deploy to Netlify
    echo "🌐 Deploying to Netlify..."
    netlify deploy --prod --dir=build
    
    echo "🎉 Deployment complete!"
    echo "🔗 Your app should now be live on Netlify!"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
