// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase Configuration
let firebaseConfig = null;

// Load Firebase configuration securely
async function loadFirebaseConfig() {
  try {
    // Try to load from secret configuration file (for development)
    const secretConfig = await import('./firebase-config-secret.js');
    firebaseConfig = secretConfig.default;
    console.log('Firebase configuration loaded from secret file');
  } catch (error) {
    console.warn('Firebase configuration not found. Please create firebase-config-secret.js with your credentials.');
    console.warn('Copy firebase-config-secret.template.js to firebase-config-secret.js and add your actual Firebase config.');
    firebaseConfig = null;
  }
}

// Initialize Firebase only if config is available
let app = null;
let db = null;
let auth = null;
let analytics = null;

async function initializeFirebase() {
  await loadFirebaseConfig();

  if (firebaseConfig) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    // Initialize Analytics (only in browser environment)
    try {
      if (typeof window !== 'undefined') {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics initialized');
      }
    } catch (error) {
      console.warn('Analytics initialization failed:', error);
    }

    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase not initialized - no configuration found');
  }
}

// Initialize Firebase immediately
initializeFirebase();

// Export Firebase services (will be null if not initialized)
export { db, auth, analytics, app as default };
