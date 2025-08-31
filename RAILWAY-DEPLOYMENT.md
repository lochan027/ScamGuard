# 🚂 Railway Backend Deployment Guide

## 📋 **Prerequisites**

- ✅ Railway account (free at [railway.app](https://railway.app))
- ✅ GitHub account with your code
- ✅ Firebase service account credentials

## 🎯 **Deployment Steps**

### **Step 1: Create Railway Account**

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### **Step 2: Connect Your Repository**

1. **Click "Deploy from GitHub repo"**
2. **Select your repository**: `SDA` (or whatever you named it)
3. **Choose the root directory** (where `server.js` is located)
4. **Railway will automatically detect** it's a Node.js app

### **Step 3: Configure Environment Variables**

In Railway dashboard → Variables tab, add:

```bash
# Firebase Configuration
FIREBASE_DATABASE_URL=https://scammerdetection.firebaseio.com

# Server Configuration
PORT=5000

# Firebase Service Account (copy the entire JSON content)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"scammerdetection",...}
```

### **Step 4: Deploy**

1. **Click "Deploy"**
2. **Wait for build to complete** (usually 2-3 minutes)
3. **Copy your Railway app URL** (e.g., `https://your-app.railway.app`)

### **Step 5: Update Frontend**

1. **Go to Netlify dashboard**
2. **Site settings → Environment variables**
3. **Add**: `REACT_APP_API_URL=https://your-railway-url.com`

## 🔧 **Alternative: Railway CLI Deployment**

### **Install Railway CLI**
```bash
npm install -g @railway/cli
```

### **Login and Deploy**
```bash
railway login
railway up
```

## 📁 **File Structure for Railway**

```
SDA/
├── server.js              # Main server file
├── package.json           # Dependencies
├── railway.json          # Railway config
├── .env                  # Environment variables
├── firebase-service-account.json  # Firebase credentials
└── frontend/             # Frontend (not deployed to Railway)
```

## 🚨 **Important Notes**

### **Firebase Service Account**
- Railway needs access to your Firebase credentials
- You can either:
  1. **Copy the JSON content** to Railway environment variables
  2. **Upload the file** and reference it in code

### **Port Configuration**
- Railway automatically sets `PORT` environment variable
- Your server.js already handles this: `process.env.PORT || 5000`

### **CORS Configuration**
- Your backend already allows all origins for development
- For production, you might want to restrict to your Netlify domain

## 🔍 **Troubleshooting**

### **Build Failures**
- Check Railway build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### **Runtime Errors**
- Check Railway function logs
- Verify environment variables are set correctly
- Ensure Firebase credentials are valid

### **CORS Issues**
- Check if your backend is accessible
- Verify the URL in Netlify environment variables

## 🎉 **After Successful Deployment**

1. **Test your backend API**:
   ```bash
   curl https://your-railway-url.com/api/health
   ```

2. **Test ML analysis**:
   ```bash
   curl -X POST https://your-railway-url.com/api/submit \
     -H "Content-Type: application/json" \
     -d '{"text": "Test message", "type": "text"}'
   ```

3. **Update Netlify** with your backend URL

4. **Test your live app** at your Netlify URL

## 🔗 **Useful Links**

- [Railway Documentation](https://docs.railway.app/)
- [Railway Dashboard](https://railway.app/dashboard)
- [Node.js on Railway](https://docs.railway.app/deploy/deployments/nodejs)

---

**Need help?** Check Railway build logs and function logs in your dashboard!
