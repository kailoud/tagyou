// Supabase Configuration Template
// Copy this file to supabase-config-secret.js and add your actual Supabase credentials

const supabaseConfig = {
  supabaseUrl: "https://your-project-id.supabase.co",
  supabaseAnonKey: "your-anon-key-here",
  supabaseServiceKey: "your-service-role-key-here" // For admin operations (bypasses RLS)
};

export default supabaseConfig;
