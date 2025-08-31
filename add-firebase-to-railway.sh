#!/bin/bash

echo "🔧 Adding Firebase Credentials to Railway"
echo "========================================="

# Read the Firebase service account file
FIREBASE_CREDENTIALS=$(cat firebase-service-account.json)

echo "📋 Copy this environment variable to Railway:"
echo ""
echo "Variable Name: FIREBASE_SERVICE_ACCOUNT"
echo "Variable Value:"
echo "$FIREBASE_CREDENTIALS"
echo ""
echo "📝 Instructions:"
echo "1. Go to: https://railway.app/project/acd8d7de-72a9-43a0-99dd-f963427076fd"
echo "2. Click on your service → Variables tab"
echo "3. Add new variable:"
echo "   - Name: FIREBASE_SERVICE_ACCOUNT"
echo "   - Value: (paste the JSON above)"
echo "4. Save and redeploy"
echo ""
echo "🔗 Railway Dashboard: https://railway.app/project/acd8d7de-72a9-43a0-99dd-f963427076fd"
