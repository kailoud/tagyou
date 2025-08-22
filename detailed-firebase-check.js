// Detailed Firebase Data Check
// This script will thoroughly check your Firebase data and identify issues

async function runDetailedFirebaseCheck() {
  console.log('🔍 Starting Detailed Firebase Data Check...');
  console.log('============================================');

  try {
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase SDK not loaded');
      return;
    }
    console.log('✅ Firebase SDK loaded');

    // Check if Firebase Firestore is available
    if (!firebase.firestore) {
      console.error('❌ Firebase Firestore not loaded');
      return;
    }
    console.log('✅ Firebase db initialized');

    // Check all collections
    const collections = ['foodStalls', 'artists', 'floatTrucks', 'users', 'clients'];

    for (const collectionName of collections) {
      console.log(`\n📊 Checking Collection: ${collectionName}`);
      console.log('----------------------------------------');

      try {
        const snapshot = await firebase.firestore().collection(collectionName).get();
        console.log(`📈 Total documents: ${snapshot.size}`);

        if (snapshot.size > 0) {
          console.log('📋 Document details:');
          snapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`  Document ${index + 1} (ID: ${doc.id}):`);
            console.log(`    Fields: ${Object.keys(data).join(', ')}`);
            console.log(`    Data:`, data);

            // Check for required fields based on collection
            const requiredFields = getRequiredFields(collectionName);
            const missingFields = requiredFields.filter(field => !data.hasOwnProperty(field));

            if (missingFields.length > 0) {
              console.log(`    ⚠️ Missing required fields: ${missingFields.join(', ')}`);
            } else {
              console.log(`    ✅ All required fields present`);
            }

            // Check status field
            if (data.status && data.status !== 'active') {
              console.log(`    ⚠️ Status is not 'active': ${data.status}`);
            }

            console.log('');
          });
        } else {
          console.log('⚠️ Collection is empty');
        }
      } catch (error) {
        console.error(`❌ Error accessing collection ${collectionName}:`, error.message);
      }
    }

    // Test data loading functions
    console.log('\n🧪 Testing Data Loading Functions...');
    console.log('=====================================');

    await testDataLoadingFunctions();

  } catch (error) {
    console.error('❌ Detailed check failed:', error);
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
    case 'users':
      return ['name', 'email', 'registration_date', 'status', 'last_activity'];
    case 'clients':
      return ['business_name', 'contact_person', 'email', 'phone', 'category', 'description', 'status'];
    default:
      return [];
  }
}

async function testDataLoadingFunctions() {
  try {
    // Test FoodStallsService
    console.log('🍽️ Testing FoodStallsService...');
    const { FoodStallsService } = await import('./firebase-service.js');
    const foodStalls = await FoodStallsService.getAllFoodStalls();
    console.log(`   ✅ FoodStallsService returned ${foodStalls.length} items`);

    if (foodStalls.length > 0) {
      console.log(`   📋 Sample food stall:`, foodStalls[0]);
      console.log(`   🗺️ Has coordinates: ${foodStalls[0].lat && foodStalls[0].lng ? 'Yes' : 'No'}`);
      console.log(`   📍 Location: ${foodStalls[0].location || 'Missing'}`);
      console.log(`   🏷️ Status: ${foodStalls[0].status || 'Missing'}`);
    }

    // Test ArtistsService
    console.log('\n🎵 Testing ArtistsService...');
    const { ArtistsService } = await import('./firebase-service.js');
    const artists = await ArtistsService.getAllArtists();
    console.log(`   ✅ ArtistsService returned ${artists.length} items`);

    if (artists.length > 0) {
      console.log(`   📋 Sample artist:`, artists[0]);
      console.log(`   🗺️ Has coordinates: ${artists[0].lat && artists[0].lng ? 'Yes' : 'No'}`);
      console.log(`   📍 Location: ${artists[0].location || 'Missing'}`);
      console.log(`   🏷️ Status: ${artists[0].status || 'Missing'}`);
    }

    // Test FloatTrucksService
    console.log('\n🚛 Testing FloatTrucksService...');
    const { FloatTrucksService } = await import('./firebase-service.js');
    const floatTrucks = await FloatTrucksService.getAllFloatTrucks();
    console.log(`   ✅ FloatTrucksService returned ${floatTrucks.length} items`);

    if (floatTrucks.length > 0) {
      console.log(`   📋 Sample float truck:`, floatTrucks[0]);
      console.log(`   🏷️ Status: ${floatTrucks[0].status || 'Missing'}`);
    }

    // Test map display functions
    console.log('\n🗺️ Testing Map Display Functions...');
    console.log('=====================================');

    // Check if map functions are available
    if (typeof showFoodStalls === 'function') {
      console.log('✅ showFoodStalls function available');
    } else {
      console.log('❌ showFoodStalls function not available');
    }

    if (typeof showArtists === 'function') {
      console.log('✅ showArtists function available');
    } else {
      console.log('❌ showArtists function not available');
    }

  } catch (error) {
    console.error('❌ Error testing data loading functions:', error);
  }
}

// Run the detailed check
runDetailedFirebaseCheck();
