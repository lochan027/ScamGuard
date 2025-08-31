import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDoTztz2TVK_s1Jm1m4x8U6GtLqWnce2kE",
  authDomain: "scammerdetection.firebaseapp.com",
  projectId: "scammerdetection",
  storageBucket: "scammerdetection.firebasestorage.app",
  messagingSenderId: "747621991332",
  appId: "1:747621991332:web:9d0dc613f839503c447731",
  measurementId: "G-Z5GKXFDL78"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
