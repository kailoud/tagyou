package com.tagyou.festivaltracker.data

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.GoTrue
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.storage.Storage

object SupabaseClient {
    
    // Replace these with your actual Supabase credentials
    private const val SUPABASE_URL = "YOUR_SUPABASE_URL"
    private const val SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY"
    
    val client = createSupabaseClient(
        supabaseUrl = SUPABASE_URL,
        supabaseKey = SUPABASE_ANON_KEY
    ) {
        install(GoTrue) {
            // Configure authentication
        }
        install(Postgrest) {
            // Configure database
        }
        install(Realtime) {
            // Configure real-time subscriptions
        }
        install(Storage) {
            // Configure file storage
        }
    }
    
    val auth = client.gotrue
    val database = client.postgrest
    val realtime = client.realtime
    val storage = client.storage
}
