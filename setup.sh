#!/bin/bash

echo "🚀 ScamGuard Setup Script"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) detected"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "✅ Backend dependencies installed"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    cd ..
    exit 1
fi

cd ..
echo "✅ Frontend dependencies installed"
echo ""

# Check for Firebase service account file
if [ ! -f "firebase-service-account.json" ]; then
    echo "⚠️  Firebase service account file not found!"
    echo ""
    echo "📋 To set up Firebase:"
    echo "   1. Go to Firebase Console: https://console.firebase.google.com/"
    echo "   2. Create a new project or select existing one"
    echo "   3. Go to Project Settings > Service Accounts"
    echo "   4. Click 'Generate New Private Key'"
    echo "   5. Save the file as 'firebase-service-account.json' in the root directory"
    echo ""
    echo "   Or copy the template and fill in your details:"
    echo "   cp firebase-service-account.json.example firebase-service-account.json"
    echo ""
else
    echo "✅ Firebase service account file found"
fi

# Check for environment file
if [ ! -f ".env" ]; then
    echo "📝 Creating environment file from template..."
    cp .env.example .env
    echo "✅ Environment file created"
    echo "⚠️  Please edit .env with your Firebase configuration"
    echo ""
else
    echo "✅ Environment file found"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Configure Firebase service account (if not done)"
echo "   2. Edit .env with your Firebase database URL"
echo "   3. Start the backend: npm run dev"
echo "   4. Start the frontend: cd frontend && npm start"
echo ""
echo "🌐 The app will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📚 For detailed instructions, see README.md"
echo ""
