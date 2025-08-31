import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDoTztz2TVK_s1Jm1m4x8U6GtLqWnce2kE",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "scammerdetection.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "scammerdetection",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "scammerdetection.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "747621991332",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:747621991332:web:9d0dc613f839503c447731",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-Z5GKXFDL78"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Firestore helper functions
export const saveSubmission = async (submissionData) => {
  try {
    const docRef = await addDoc(collection(db, 'submissions'), {
      ...submissionData,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    throw error;
  }
};

export const saveNode = async (nodeData) => {
  try {
    const docRef = await addDoc(collection(db, 'nodes'), {
      ...nodeData,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving node to Firebase:', error);
    throw error;
  }
};

export const saveEdge = async (edgeData) => {
  try {
    const docRef = await addDoc(collection(db, 'edges'), edgeData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving edge to Firebase:', error);
    throw error;
  }
};

export const getSubmissions = async () => {
  try {
    const q = query(collection(db, 'submissions'), orderBy('timestamp', 'desc'), limit(100));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting submissions from Firebase:', error);
    throw error;
  }
};

export const getGraphData = async () => {
  try {
    const [nodesSnapshot, edgesSnapshot] = await Promise.all([
      getDocs(collection(db, 'nodes')),
      getDocs(collection(db, 'edges'))
    ]);
    
    const nodes = nodesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const edges = edgesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { nodes, edges };
  } catch (error) {
    console.error('Error getting graph data from Firebase:', error);
    throw error;
  }
};

export default app;
