// Firebase Connection Test
// This script tests the Firebase connection and configuration

async function testFirebaseConnection() {
  console.log('🔍 Testing Firebase Connection...');
  console.log('================================');

  try {
    // Test 1: Check if Firebase SDK is loaded
    console.log('\n📋 Test 1: Firebase SDK Availability');
    console.log('Firebase object exists:', typeof firebase !== 'undefined');

    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase SDK not loaded');
      return;
    }

    console.log('✅ Firebase SDK loaded');
    console.log('Firebase apps:', firebase.apps.length);

    // Test 2: Check Firebase configuration
    console.log('\n📋 Test 2: Firebase Configuration');
    try {
      const firebaseModule = await import('./firebase-config.js');
      const { initializeFirebase } = firebaseModule;

      console.log('✅ Firebase config module loaded');

      // Test initialization
      const success = await initializeFirebase();
      console.log('Firebase initialization result:', success);

      if (success) {
        console.log('✅ Firebase initialized successfully');

        // Test 3: Check Firestore connection
        console.log('\n📋 Test 3: Firestore Connection');
        try {
          const db = firebase.firestore();
          console.log('✅ Firestore instance created');

          // Test a simple query
          const testQuery = await db.collection('test').limit(1).get();
          console.log('✅ Firestore query successful');
          console.log('Test collection documents:', testQuery.size);

        } catch (error) {
          console.error('❌ Firestore connection failed:', error.message);
        }

        // Test 4: Check Auth connection
        console.log('\n📋 Test 4: Auth Connection');
        try {
          const auth = firebase.auth();
          console.log('✅ Auth instance created');
          console.log('Current user:', auth.currentUser);

        } catch (error) {
          console.error('❌ Auth connection failed:', error.message);
        }

      } else {
        console.error('❌ Firebase initialization failed');
      }

    } catch (error) {
      console.error('❌ Firebase config module failed:', error.message);
    }

    // Test 5: Check project configuration
    console.log('\n📋 Test 5: Project Configuration');
    try {
      const secretConfig = await import('./firebase-config-secret.js');
      const config = secretConfig.default;

      console.log('✅ Secret config loaded');
      console.log('Project ID:', config.projectId);
      console.log('Auth Domain:', config.authDomain);
      console.log('Database URL:', config.databaseURL);
      console.log('Storage Bucket:', config.storageBucket);

      // Verify the project ID matches what we expect
      if (config.projectId === 'tagyouapp-b0d30') {
        console.log('✅ Project ID matches expected value');
      } else {
        console.warn('⚠️ Project ID does not match expected value');
      }

    } catch (error) {
      console.error('❌ Secret config failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
  }

  console.log('\n🎯 Firebase connection test completed!');
  console.log('=====================================');
}

// Export for manual use
export default testFirebaseConnection;

// Run automatically
testFirebaseConnection();
