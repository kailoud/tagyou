// Firebase Configuration
// Using CDN imports for better compatibility with live server

// Firebase Configuration
let firebaseConfig = null;
let app = null;
let db = null;
let auth = null;
let analytics = null;

// Load Firebase configuration securely
async function loadFirebaseConfig() {
  try {
    // Try to load from secret configuration file (for development)
    const secretConfig = await import('./firebase-config-secret.js');
    firebaseConfig = secretConfig.default;
    console.log('✅ Firebase configuration loaded from secret file');
    return true;
  } catch (error) {
    console.warn('⚠️ Firebase configuration not found. Please create firebase-config-secret.js with your credentials.');
    console.warn('Copy firebase-config-secret.template.js to firebase-config-secret.js and add your actual Firebase config.');
    firebaseConfig = null;
    return false;
  }
}

// Initialize Firebase only if config is available
async function initializeFirebase() {
  console.log('🔥 Starting Firebase initialization...');

  // Wait for Firebase to be available
  let attempts = 0;
  const maxAttempts = 30;

  while (attempts < maxAttempts) {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
      console.log('✅ Firebase SDK available, proceeding with initialization...');
      break;
    }
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (attempts >= maxAttempts) {
    throw new Error('Firebase SDK not available after 30 seconds');
  }

  const configLoaded = await loadFirebaseConfig();

  if (configLoaded && firebaseConfig) {
    try {
      // Use the global firebase object directly
      app = firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      auth = firebase.auth();

      // Initialize Analytics (only in browser environment)
      try {
        if (typeof window !== 'undefined' && firebase.analytics) {
          analytics = firebase.analytics();
          console.log('✅ Firebase Analytics initialized');
        }
      } catch (error) {
        console.warn('⚠️ Analytics initialization failed:', error);
      }

      console.log('✅ Firebase initialized successfully');
      console.log('📊 Project ID:', firebaseConfig.projectId);
      console.log('🌐 Auth Domain:', firebaseConfig.authDomain);
      return true;
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      throw error;
    }
  } else {
    console.warn('⚠️ Firebase not initialized - no configuration found');
    return false;
  }
}

// Export Firebase services (will be null if not initialized)
export { db, auth, analytics, app as default, initializeFirebase };
