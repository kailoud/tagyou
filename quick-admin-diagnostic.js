// Quick Admin Portal Diagnostic
// Run this in the admin portal console to find image_url issues

console.log('🔍 Quick Admin Portal Diagnostic Starting...');

// Check for image_url in the current page
function checkCurrentPage() {
  console.log('\n📋 Checking current page for image_url references...');

  // Check for image_url in form fields
  const imageInputs = document.querySelectorAll('input[name*="image"], input[placeholder*="image"], input[value*="image"]');
  console.log(`Found ${imageInputs.length} input fields with image references`);

  // Check for image_url in labels
  const imageLabels = document.querySelectorAll('label:contains("Image"), label:contains("image_url")');
  console.log(`Found ${imageLabels.length} labels with image references`);

  // Check for image_url in any text content
  const imageText = document.querySelectorAll('*:contains("Image URL"), *:contains("Quick Setup")');
  console.log(`Found ${imageText.length} elements with image URL text`);

  return {
    inputs: imageInputs.length,
    labels: imageLabels.length,
    text: imageText.length
  };
}

// Check for image_url in JavaScript variables
function checkJavaScriptVariables() {
  console.log('\n🔍 Checking JavaScript variables for image_url...');

  // Check global variables
  const globalVars = Object.keys(window).filter(key =>
    key.toLowerCase().includes('image') ||
    key.toLowerCase().includes('form') ||
    key.toLowerCase().includes('data')
  );

  console.log('Global variables with image/form/data:', globalVars);

  // Check for specific admin variables
  if (window.foodStallsData) {
    console.log('foodStallsData found:', window.foodStallsData.length, 'items');
    if (window.foodStallsData.length > 0) {
      const sampleItem = window.foodStallsData[0];
      console.log('Sample item keys:', Object.keys(sampleItem));
      if (sampleItem.image_url) {
        console.log('🚨 image_url found in foodStallsData!');
      }
    }
  }

  if (window.artistsData) {
    console.log('artistsData found:', window.artistsData.length, 'items');
  }

  if (window.floatTrucksData) {
    console.log('floatTrucksData found:', window.floatTrucksData.length, 'items');
  }
}

// Check for image_url in form data
function checkFormData() {
  console.log('\n📝 Checking form data for image_url...');

  const forms = document.querySelectorAll('form');
  forms.forEach((form, index) => {
    console.log(`Form ${index + 1}:`, form.action || 'No action');

    const formData = new FormData(form);
    for (let [key, value] of formData.entries()) {
      if (key.includes('image')) {
        console.log(`🚨 Found image field in form: ${key} = ${value}`);
      }
    }
  });
}

// Check for image_url in modal content
function checkModalContent() {
  console.log('\n🪟 Checking modal content for image_url...');

  const modals = document.querySelectorAll('.modal, [class*="modal"], [id*="modal"]');
  console.log(`Found ${modals.length} modal elements`);

  modals.forEach((modal, index) => {
    const imageElements = modal.querySelectorAll('*:contains("Image"), *:contains("image_url")');
    if (imageElements.length > 0) {
      console.log(`Modal ${index + 1} contains ${imageElements.length} image-related elements`);
    }
  });
}

// Check for image_url in API calls (if any are happening)
function checkAPICalls() {
  console.log('\n🌐 Checking for API calls...');

  // Override fetch to capture calls
  const originalFetch = window.fetch;
  let apiCallCount = 0;

  window.fetch = function (...args) {
    apiCallCount++;
    const url = args[0];
    console.log(`API Call ${apiCallCount}: ${url}`);

    // Check if this might be a schema call
    if (url.includes('schema') || url.includes('columns') || url.includes('meta')) {
      console.log('🔍 Potential schema API call detected!');
    }

    return originalFetch.apply(this, args);
  };

  console.log('✅ API interceptor installed');
}

// Main diagnostic function
function runQuickDiagnostic() {
  console.log('🚀 Running Quick Admin Portal Diagnostic...');

  const pageResults = checkCurrentPage();
  checkJavaScriptVariables();
  checkFormData();
  checkModalContent();
  checkAPICalls();

  console.log('\n📊 QUICK DIAGNOSTIC RESULTS:');
  console.log('============================');
  console.log('Image inputs found:', pageResults.inputs);
  console.log('Image labels found:', pageResults.labels);
  console.log('Image text elements found:', pageResults.text);

  if (pageResults.inputs > 0 || pageResults.labels > 0 || pageResults.text > 0) {
    console.log('\n🚨 IMAGE_URL ISSUES DETECTED!');
    console.log('Try clicking the edit button on a food stall to see the form');
  } else {
    console.log('\n✅ No image_url issues found on current page');
    console.log('💡 Try opening an edit form to see if image_url appears there');
  }

  return {
    pageResults,
    checkCurrentPage,
    checkJavaScriptVariables,
    checkFormData,
    checkModalContent,
    checkAPICalls
  };
}

// Export for manual use
window.quickAdminDiagnostic = {
  runQuickDiagnostic,
  checkCurrentPage,
  checkJavaScriptVariables,
  checkFormData,
  checkModalContent,
  checkAPICalls
};

// Auto-run
runQuickDiagnostic();

console.log('🔧 Quick diagnostic loaded. Run quickAdminDiagnostic.runQuickDiagnostic() to re-run.');
