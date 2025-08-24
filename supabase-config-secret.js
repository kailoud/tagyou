// Supabase Configuration
// Your actual Supabase credentials

const supabaseConfig = {
  supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "https://rpsbibwmbsllnvfithjw.supabase.co",
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwc2JpYndtYnNsbG52Zml0aGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzA5NjQsImV4cCI6MjA3MTYwNjk2NH0.MdZz53RGQUIuCORdUtnFT-Uo0rFEK1a6chnMtS4Jjss"
};

export default supabaseConfig;
