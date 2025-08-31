# 🚀 Netlify Deployment Guide for ScamGuard

## 📋 **Prerequisites**

- ✅ Node.js 18+ installed
- ✅ Git repository set up
- ✅ Netlify account (free at [netlify.com](https://netlify.com))

## 🎯 **Deployment Options**

### **Option 1: Automatic Deployment (Recommended)**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your repository
   - Set build settings:
     - Build command: `cd frontend && npm run build`
     - Publish directory: `frontend/build`
   - Click "Deploy site"

### **Option 2: Manual Deployment with Netlify CLI**

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Deploy manually**
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod --dir=build
   ```

### **Option 3: Drag & Drop (Quick Test)**

1. **Build the app**
   ```bash
   cd frontend
   npm run build
   ```

2. **Drag the `build` folder** to [netlify.com](https://netlify.com)

## ⚙️ **Environment Variables**

Set these in Netlify dashboard → Site settings → Environment variables:

```bash
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_FIREBASE_API_KEY=AIzaSyDoTztz2TVK_s1Jm1m4x8U6GtLqWnce2kE
REACT_APP_FIREBASE_AUTH_DOMAIN=scammerdetection.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=scammerdetection
REACT_APP_FIREBASE_STORAGE_BUCKET=scammerdetection.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=747621991332
REACT_APP_FIREBASE_APP_ID=1:747621991332:web:9d0dc613f839503c447731
REACT_APP_FIREBASE_MEASUREMENT_ID=G-Z5GKXFDL78
```

## 🔧 **Backend Deployment**

Your backend needs to be deployed separately. Options:

### **Option A: Railway (Recommended)**
- Free tier available
- Easy deployment
- Automatic HTTPS

### **Option B: Heroku**
- Free tier available
- Good for Node.js apps

### **Option C: Vercel**
- Free tier available
- Great for Node.js APIs

## 📱 **Custom Domain (Optional)**

1. **In Netlify dashboard:**
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Enter your domain
   - Follow DNS setup instructions

## 🚨 **Important Notes**

- **Backend URL**: Update `REACT_APP_API_URL` to point to your deployed backend
- **CORS**: Ensure your backend allows requests from your Netlify domain
- **Firebase**: Your Firebase config is already set up and will work from any domain

## 🎉 **After Deployment**

1. **Test the app** at your Netlify URL
2. **Submit test content** to verify ML analysis works
3. **Check the network graph** and history
4. **Share your app** with others!

## 🔗 **Useful Links**

- [Netlify Documentation](https://docs.netlify.com/)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

**Need help?** Check the Netlify deployment logs in your dashboard!
