// Centralized Supabase Configuration
// This ensures only one GoTrueClient instance is created

let supabaseClient = null;
let isInitializing = false;

// Initialize Supabase client once
async function initializeSupabase() {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (isInitializing) {
    // Wait for initialization to complete
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return supabaseClient;
  }

  isInitializing = true;

  try {
    if (!window.supabase || !window.supabaseConfig) {
      throw new Error('Supabase SDK or config not available');
    }

    // Create single client instance
    supabaseClient = window.supabase.createClient(
      window.supabaseConfig.supabaseUrl,
      window.supabaseConfig.supabaseAnonKey
    );

    // Set as global for backward compatibility
    window.supabaseClient = supabaseClient;

    console.log('✅ Single Supabase client initialized');
    return supabaseClient;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
    throw error;
  } finally {
    isInitializing = false;
  }
}

// Get the shared Supabase client
function getSupabaseClient() {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call initializeSupabase() first.');
  }
  return supabaseClient;
}

// Export for use in other modules
window.initializeSupabase = initializeSupabase;
window.getSupabaseClient = getSupabaseClient;

// Auto-initialize when this script loads
document.addEventListener('DOMContentLoaded', () => {
  initializeSupabase().catch(error => {
    console.warn('Supabase initialization failed:', error);
  });
});
