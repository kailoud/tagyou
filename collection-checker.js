// Collection Checker - Diagnostic Tool
// This script will check what collections exist in your Firebase project

import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase-config.js';

async function checkCollections() {
  try {
    console.log('🔍 Checking Firebase collections...');

    // List all collections
    const collections = await getDocs(collection(db, ''));
    console.log('📊 Available collections:', collections.docs.map(doc => doc.id));

    // Check specific collections mentioned in admin portal
    const collectionNames = [
      'foodStalls',
      'artists',
      'floatTrucks',
      'users',
      'clients'
    ];

    for (const collectionName of collectionNames) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        console.log(`✅ Collection '${collectionName}': ${snapshot.size} documents`);

        if (snapshot.size > 0) {
          const firstDoc = snapshot.docs[0].data();
          console.log(`📋 Sample fields in '${collectionName}':`, Object.keys(firstDoc));
        }
      } catch (error) {
        console.log(`❌ Collection '${collectionName}': Not found or error - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking collections:', error);
  }
}

// Run the check
checkCollections();
