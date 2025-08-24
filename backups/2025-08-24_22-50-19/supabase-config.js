// Supabase Configuration
// Using CDN imports for better compatibility with live server

// Supabase Configuration
let supabaseConfig = null;
let supabase = null;

// Load Supabase configuration securely
async function loadSupabaseConfig() {
  try {
    // Try to load from secret configuration file (for development)
    const secretConfig = await import('./supabase-config-secret.js');
    supabaseConfig = secretConfig.default;
    console.log('✅ Supabase configuration loaded from secret file');
    return true;
  } catch (error) {
    console.warn('⚠️ Supabase configuration not found. Please create supabase-config-secret.js with your credentials.');
    console.warn('Copy supabase-config-secret.template.js to supabase-config-secret.js and add your actual Supabase config.');
    supabaseConfig = null;
    return false;
  }
}

// Initialize Supabase only if config is available
async function initializeSupabase() {
  console.log('🚀 Starting Supabase initialization...');

  // Wait for Supabase to be available
  let attempts = 0;
  const maxAttempts = 30;

  while (attempts < maxAttempts) {
    if (typeof window !== 'undefined' && window.supabase) {
      console.log('✅ Supabase SDK available, proceeding with initialization...');
      break;
    }
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (attempts >= maxAttempts) {
    throw new Error('Supabase SDK not available after 30 seconds');
  }

  const configLoaded = await loadSupabaseConfig();

  if (configLoaded && supabaseConfig) {
    try {
      // Use the global supabase object directly
      supabase = window.supabase.createClient(
        supabaseConfig.supabaseUrl,
        supabaseConfig.supabaseAnonKey
      );

      console.log('✅ Supabase initialized successfully');
      console.log('🌐 Project URL:', supabaseConfig.supabaseUrl);
      return true;
    } catch (error) {
      console.error('❌ Supabase initialization error:', error);
      throw error;
    }
  } else {
    console.warn('⚠️ Supabase not initialized - no configuration found');
    return false;
  }
}

// Export Supabase client (will be null if not initialized)
export { supabase, initializeSupabase };
