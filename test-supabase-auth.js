// Test Supabase Authentication
// This script tests the Supabase authentication functionality

async function testSupabaseAuth() {
  console.log('🔐 Testing Supabase Authentication...');
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

        // Test 3: Check auth service
        console.log('\n📋 Test 3: Authentication Service');
        try {
          const { supabaseAuthService } = await import('./supabase-auth-service.js');

          console.log('✅ Auth service loaded');
          console.log('Auth service methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(supabaseAuthService)));

          // Test 4: Check current session
          console.log('\n📋 Test 4: Current Session');
          try {
            const { supabase } = await import('./supabase-config.js');
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
              console.error('❌ Error getting session:', error.message);
            } else if (session) {
              console.log('✅ User session found');
              console.log('User email:', session.user.email);
              console.log('User ID:', session.user.id);
            } else {
              console.log('ℹ️ No active session found (user not signed in)');
            }

          } catch (error) {
            console.error('❌ Session check failed:', error.message);
          }

          // Test 5: Test auth state listener
          console.log('\n📋 Test 5: Auth State Listener');
          try {
            const { supabase } = await import('./supabase-config.js');

            const { data: { subscription } } = supabase.auth.onAuthStateChange(
              (event, session) => {
                console.log('🔐 Auth state changed:', event);
                if (session) {
                  console.log('User:', session.user.email);
                } else {
                  console.log('No user');
                }
              }
            );

            console.log('✅ Auth state listener set up');
            console.log('Subscription:', subscription);

          } catch (error) {
            console.error('❌ Auth state listener failed:', error.message);
          }

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
    console.error('❌ Supabase auth test failed:', error);
  }

  console.log('\n🎯 Supabase auth test completed!');
  console.log('=====================================');
}

// Test functions for manual testing
async function testSignUp() {
  console.log('🔐 Testing Sign Up...');
  try {
    const { supabaseAuthService } = await import('./supabase-auth-service.js');
    const result = await supabaseAuthService.signUp('test@example.com', 'password123');
    console.log('Sign up result:', result);
  } catch (error) {
    console.error('Sign up error:', error.message);
  }
}

async function testSignIn() {
  console.log('🔐 Testing Sign In...');
  try {
    const { supabaseAuthService } = await import('./supabase-auth-service.js');
    const result = await supabaseAuthService.signIn('test@example.com', 'password123');
    console.log('Sign in result:', result);
  } catch (error) {
    console.error('Sign in error:', error.message);
  }
}

async function testSignOut() {
  console.log('🔐 Testing Sign Out...');
  try {
    const { supabaseAuthService } = await import('./supabase-auth-service.js');
    const result = await supabaseAuthService.signOut();
    console.log('Sign out result:', result);
  } catch (error) {
    console.error('Sign out error:', error.message);
  }
}

// Export for manual use
export default testSupabaseAuth;
export { testSignUp, testSignIn, testSignOut };

// Auto-run disabled - only run when explicitly called
// if (typeof window !== 'undefined') {
//   // Wait a bit for everything to load
//   setTimeout(() => {
//     testSupabaseAuth();
//   }, 1000);
// }
