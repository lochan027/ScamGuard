const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let db;
try {
  // Check if Firebase is already initialized
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  db = admin.firestore();
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Fallback to demo mode if Firebase fails
  db = null;
}

// ML Classification Logic
function classifyContent(text, type) {
  let riskScore = 0;
  const features = {
    length: text.length,
    hasUrl: /https?:\/\/[^\s]+/.test(text),
    hasPhone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(text),
    hasEmail: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text),
    hasCurrency: /\$[\d,]+(\.\d{2})?|\d+[\s]*(dollars?|USD|EUR|GBP)/i.test(text),
    hasUrgency: /\b(urgent|immediate|asap|quick|hurry|limited|expiring|deadline)\b/i.test(text),
    hasThreat: /\b(suspend|block|lock|terminate|close|delete|remove|ban)\b/i.test(text),
    hasReward: /\b(prize|reward|bonus|gift|free|win|winner|claim)\b/i.test(text),
    hasAuthority: /\b(IRS|government|police|FBI|CIA|bank|paypal|amazon|netflix)\b/i.test(text),
    hasAction: /\b(click|verify|confirm|update|login|sign|pay|send|transfer)\b/i.test(text),
    hasSuspiciousDomain: /\b(bit\.ly|tinyurl|goo\.gl|t\.co|is\.gd|v\.gd)\b/i.test(text),
    keywordMatches: 0
  };

  // Calculate risk score based on features
  if (features.hasUrl) riskScore += 15;
  if (features.hasPhone) riskScore += 10;
  if (features.hasEmail) riskScore += 5;
  if (features.hasCurrency) riskScore += 20;
  if (features.hasUrgency) riskScore += 25;
  if (features.hasThreat) riskScore += 30;
  if (features.hasReward) riskScore += 15;
  if (features.hasAuthority) riskScore += 20;
  if (features.hasAction) riskScore += 15;
  if (features.hasSuspiciousDomain) riskScore += 25;

  // Length-based scoring
  if (text.length < 20) riskScore += 10;
  if (text.length > 200) riskScore += 5;

  // Keyword matching
  const suspiciousKeywords = [
    'urgent', 'verify', 'account', 'suspended', 'limited time',
    'claim', 'prize', 'winner', 'free', 'bitcoin', 'crypto',
    'investment', 'opportunity', 'guaranteed', 'act now'
  ];
  
  features.keywordMatches = suspiciousKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  ).length;
  
  riskScore += features.keywordMatches * 8;

  // Normalize score to 0-100
  riskScore = Math.min(100, Math.max(0, riskScore));

  // Determine risk category
  let riskCategory = 'safe';
  if (riskScore >= 70) riskCategory = 'scam';
  else if (riskScore >= 30) riskCategory = 'suspicious';

  return { riskScore, riskCategory, features };
}

// Find similar submissions
async function findSimilarSubmissions(text, riskCategory, db) {
  if (!db) return [];
  
  try {
    const submissionsRef = db.collection('submissions');
    const snapshot = await submissionsRef
      .where('riskCategory', '==', riskCategory)
      .limit(10)
      .get();
    
    const similar = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.text && data.text !== text) {
        // Simple similarity calculation
        const similarity = calculateSimilarity(text, data.text);
        if (similarity > 0.3) {
          similar.push({
            id: doc.id,
            text: data.text,
            similarity: similarity
          });
        }
      }
    });
    
    return similar.slice(0, 7).map(s => s.id);
  } catch (error) {
    console.error('Error finding similar submissions:', error);
    return [];
  }
}

// Calculate text similarity
function calculateSimilarity(text1, text2) {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  const intersection = words1.filter(word => words2.includes(word));
  const union = [...new Set([...words1, ...words2])];
  return intersection.length / union.length;
}

// Main function handler
exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { text, type } = body;

    if (!text || !text.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Text content is required' })
      };
    }

    // Perform ML classification
    const analysis = classifyContent(text.trim(), type || 'message');
    
    // Generate submission ID
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Find similar submissions
    const similarSubmissions = await findSimilarSubmissions(
      text.trim(), 
      analysis.riskCategory, 
      db
    );

    // Prepare submission data
    const submission = {
      id: submissionId,
      text: text.trim(),
      type: type || 'message',
      riskScore: analysis.riskScore,
      riskCategory: analysis.riskCategory,
      features: analysis.features,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      similarSubmissions: similarSubmissions
    };

    // Save to Firebase if available
    if (db) {
      try {
        await db.collection('submissions').doc(submissionId).set(submission);
        
        // Create node for network graph
        const node = {
          id: submissionId,
          label: text.length > 50 ? text.substring(0, 50) + '...' : text,
          riskScore: analysis.riskScore,
          riskCategory: analysis.riskCategory,
          type: type || 'message',
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('nodes').doc(submissionId).set(node);
        
        // Create edges for similar submissions
        if (similarSubmissions.length > 0) {
          const edges = similarSubmissions.map(similarId => ({
            id: `${submissionId}-${similarId}`,
            source: submissionId,
            target: similarId,
            weight: 1,
            type: 'similarity'
          }));
          
          for (const edge of edges) {
            await db.collection('edges').doc(edge.id).set(edge);
          }
        }
      } catch (firebaseError) {
        console.error('Firebase save error:', firebaseError);
        // Continue without Firebase if it fails
      }
    }

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        submission: submission,
        message: `Submission classified as ${analysis.riskCategory} with risk score ${analysis.riskScore}`
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};
