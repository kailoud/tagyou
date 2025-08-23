// Supabase Diagnostic Tool
// This script tests the Supabase connection and configuration

async function runSupabaseDiagnostic() {
  console.log('🔍 Starting Supabase Diagnostic...');
  console.log('=====================================');

  try {
    // Test 1: Check if Supabase SDK is loaded
    console.log('\n📋 Test 1: Supabase SDK Availability');
    console.log('Supabase object exists:', typeof window.supabase !== 'undefined');

    if (typeof window.supabase === 'undefined') {
      console.error('❌ Supabase SDK not loaded');
      return;
    }

    console.log('✅ Supabase SDK loaded');

    // Test 2: Check Supabase configuration
    console.log('\n📋 Test 2: Supabase Configuration');
    try {
      const supabaseModule = await import('./supabase-config.js');
      const { initializeSupabase } = supabaseModule;

      console.log('✅ Supabase config module loaded');

      // Test initialization
      const success = await initializeSupabase();
      console.log('Supabase initialization result:', success);

      if (success) {
        console.log('✅ Supabase initialized successfully');

        // Test 3: Check project configuration
        console.log('\n📋 Test 3: Project Configuration');
        try {
          const secretConfig = await import('./supabase-config-secret.js');
          const config = secretConfig.default;

          console.log('✅ Secret config loaded');
          console.log('Project URL:', config.supabaseUrl);
          console.log('Anon Key length:', config.supabaseAnonKey.length);

          // Verify the project URL matches what we expect
          if (config.supabaseUrl === 'https://ttgsohnskgujbfvopzzi.supabase.co') {
            console.log('✅ Project URL matches expected value');
          } else {
            console.warn('⚠️ Project URL does not match expected value');
          }

        } catch (error) {
          console.error('❌ Secret config failed:', error.message);
        }

        // Test 4: Test database connection
        console.log('\n📋 Test 4: Database Connection');
        try {
          const { supabase } = await import('./supabase-config.js');

          // Try a simple query to test connection
          const { data, error } = await supabase
            .from('food_stalls')
            .select('count')
            .limit(1);

          if (error) {
            if (error.code === 'PGRST116') {
              console.log('✅ Database connection successful (table may not exist yet)');
            } else {
              console.error('❌ Database connection failed:', error.message);
            }
          } else {
            console.log('✅ Database connection successful');
            console.log('Data returned:', data);
          }

        } catch (error) {
          console.error('❌ Database connection test failed:', error.message);
        }

        // Test 5: Test authentication
        console.log('\n📋 Test 5: Authentication Service');
        try {
          const { supabaseAuthService } = await import('./supabase-auth-service.js');

          console.log('✅ Auth service loaded');
          console.log('Auth service methods available:', Object.getOwnPropertyNames(Object.getPrototypeOf(supabaseAuthService)));

        } catch (error) {
          console.error('❌ Auth service test failed:', error.message);
        }

      } else {
        console.error('❌ Supabase initialization failed');
      }

    } catch (error) {
      console.error('❌ Supabase config test failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Supabase diagnostic failed:', error);
  }

  console.log('\n🎯 Supabase diagnostic completed!');
  console.log('=====================================');
}

// Export for manual use
export default runSupabaseDiagnostic;

// Auto-run if this script is loaded directly
if (typeof window !== 'undefined') {
  // Wait a bit for everything to load
  setTimeout(() => {
    runSupabaseDiagnostic();
  }, 1000);
}
