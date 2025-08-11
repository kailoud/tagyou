package com.tagyou.festivaltracker.data

// Placeholder SupabaseClient for now
// TODO: Integrate with actual Supabase Kotlin SDK when API is stable
object SupabaseClient {
    
    // Your actual Supabase credentials from the web app
    const val SUPABASE_URL = "https://ttgsohnskgujbfvopzzi.supabase.co"
    const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0Z3NvaG5za2d1amJmdm9wenppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NzY1ODksImV4cCI6MjA3MDM1MjU4OX0.dTb_VNMSCBUtu78QRnqVwkOgI9UptuIp7Fu1PTHTyYc"
    
    // Placeholder objects - will be replaced with actual Supabase SDK
    object auth {
        fun currentUserOrNull(): Any? = null
        suspend fun signOut() {}
    }
    
    object database {
        fun get(table: String): Any = Any()
    }
    
    object client {
        // Placeholder
    }
}
