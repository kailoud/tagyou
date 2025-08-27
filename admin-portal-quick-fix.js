// Admin Portal Quick Fix Script
// Run this immediately in the admin portal browser console to hide the image_url field

console.log('🔧 Admin Portal Quick Fix Starting...');

// Function to hide image_url fields
function hideImageURLFields() {
  console.log('🎯 Hiding image_url fields...');

  // Hide input fields
  const imageInputs = document.querySelectorAll('input[name="image_url"], input[name*="image"], input[placeholder*="image"]');
  imageInputs.forEach(input => {
    const container = input.closest('.form-group, .field-group, .input-group, .form-field, .field');
    if (container) {
      container.style.display = 'none';
      console.log('✅ Hidden input field:', input.name || input.placeholder);
    }
  });

  // Hide labels
  const imageLabels = document.querySelectorAll('label[for*="image"], label:contains("Image URL"), label:contains("Quick Setup")');
  imageLabels.forEach(label => {
    const container = label.closest('.form-group, .field-group, .input-group, .form-field, .field');
    if (container) {
      container.style.display = 'none';
      console.log('✅ Hidden label:', label.textContent);
    }
  });

  // Hide any divs containing image URL text
  const imageDivs = document.querySelectorAll('div:contains("Image URL"), div:contains("Quick Setup")');
  imageDivs.forEach(div => {
    if (div.textContent.includes('Image URL') || div.textContent.includes('Quick Setup')) {
      div.style.display = 'none';
      console.log('✅ Hidden div with image URL text');
    }
  });

  return imageInputs.length + imageLabels.length + imageDivs.length;
}

// Function to clear cache
function clearCache() {
  console.log('🧹 Clearing cache...');

  // Clear localStorage
  localStorage.clear();
  console.log('✅ localStorage cleared');

  // Clear sessionStorage
  sessionStorage.clear();
  console.log('✅ sessionStorage cleared');

  // Clear any cached data in memory
  if (window.app && window.app.clearCache) {
    window.app.clearCache();
    console.log('✅ App cache cleared');
  }

  // Clear any API cache
  if (window.api && window.api.clearCache) {
    window.api.clearCache();
    console.log('✅ API cache cleared');
  }
}

// Function to force schema refresh
function forceSchemaRefresh() {
  console.log('🔄 Attempting schema refresh...');

  // Try common schema refresh functions
  const refreshFunctions = [
    'refreshSchema',
    'reloadSchema',
    'updateSchema',
    'clearSchemaCache'
  ];

  refreshFunctions.forEach(funcName => {
    if (window[funcName] && typeof window[funcName] === 'function') {
      try {
        window[funcName]();
        console.log(`✅ Called ${funcName}()`);
      } catch (e) {
        console.log(`❌ Error calling ${funcName}():`, e.message);
      }
    }
  });

  // Try admin API refresh
  if (window.adminAPI && window.adminAPI.refreshSchema) {
    try {
      window.adminAPI.refreshSchema();
      console.log('✅ Called adminAPI.refreshSchema()');
    } catch (e) {
      console.log('❌ Error calling adminAPI.refreshSchema():', e.message);
    }
  }
}

// Function to remove image_url from form data
function cleanFormData() {
  console.log('🧹 Cleaning form data...');

  // Remove image_url from any form data objects
  const formElements = document.querySelectorAll('form');
  formElements.forEach(form => {
    const imageInputs = form.querySelectorAll('input[name="image_url"]');
    imageInputs.forEach(input => {
      input.remove();
      console.log('✅ Removed image_url input from form');
    });
  });

  // Clean any JavaScript form objects
  if (window.formData && window.formData.image_url) {
    delete window.formData.image_url;
    console.log('✅ Removed image_url from window.formData');
  }

  // Clean any React/Vue component state (if accessible)
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('💡 React detected - check component state for image_url');
  }

  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('💡 Vue detected - check component state for image_url');
  }
}

// Main fix function
function applyQuickFix() {
  console.log('🚀 Applying Admin Portal Quick Fix...');

  const hiddenCount = hideImageURLFields();
  clearCache();
  forceSchemaRefresh();
  cleanFormData();

  console.log(`\n✅ Quick Fix Applied!`);
  console.log(`📊 Hidden ${hiddenCount} image-related elements`);
  console.log(`💡 Refresh the page to see changes`);
  console.log(`🔧 For permanent fix, update the admin portal code`);

  return {
    hiddenElements: hiddenCount,
    cacheCleared: true,
    schemaRefreshed: true
  };
}

// Auto-apply fix when script loads
if (typeof window !== 'undefined') {
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyQuickFix);
  } else {
    applyQuickFix();
  }
}

// Export functions for manual use
window.adminPortalQuickFix = {
  applyQuickFix,
  hideImageURLFields,
  clearCache,
  forceSchemaRefresh,
  cleanFormData
};

console.log('🔧 Quick Fix loaded. Run adminPortalQuickFix.applyQuickFix() to apply.');
