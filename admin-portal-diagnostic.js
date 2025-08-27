// Admin Portal Image URL Diagnostic Script
// Run this in the browser console on the admin portal to identify issues

console.log('🔍 Admin Portal Image URL Diagnostic Starting...');

// Function to check for image_url references in the DOM
function checkDOMForImageURL() {
  console.log('\n📋 Checking DOM for image_url references...');

  const imageUrlInputs = document.querySelectorAll('input[name*="image_url"], input[placeholder*="image"], input[value*="image"]');
  const imageUrlLabels = document.querySelectorAll('label:contains("Image URL"), label:contains("image_url")');
  const imageUrlText = document.querySelectorAll('*:contains("Image URL"), *:contains("Quick Setup")');

  console.log(`Found ${imageUrlInputs.length} input fields with image_url references`);
  console.log(`Found ${imageUrlLabels.length} labels with image_url references`);

  imageUrlInputs.forEach((input, index) => {
    console.log(`Input ${index + 1}:`, {
      name: input.name,
      placeholder: input.placeholder,
      value: input.value,
      id: input.id,
      className: input.className
    });
  });

  return {
    inputs: imageUrlInputs.length,
    labels: imageUrlLabels.length,
    elements: imageUrlInputs
  };
}

// Function to check for image_url in JavaScript variables
function checkJavaScriptForImageURL() {
  console.log('\n🔍 Checking JavaScript for image_url references...');

  const globalVars = Object.keys(window).filter(key =>
    key.toLowerCase().includes('image') ||
    key.toLowerCase().includes('form') ||
    key.toLowerCase().includes('data')
  );

  console.log('Potential global variables:', globalVars);

  // Check for form data objects
  const formDataVars = globalVars.filter(key => {
    try {
      const value = window[key];
      return value && typeof value === 'object' && (
        value.image_url !== undefined ||
        value.formData !== undefined ||
        value.form !== undefined
      );
    } catch (e) {
      return false;
    }
  });

  console.log('Form data variables:', formDataVars);

  return formDataVars;
}

// Function to check for API calls with image_url
function checkAPICalls() {
  console.log('\n🌐 Checking for API calls with image_url...');

  // Override fetch to intercept API calls
  const originalFetch = window.fetch;
  const apiCalls = [];

  window.fetch = function (...args) {
    const url = args[0];
    const options = args[1] || {};

    // Check if the request contains image_url
    if (options.body) {
      try {
        const body = JSON.parse(options.body);
        if (body.image_url !== undefined) {
          apiCalls.push({
            url,
            method: options.method || 'GET',
            body: body,
            timestamp: new Date().toISOString()
          });
          console.log('🚨 API call with image_url detected:', {
            url,
            method: options.method || 'GET',
            body: body
          });
        }
      } catch (e) {
        // Body might not be JSON
      }
    }

    return originalFetch.apply(this, args);
  };

  console.log('✅ Fetch interceptor installed. API calls with image_url will be logged.');

  return apiCalls;
}

// Function to check for React/Vue component state
function checkComponentState() {
  console.log('\n⚛️ Checking for React/Vue component state...');

  // Look for React DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ React DevTools detected');
    console.log('💡 Use React DevTools to inspect component state for image_url');
  }

  // Look for Vue DevTools
  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('✅ Vue DevTools detected');
    console.log('💡 Use Vue DevTools to inspect component state for image_url');
  }

  // Check for common state management libraries
  const stateLibraries = [
    'Redux',
    'MobX',
    'Vuex',
    'Pinia',
    'Zustand',
    'Recoil'
  ];

  stateLibraries.forEach(lib => {
    if (window[lib]) {
      console.log(`✅ ${lib} detected`);
    }
  });
}

// Function to generate a report
function generateReport() {
  console.log('\n📊 Generating Diagnostic Report...');

  const report = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    domIssues: checkDOMForImageURL(),
    jsIssues: checkJavaScriptForImageURL(),
    apiIssues: checkAPICalls(),
    componentState: checkComponentState()
  };

  console.log('\n📋 DIAGNOSTIC REPORT:');
  console.log('====================');
  console.log('URL:', report.url);
  console.log('Timestamp:', report.timestamp);
  console.log('DOM Issues Found:', report.domIssues.inputs + report.domIssues.labels);
  console.log('JavaScript Variables:', report.jsIssues.length);
  console.log('API Interceptor:', 'Active');

  // Save report to localStorage for later reference
  localStorage.setItem('adminPortalDiagnosticReport', JSON.stringify(report));
  console.log('💾 Report saved to localStorage as "adminPortalDiagnosticReport"');

  return report;
}

// Function to provide fix suggestions
function provideFixSuggestions(report) {
  console.log('\n🔧 FIX SUGGESTIONS:');
  console.log('==================');

  if (report.domIssues.inputs > 0) {
    console.log('1. 🎯 Remove image_url input fields from forms');
    console.log('   - Look for <input name="image_url"> elements');
    console.log('   - Remove the entire form group containing image URL fields');
  }

  if (report.jsIssues.length > 0) {
    console.log('2. 🧹 Clean up JavaScript form state');
    console.log('   - Remove image_url from form data objects');
    console.log('   - Update form submission handlers');
  }

  console.log('3. 🌐 Update API calls');
  console.log('   - Remove image_url from request payloads');
  console.log('   - Update API service functions');

  console.log('4. 🗄️ Update database queries');
  console.log('   - Remove image_url from SELECT statements');
  console.log('   - Update INSERT/UPDATE queries');

  console.log('\n📖 See admin-portal-image-cleanup-guide.md for detailed instructions');
}

// Main diagnostic function
function runDiagnostic() {
  console.log('🚀 Starting Admin Portal Image URL Diagnostic...');

  const report = generateReport();
  provideFixSuggestions(report);

  console.log('\n✅ Diagnostic complete!');
  console.log('💡 Check the console output above for issues and fix suggestions');

  return report;
}

// Auto-run diagnostic when script is loaded
if (typeof window !== 'undefined') {
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runDiagnostic);
  } else {
    runDiagnostic();
  }
}

// Export functions for manual use
window.adminPortalDiagnostic = {
  runDiagnostic,
  checkDOMForImageURL,
  checkJavaScriptForImageURL,
  checkAPICalls,
  checkComponentState,
  generateReport,
  provideFixSuggestions
};

console.log('🔧 Admin Portal Diagnostic loaded. Run adminPortalDiagnostic.runDiagnostic() to start.');
