// API Schema Diagnostic Script
// Run this in the admin portal browser console to identify schema API issues

console.log('🔍 API Schema Diagnostic Starting...');

// Store original fetch to intercept API calls
const originalFetch = window.fetch;
const apiCalls = [];
const schemaResponses = [];

// Override fetch to capture API calls
window.fetch = async function (...args) {
  const url = args[0];
  const options = args[1] || {};

  // Log the API call
  const apiCall = {
    url: url,
    method: options.method || 'GET',
    timestamp: new Date().toISOString(),
    headers: options.headers || {}
  };

  apiCalls.push(apiCall);

  // Check if this might be a schema API call
  const isSchemaCall = url.includes('schema') ||
    url.includes('columns') ||
    url.includes('meta') ||
    url.includes('rest/v1') ||
    url.includes('tables');

  if (isSchemaCall) {
    console.log('🔍 Potential schema API call detected:', url);
  }

  // Make the actual API call
  const response = await originalFetch.apply(this, args);

  // Clone response to inspect it
  const clonedResponse = response.clone();

  try {
    const data = await clonedResponse.json();

    // Check if this is a schema response
    if (data.columns && Array.isArray(data.columns)) {
      console.log('📋 Schema API response found!');
      console.log('URL:', url);
      console.log('Columns:', data.columns.map(col => col.name));

      // Check for image columns
      const imageColumns = data.columns.filter(col =>
        col.name.includes('image') || col.name.includes('img')
      );

      if (imageColumns.length > 0) {
        console.log('🚨 Image columns found in schema:', imageColumns.map(col => col.name));
        schemaResponses.push({
          url: url,
          columns: data.columns,
          imageColumns: imageColumns
        });
      }
    }

    // Check for other schema patterns
    if (data.fields && Array.isArray(data.fields)) {
      console.log('📋 Alternative schema response found (fields):', url);
      const imageFields = data.fields.filter(field =>
        field.name && (field.name.includes('image') || field.name.includes('img'))
      );

      if (imageFields.length > 0) {
        console.log('🚨 Image fields found:', imageFields.map(field => field.name));
      }
    }

  } catch (e) {
    // Not JSON, ignore
  }

  return response;
};

// Function to analyze captured API calls
function analyzeAPICalls() {
  console.log('\n📊 API Call Analysis:');
  console.log('====================');

  // Group by domain
  const domains = {};
  apiCalls.forEach(call => {
    const domain = new URL(call.url).hostname;
    if (!domains[domain]) {
      domains[domain] = [];
    }
    domains[domain].push(call);
  });

  Object.keys(domains).forEach(domain => {
    console.log(`\n🌐 Domain: ${domain}`);
    domains[domain].forEach(call => {
      console.log(`  ${call.method} ${call.url}`);
    });
  });

  // Show schema responses
  if (schemaResponses.length > 0) {
    console.log('\n📋 Schema Responses with Image Columns:');
    console.log('=====================================');
    schemaResponses.forEach((response, index) => {
      console.log(`\n${index + 1}. URL: ${response.url}`);
      console.log('   Image columns:', response.imageColumns.map(col => col.name));
    });
  }
}

// Function to provide fix suggestions
function provideFixSuggestions() {
  console.log('\n🔧 Fix Suggestions:');
  console.log('==================');

  if (schemaResponses.length > 0) {
    console.log('1. 🎯 Database Schema Issue:');
    console.log('   - The API is still returning image columns from the database');
    console.log('   - Run the schema refresh SQL in Supabase');

    console.log('\n2. 🌐 API Caching Issue:');
    console.log('   - The API might be caching the old schema');
    console.log('   - Clear API cache or restart the API service');

    console.log('\n3. 🖥️ Application Cache:');
    console.log('   - The admin portal might be caching the API response');
    console.log('   - Clear browser cache and refresh');

    console.log('\n4. 🔧 Immediate Fix:');
    console.log('   - Use the API interceptor script to filter image columns');
  } else {
    console.log('✅ No schema API calls with image columns detected');
    console.log('💡 The issue might be in cached data or a different API pattern');
  }
}

// Function to apply immediate fix
function applyImmediateFix() {
  console.log('\n🚀 Applying Immediate API Fix...');

  // Override fetch to filter image columns
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);
    const clonedResponse = response.clone();

    try {
      const data = await clonedResponse.json();

      // Check if this is a schema response with image columns
      if (data.columns && Array.isArray(data.columns)) {
        const imageColumns = data.columns.filter(col =>
          col.name.includes('image') || col.name.includes('img')
        );

        if (imageColumns.length > 0) {
          console.log('🔧 Filtering image columns from API response...');

          // Filter out image columns
          const filteredColumns = data.columns.filter(col =>
            !col.name.includes('image') && !col.name.includes('img')
          );

          // Create new response
          const newData = { ...data, columns: filteredColumns };
          const newResponse = new Response(JSON.stringify(newData), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });

          console.log(`✅ Filtered ${imageColumns.length} image columns`);
          return newResponse;
        }
      }
    } catch (e) {
      // Not JSON, return original
    }

    return response;
  };

  console.log('✅ API interceptor applied - image columns will be filtered');
}

// Function to generate report
function generateReport() {
  console.log('\n📋 DIAGNOSTIC REPORT:');
  console.log('====================');
  console.log('Total API calls captured:', apiCalls.length);
  console.log('Schema responses with image columns:', schemaResponses.length);
  console.log('Current URL:', window.location.href);
  console.log('Timestamp:', new Date().toISOString());

  // Save report to localStorage
  const report = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    apiCalls: apiCalls,
    schemaResponses: schemaResponses
  };

  localStorage.setItem('apiSchemaDiagnosticReport', JSON.stringify(report));
  console.log('💾 Report saved to localStorage as "apiSchemaDiagnosticReport"');

  return report;
}

// Main diagnostic function
function runDiagnostic() {
  console.log('🚀 Starting API Schema Diagnostic...');
  console.log('📡 Monitoring API calls for schema responses...');
  console.log('💡 Open the edit form to capture API calls');
  console.log('⏱️  Waiting for API calls...');

  // Set up periodic analysis
  let analysisCount = 0;
  const analysisInterval = setInterval(() => {
    analysisCount++;
    console.log(`\n📊 Analysis #${analysisCount} (${apiCalls.length} API calls captured)`);

    if (apiCalls.length > 0) {
      analyzeAPICalls();
      provideFixSuggestions();
    }

    if (analysisCount >= 10) {
      clearInterval(analysisInterval);
      console.log('\n✅ Diagnostic monitoring complete');
      generateReport();
    }
  }, 5000); // Analyze every 5 seconds

  return {
    apiCalls,
    schemaResponses,
    analyzeAPICalls,
    provideFixSuggestions,
    applyImmediateFix,
    generateReport
  };
}

// Export functions for manual use
window.apiSchemaDiagnostic = {
  runDiagnostic,
  analyzeAPICalls,
  provideFixSuggestions,
  applyImmediateFix,
  generateReport,
  apiCalls,
  schemaResponses
};

// Auto-start diagnostic
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runDiagnostic);
  } else {
    runDiagnostic();
  }
}

console.log('🔧 API Schema Diagnostic loaded. Run apiSchemaDiagnostic.runDiagnostic() to start.');
