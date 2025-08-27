// Image Display Diagnostic Script
// Run this in the admin portal console to diagnose image display issues

console.log('🔍 Image Display Diagnostic Starting...');

// Function to check current data
function checkImageData() {
  console.log('\n📊 Checking image data in foodStallsData...');

  if (window.foodStallsData) {
    console.log(`Found ${window.foodStallsData.length} food stalls`);

    let stallsWithImages = 0;
    let totalImages = 0;

    window.foodStallsData.forEach((stall, index) => {
      console.log(`\n${index + 1}. ${stall.name}:`);
      console.log('   all_images:', stall.all_images);
      console.log('   main_image_index:', stall.main_image_index);

      if (stall.all_images && stall.all_images.length > 0) {
        stallsWithImages++;
        totalImages += stall.all_images.length;
        console.log('   ✅ Has images');
        stall.all_images.forEach((img, imgIndex) => {
          console.log(`     Image ${imgIndex}:`, img);
        });
      } else {
        console.log('   ❌ No images');
      }
    });

    console.log(`\n📈 Summary: ${stallsWithImages}/${window.foodStallsData.length} stalls have images (${totalImages} total images)`);

    return { stallsWithImages, totalImages };
  } else {
    console.log('❌ foodStallsData not found');
    return { stallsWithImages: 0, totalImages: 0 };
  }
}

// Function to check table rendering
function checkTableRendering() {
  console.log('\n📋 Checking table rendering...');

  // Look for table elements
  const tables = document.querySelectorAll('table, [class*="table"], [class*="grid"]');
  console.log(`Found ${tables.length} table/grid elements`);

  // Look for table rows
  const tableRows = document.querySelectorAll('tr, .table-row, [class*="row"]');
  console.log(`Found ${tableRows.length} table rows`);

  // Look for image elements in table
  const tableImages = document.querySelectorAll('img, [class*="image"], [class*="img"]');
  console.log(`Found ${tableImages.length} image elements in table`);

  if (tableImages.length > 0) {
    tableImages.forEach((img, index) => {
      const src = img.src || img.dataset.src || img.getAttribute('data-src');
      console.log(`Image ${index + 1}:`, {
        src: src,
        alt: img.alt,
        width: img.width,
        height: img.height,
        visible: img.offsetParent !== null
      });
    });
  }

  return { tables: tables.length, rows: tableRows.length, images: tableImages.length };
}

// Function to check for upload/save functions
function checkUploadFunctions() {
  console.log('\n📤 Checking upload/save functions...');

  // Look for upload-related functions
  const uploadFunctions = [
    'uploadImage',
    'handleImageUpload',
    'saveImage',
    'updateFoodStall',
    'saveFoodStall'
  ];

  uploadFunctions.forEach(funcName => {
    if (window[funcName]) {
      console.log(`✅ Found function: ${funcName}`);
    } else {
      console.log(`❌ Missing function: ${funcName}`);
    }
  });

  // Check for global upload state
  if (window.uploadedImages) {
    console.log('✅ Found uploadedImages:', window.uploadedImages);
  }

  if (window.currentUploads) {
    console.log('✅ Found currentUploads:', window.currentUploads);
  }
}

// Function to monitor upload process
function monitorUpload() {
  console.log('\n📡 Setting up upload monitoring...');

  // Override fetch to monitor upload calls
  const originalFetch = window.fetch;
  let uploadCallCount = 0;

  window.fetch = function (...args) {
    const url = args[0];
    const options = args[1] || {};

    // Check if this is an upload call
    if (url.includes('upload') || url.includes('image') || options.method === 'POST') {
      uploadCallCount++;
      console.log(`📤 Upload call ${uploadCallCount}: ${options.method || 'GET'} ${url}`);

      if (options.body) {
        console.log('   Body type:', typeof options.body);
        if (options.body instanceof FormData) {
          console.log('   FormData entries:');
          for (let [key, value] of options.body.entries()) {
            console.log(`     ${key}:`, value);
          }
        }
      }
    }

    return originalFetch.apply(this, args);
  };

  console.log('✅ Upload monitoring active');
}

// Function to check database connection
function checkDatabaseConnection() {
  console.log('\n🗄️ Checking database connection...');

  // Look for Supabase client
  if (window.supabase) {
    console.log('✅ Supabase client found');
  } else {
    console.log('❌ Supabase client not found');
  }

  // Look for API client
  if (window.apiClient) {
    console.log('✅ API client found');
  } else {
    console.log('❌ API client not found');
  }
}

// Function to provide fix suggestions
function provideFixSuggestions(dataResults, tableResults) {
  console.log('\n🔧 Fix Suggestions:');
  console.log('==================');

  if (dataResults.totalImages === 0) {
    console.log('1. 🚨 No images in data - Check upload/save process');
    console.log('   - Verify images are being uploaded');
    console.log('   - Check if save function includes image data');
    console.log('   - Look for upload errors in console');
  } else if (tableResults.images === 0) {
    console.log('2. 🚨 Images in data but not in table - Fix table rendering');
    console.log('   - Update table rendering to show images');
    console.log('   - Check if table is reading image data');
    console.log('   - Verify image URLs are correct');
  } else {
    console.log('3. ✅ Images found in both data and table');
    console.log('   - Check if images are visible (CSS issues)');
    console.log('   - Verify image URLs are accessible');
  }

  console.log('\n💡 Next steps:');
  console.log('   - Try uploading a new image');
  console.log('   - Check the Network tab for upload calls');
  console.log('   - Look for any error messages');
}

// Main diagnostic function
function runImageDiagnostic() {
  console.log('🚀 Running Image Display Diagnostic...');

  const dataResults = checkImageData();
  const tableResults = checkTableRendering();
  checkUploadFunctions();
  monitorUpload();
  checkDatabaseConnection();
  provideFixSuggestions(dataResults, tableResults);

  console.log('\n✅ Diagnostic complete!');
  console.log('💡 Try uploading an image now to see the monitoring in action');

  return {
    dataResults,
    tableResults,
    checkImageData,
    checkTableRendering,
    checkUploadFunctions,
    monitorUpload,
    checkDatabaseConnection
  };
}

// Export for manual use
window.imageDisplayDiagnostic = {
  runImageDiagnostic,
  checkImageData,
  checkTableRendering,
  checkUploadFunctions,
  monitorUpload,
  checkDatabaseConnection
};

// Auto-run
runImageDiagnostic();

console.log('🔧 Image display diagnostic loaded. Run imageDisplayDiagnostic.runImageDiagnostic() to re-run.');
