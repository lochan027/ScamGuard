# 🛡️ ScamGuard - Real-Time Scammer Detection & Network Visualization

A full-stack web application that detects and analyzes suspicious URLs, messages, and emails in real-time using machine learning algorithms and visualizes scam networks through interactive D3.js graphs.

## ✨ Features

### 🔍 **Smart Detection Engine**
- **ML-Powered Analysis**: Uses feature extraction and risk scoring algorithms
- **Preloaded Datasets**: 100+ known phishing URLs and SMS spam patterns
- **Real-time Classification**: Instant risk assessment (Safe/Suspicious/Scam)
- **Feature Detection**: Identifies URLs, phone numbers, urgency indicators, threats, and more

### 🌐 **Interactive Network Visualization**
- **Dynamic Graph**: D3.js-powered network visualization
- **Real-time Updates**: New submissions appear instantly in the graph
- **Node Clustering**: Groups similar scams and suspicious content
- **Interactive Controls**: Zoom, pan, and explore the network

### 📊 **Comprehensive Analytics**
- **Risk Score Distribution**: Visual charts and statistics
- **Submission History**: Complete audit trail with filtering
- **Category Breakdown**: Safe, Suspicious, and Scam counts
- **Feature Analysis**: Detailed breakdown of detected indicators

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works on all devices
- **Glassmorphism**: Beautiful glass-like interface
- **Real-time Feedback**: Toast notifications and live updates
- **Intuitive Navigation**: Tab-based interface with clear sections

## 🚀 Tech Stack

### **Backend**
- **Node.js** + **Express.js** - RESTful API server
- **Firebase Firestore** - Real-time database
- **Natural Language Processing** - Text analysis and feature extraction
- **String Similarity** - Content similarity detection

### **Frontend**
- **React.js** - Modern UI framework
- **D3.js** - Interactive data visualization
- **Lucide React** - Beautiful icons
- **CSS3** - Modern styling with animations

### **Infrastructure**
- **Firebase** - Hosting, database, and real-time updates
- **Netlify** - Frontend deployment (optional)

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Firebase account** with Firestore enabled
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SDA
```

### 2. Backend Setup
```bash
# Install dependencies
npm install

# Create Firebase service account
# 1. Go to Firebase Console > Project Settings > Service Accounts
# 2. Generate new private key
# 3. Save as `firebase-service-account.json` in root directory

# Copy environment template
cp .env.example .env

# Edit .env with your Firebase configuration
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Firebase Configuration

#### Create Firestore Collections
The app will automatically create these collections:
- `submissions` - All analyzed content
- `nodes` - Graph visualization nodes
- `edges` - Connections between similar content

#### Security Rules
```javascript
// Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For demo - restrict in production
    }
  }
}
```

## 🚀 Running the Application

### Development Mode
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### Production Mode
```bash
# Backend
npm start

# Frontend
cd frontend
npm run build
```

## 📱 Usage Guide

### 1. **Submit Content for Analysis**
- Navigate to the "Submit" tab
- Choose content type (Message, URL, Email, SMS)
- Enter suspicious content
- Click "Analyze Content"
- View detailed risk assessment and features

### 2. **Explore Network Visualization**
- Go to the "Network" tab
- Interact with the D3.js graph:
  - **Zoom**: Use mouse wheel or control buttons
  - **Pan**: Click and drag to move around
  - **Node Selection**: Click nodes for detailed information
  - **Hover**: See tooltips with submission details

### 3. **Review Submission History**
- Visit the "History" tab
- Use filters and search to find specific submissions
- Sort by date, risk score, or content
- View detailed analysis results

### 4. **Analyze Risk Patterns**
- Check the "Analytics" tab
- View risk score distribution
- Monitor submission trends
- Identify common scam patterns

## 🔧 Configuration

### Environment Variables
```bash
# Backend (.env)
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
PORT=5000

# Optional: Additional API keys
OPENAI_API_KEY=your-openai-key
TWILIO_API_KEY=your-twilio-key
```

### Customizing Detection Rules
Edit `server.js` to modify:
- **Risk Scoring Algorithm**: Adjust weights in `calculateRiskScore()`
- **Feature Detection**: Modify patterns in `extractFeatures()`
- **Classification Thresholds**: Change values in `classifyRisk()`

### Adding New Datasets
```javascript
// Add to PHISHING_URLS array
const PHISHING_URLS = [
  // ... existing URLs
  'your-new-phishing-domain.com'
];

// Add to SPAM_KEYWORDS array
const SPAM_KEYWORDS = [
  // ... existing keywords
  'your-new-keyword'
];
```

## 🚀 Deployment

### Backend Deployment

#### Option 1: Firebase Functions
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase project
firebase init functions

# Deploy
firebase deploy --only functions
```

#### Option 2: Heroku
```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set FIREBASE_DATABASE_URL=your-url

# Deploy
git push heroku main
```

#### Option 3: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up
```

### Frontend Deployment

#### Option 1: Firebase Hosting
```bash
# Build the app
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

#### Option 2: Netlify
```bash
# Build the app
npm run build

# Deploy to Netlify (drag and drop build folder)
# Or connect GitHub repository for auto-deploy
```

#### Option 3: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 🔒 Security Considerations

### Production Security
- **Firebase Rules**: Implement proper Firestore security rules
- **API Rate Limiting**: Add rate limiting to prevent abuse
- **Input Validation**: Sanitize all user inputs
- **HTTPS**: Always use HTTPS in production
- **Environment Variables**: Never commit sensitive data

### Data Privacy
- **User Data**: Consider data retention policies
- **PII Handling**: Avoid storing personally identifiable information
- **GDPR Compliance**: Implement data deletion capabilities

## 🧪 Testing

### Backend Testing
```bash
# Run tests
npm test

# Test specific endpoints
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -d '{"text": "Test message", "type": "message"}'
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📊 Performance Optimization

### Backend
- **Caching**: Implement Redis for frequently accessed data
- **Database Indexing**: Add Firestore indexes for common queries
- **Connection Pooling**: Optimize database connections
- **Compression**: Enable gzip compression

### Frontend
- **Code Splitting**: Implement React.lazy() for route-based splitting
- **Bundle Optimization**: Use webpack bundle analyzer
- **Image Optimization**: Compress and optimize images
- **CDN**: Use CDN for static assets

## 🐛 Troubleshooting

### Common Issues

#### Firebase Connection Errors
```bash
# Check service account file
ls -la firebase-service-account.json

# Verify environment variables
echo $FIREBASE_DATABASE_URL

# Check Firebase project settings
firebase projects:list
```

#### D3.js Graph Not Rendering
- Check browser console for errors
- Verify data structure matches expected format
- Ensure container has proper dimensions
- Check for CSS conflicts

#### API Endpoints Not Working
```bash
# Test backend health
curl http://localhost:5000/api/health

# Check CORS configuration
# Verify proxy settings in frontend package.json
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check Firestore logs
firebase firestore:indexes
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Use ESLint and Prettier
- Follow React best practices
- Add JSDoc comments for functions
- Maintain consistent naming conventions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PhishTank** - Phishing URL database
- **Kaggle SMS Spam Collection** - SMS spam dataset
- **D3.js Community** - Visualization library
- **Firebase Team** - Backend infrastructure

## 📞 Support

- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check this README and inline code comments

## 🔮 Future Enhancements

- **AI/ML Integration**: Advanced NLP and deep learning models
- **Real-time Alerts**: Push notifications for high-risk content
- **Mobile App**: React Native mobile application
- **API Rate Limiting**: Implement proper rate limiting
- **User Authentication**: Multi-user support with roles
- **Advanced Analytics**: Machine learning insights and predictions
- **Integration APIs**: Connect with security tools and services

---

**Built with ❤️ for a safer digital world**
