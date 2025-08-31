# 🚀 Deployment Guide

This guide covers deploying ScamGuard to various hosting platforms.

## 📋 Pre-deployment Checklist

- [ ] Firebase project configured with Firestore
- [ ] Environment variables set up
- [ ] Firebase service account key obtained
- [ ] Frontend built and tested locally
- [ ] Backend tested locally

## 🔥 Firebase Deployment (Recommended)

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase Project
```bash
firebase init
```

Select:
- **Hosting**: Configure files for Firebase Hosting
- **Functions**: Configure files for Firebase Functions
- **Firestore**: Configure security rules

### 4. Configure Hosting
```bash
# public directory: frontend/build
# single-page app: Yes
# GitHub Actions: No (for now)
```

### 5. Configure Functions
```bash
# Language: JavaScript
# ESLint: Yes
# Install dependencies: Yes
```

### 6. Deploy Backend (Functions)
```bash
firebase deploy --only functions
```

### 7. Build and Deploy Frontend
```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

## 🌐 Netlify Deployment

### 1. Build the Frontend
```bash
cd frontend
npm run build
```

### 2. Deploy Options

#### Option A: Drag & Drop
1. Go to [Netlify](https://netlify.com)
2. Drag the `frontend/build` folder to the deploy area
3. Wait for deployment to complete

#### Option B: Git Integration
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Deploy automatically on push

### 3. Environment Variables
Set in Netlify dashboard:
- `REACT_APP_API_URL`: Your backend API URL
- `REACT_APP_FIREBASE_CONFIG`: Firebase config

## 🚂 Railway Deployment

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login and Initialize
```bash
railway login
railway init
```

### 3. Set Environment Variables
```bash
railway variables set FIREBASE_DATABASE_URL=your-firebase-url
railway variables set PORT=5000
```

### 4. Deploy
```bash
railway up
```

## 🐳 Docker Deployment

### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### 2. Build and Run
```bash
docker build -t scamguard-backend .
docker run -p 5000:5000 scamguard-backend
```

### 3. Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FIREBASE_DATABASE_URL=${FIREBASE_DATABASE_URL}
    restart: unless-stopped
```

## ☁️ AWS Deployment

### 1. EC2 Instance
```bash
# Launch EC2 instance
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and deploy
git clone <your-repo>
cd SDA
npm install
npm start
```

### 2. AWS Lambda + API Gateway
```bash
# Install serverless framework
npm install -g serverless

# Deploy
serverless deploy
```

### 3. S3 + CloudFront (Frontend)
```bash
# Build frontend
cd frontend && npm run build

# Sync to S3
aws s3 sync build/ s3://your-bucket-name

# Configure CloudFront distribution
```

## 🐙 GitHub Actions (CI/CD)

### 1. Create Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install Dependencies
        run: |
          npm install
          cd frontend && npm install
          
      - name: Build Frontend
        run: cd frontend && npm run build
        
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
          channelId: live
```

### 2. Set Secrets
- `FIREBASE_SERVICE_ACCOUNT`: Base64 encoded service account JSON

## 🔒 Production Security

### 1. Environment Variables
```bash
# Never commit these files
.env
firebase-service-account.json
```

### 2. Firebase Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Restrict access based on user authentication
    match /submissions/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /nodes/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /edges/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. API Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. CORS Configuration
```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
};

app.use(cors(corsOptions));
```

## 📊 Monitoring & Analytics

### 1. Firebase Analytics
```bash
# Enable in Firebase Console
# Add tracking code to frontend
```

### 2. Error Tracking
```bash
# Install Sentry
npm install @sentry/node @sentry/react

# Configure in your app
```

### 3. Performance Monitoring
```bash
# Firebase Performance Monitoring
# Web Vitals tracking
```

## 🔄 Updating Deployments

### 1. Backend Updates
```bash
# For Firebase Functions
firebase deploy --only functions

# For other platforms
git push origin main
# (Auto-deploy if configured)
```

### 2. Frontend Updates
```bash
# Build and deploy
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

## 🐛 Troubleshooting Deployment

### Common Issues

#### Build Failures
```bash
# Check Node.js version
node --version

# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Environment Variables
```bash
# Verify all required variables are set
echo $FIREBASE_DATABASE_URL
echo $PORT

# Check .env file exists and is properly formatted
cat .env
```

#### Firebase Issues
```bash
# Check Firebase project
firebase projects:list

# Verify service account
firebase login --reauth

# Check Firestore rules
firebase firestore:rules
```

#### CORS Errors
```bash
# Verify CORS configuration
# Check allowed origins
# Ensure backend URL is correct
```

## 📱 Mobile Deployment

### 1. React Native
```bash
# Convert to React Native
npx react-native init ScamGuardMobile

# Adapt components for mobile
# Use React Native D3.js alternatives
```

### 2. Progressive Web App
```bash
# Add PWA manifest
# Service worker for offline functionality
# Install prompts
```

## 🌍 Multi-Region Deployment

### 1. Firebase Multi-Region
```bash
# Set Firestore location
firebase firestore:indexes

# Configure regions in firebase.json
```

### 2. CDN Configuration
```bash
# CloudFront distribution
# Multiple edge locations
# Geographic routing
```

---

**Need help?** Check the main README.md or create an issue in the repository.
