// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDWm3v-1WXxHWDYIzqK1nCjrBeVW-GvG1I",
  authDomain: "tagyouapp-b0d30.firebaseapp.com",
  databaseURL: "https://tagyouapp-b0d30-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tagyouapp-b0d30",
  storageBucket: "tagyouapp-b0d30.firebasestorage.app",
  messagingSenderId: "955342799504",
  appId: "1:955342799504:web:b5a084cc5c7aadfdc04e15",
  measurementId: "G-PQ4H26G1DG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics (optional)
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.log('Analytics not available:', error);
}

// Export for use in other files
window.firebaseAuth = auth;
window.firebaseDB = db;
window.firebaseStorage = storage;
window.firebaseAnalytics = analytics;

// Log configuration status
console.log('Firebase v9+ initialized with project:', firebaseConfig.projectId);
