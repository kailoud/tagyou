// Firebase Diagnostic Tool
// This script will help identify why Firebase data isn't being integrated

// Using CDN imports for better compatibility with live server
const { collection, getDocs, doc, getDoc } = firebase.firestore;

// Use global Firebase Firestore instance
const db = firebase.firestore();

async function runFirebaseDiagnostic() {
  console.log('🔍 Starting Firebase Diagnostic...');
  console.log('=====================================');

  try {
    // 1. Check if Firebase is initialized
    console.log('1️⃣ Checking Firebase initialization...');
    if (!db) {
      console.error('❌ Firebase db is null - Firebase not initialized');
      return;
    }
    console.log('✅ Firebase db is initialized');

    // 2. Check Firebase configuration
    console.log('2️⃣ Checking Firebase configuration...');
    try {
      const configDoc = await getDoc(doc(db, '_config', 'test'));
      console.log('✅ Firebase connection successful');
    } catch (error) {
      console.log('⚠️ Firebase connection test failed:', error.message);
    }

    // 3. Check collections
    console.log('3️⃣ Checking collections...');
    const collectionsToCheck = ['foodStalls', 'artists', 'floatTrucks'];

    for (const collectionName of collectionsToCheck) {
      try {
        console.log(`\n📊 Checking collection: ${collectionName}`);
        const snapshot = await getDocs(collection(db, collectionName));
        console.log(`   Documents found: ${snapshot.size}`);

        if (snapshot.size > 0) {
          const firstDoc = snapshot.docs[0];
          const data = firstDoc.data();
          console.log(`   ✅ Collection exists with data`);
          console.log(`   📋 Document ID: ${firstDoc.id}`);
          console.log(`   📋 Fields: ${Object.keys(data).join(', ')}`);
          console.log(`   📋 Sample data:`, data);

          // Check for required fields
          const requiredFields = getRequiredFields(collectionName);
          const missingFields = requiredFields.filter(field => !data.hasOwnProperty(field));

          if (missingFields.length > 0) {
            console.log(`   ⚠️ Missing required fields: ${missingFields.join(', ')}`);
          } else {
            console.log(`   ✅ All required fields present`);
          }
        } else {
          console.log(`   ⚠️ Collection exists but is empty`);
        }
      } catch (error) {
        console.log(`   ❌ Error accessing collection: ${error.message}`);
      }
    }

    // 4. Test data loading functions
    console.log('\n4️⃣ Testing data loading functions...');
    await testDataLoading();

  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

function getRequiredFields(collectionName) {
  switch (collectionName) {
    case 'foodStalls':
      return ['name', 'location', 'rating', 'hours', 'status', 'description', 'lat', 'lng', 'image', 'contact'];
    case 'artists':
      return ['name', 'genre', 'performance_time', 'stage', 'rating', 'status', 'description', 'image', 'contact'];
    case 'floatTrucks':
      return ['name', 'type', 'route', 'time', 'status', 'description', 'image'];
    default:
      return [];
  }
}

async function testDataLoading() {
  try {
    // Test FoodStallsService
    console.log('   🍽️ Testing FoodStallsService...');
    const { FoodStallsService } = await import('./firebase-service.js');
    const foodStalls = await FoodStallsService.getAllFoodStalls();
    console.log(`   ✅ FoodStallsService returned ${foodStalls.length} items`);

    if (foodStalls.length > 0) {
      console.log(`   📋 Sample food stall:`, foodStalls[0]);
    }

    // Test ArtistsService
    console.log('   🎵 Testing ArtistsService...');
    const { ArtistsService } = await import('./firebase-service.js');
    const artists = await ArtistsService.getAllArtists();
    console.log(`   ✅ ArtistsService returned ${artists.length} items`);

    if (artists.length > 0) {
      console.log(`   📋 Sample artist:`, artists[0]);
    }

    // Test FloatTrucksService
    console.log('   🚛 Testing FloatTrucksService...');
    const { FloatTrucksService } = await import('./firebase-service.js');
    const floatTrucks = await FloatTrucksService.getAllFloatTrucks();
    console.log(`   ✅ FloatTrucksService returned ${floatTrucks.length} items`);

    if (floatTrucks.length > 0) {
      console.log(`   📋 Sample float truck:`, floatTrucks[0]);
    }

  } catch (error) {
    console.error('   ❌ Error testing data loading:', error);
  }
}

// Run the diagnostic
runFirebaseDiagnostic();
