// Firebase Configuration for Web App
// This file contains the Firebase configuration for the web version of TagYou

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyDWm3v-1WXxHWDYIzqK1nCjrBeVW-GvG1I",
  authDomain: "tagyouapp-b0d30.firebaseapp.com",
  projectId: "tagyouapp-b0d30",
  storageBucket: "tagyouapp-b0d30.firebasestorage.app",
  messagingSenderId: "955342799504",
  appId: "1:955342799504:web:b5a084cc5c7aadfdc04e15",
  measurementId: "G-PQ4H26G1DG"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Export for use in other files
window.firebaseAuth = auth;
window.firebaseDB = db;
window.firebaseStorage = storage;
