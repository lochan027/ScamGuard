const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let db;
try {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  db = admin.firestore();
} catch (error) {
  console.error('Firebase initialization error:', error);
  db = null;
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    if (!db) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database not available' })
      };
    }

    const submissionsRef = db.collection('submissions');
    const snapshot = await submissionsRef
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const submissions = [];
    snapshot.forEach(doc => {
      submissions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(submissions)
    };

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch submissions' })
    };
  }
};
