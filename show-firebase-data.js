// Show Firebase Data Table
// This script will display all your Firebase data in a clear format

async function showFirebaseDataTable() {
  console.log('📊 FIREBASE DATA TABLE');
  console.log('=======================');
  console.log('');

  try {
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase SDK not loaded');
      return;
    }

    // Check if db is available
    if (!db) {
      console.error('❌ Firebase db not initialized');
      return;
    }

    // Collections to check
    const collections = ['foodStalls', 'artists', 'floatTrucks', 'users', 'clients'];

    for (const collectionName of collections) {
      console.log(`🗂️ COLLECTION: ${collectionName.toUpperCase()}`);
      console.log('─'.repeat(50));

      try {
        const snapshot = await firebase.firestore().collection(collectionName).get();
        console.log(`📈 Total Documents: ${snapshot.size}`);
        console.log('');

        if (snapshot.size === 0) {
          console.log('   ⚠️ No documents found in this collection');
          console.log('');
          continue;
        }

        // Display each document
        snapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          console.log(`📄 Document ${index + 1} (ID: ${doc.id})`);
          console.log('   ┌─────────────────────────────────────────────────────────');

          // Display all fields
          Object.entries(data).forEach(([key, value]) => {
            let displayValue = value;

            // Format the value for better display
            if (typeof value === 'object' && value !== null) {
              displayValue = JSON.stringify(value, null, 2);
            } else if (typeof value === 'string' && value.length > 50) {
              displayValue = value.substring(0, 50) + '...';
            }

            console.log(`   │ ${key.padEnd(20)}: ${displayValue}`);
          });

          console.log('   └─────────────────────────────────────────────────────────');
          console.log('');
        });

      } catch (error) {
        console.error(`❌ Error accessing collection ${collectionName}:`, error.message);
        console.log('');
      }
    }

    // Summary table
    console.log('📋 SUMMARY TABLE');
    console.log('================');
    console.log('Collection Name    | Documents | Status');
    console.log('───────────────────|───────────|────────');

    for (const collectionName of collections) {
      try {
        const snapshot = await firebase.firestore().collection(collectionName).get();
        const status = snapshot.size > 0 ? '✅ Has Data' : '⚠️ Empty';
        console.log(`${collectionName.padEnd(18)} | ${snapshot.size.toString().padStart(9)} | ${status}`);
      } catch (error) {
        console.log(`${collectionName.padEnd(18)} | ${'ERROR'.padStart(9)} | ❌ Access Denied`);
      }
    }

  } catch (error) {
    console.error('❌ Failed to show Firebase data:', error);
  }
}

// Export the function for manual use
export default showFirebaseDataTable;

// Run the data table display automatically
showFirebaseDataTable();
