// Firebase Configuration for Web App
// This file contains the Firebase configuration for the web version of TagYou

// NOTE: For production deployment on Netlify, you can add these as environment variables:
// FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID, etc.
// Then use a build script to replace these values during deployment.

// Firebase configuration object
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
try {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized with project:', firebaseConfig.projectId);
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Initialize Firebase services
try {
  const auth = firebase.auth();
  const db = firebase.firestore();
  const storage = firebase.storage();

  // Export for use in other files
  window.firebaseAuth = auth;
  window.firebaseDB = db;
  window.firebaseStorage = storage;

  console.log('Firebase services initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase services:', error);
}
