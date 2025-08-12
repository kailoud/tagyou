// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
