package com.tagyou.festivaltracker.data

// User Profile - matches your existing user_profiles table
data class UserProfile(
    val id: String, // UUID from auth.users
    val email: String,
    val full_name: String? = null,
    val role: String = "user",
    val is_admin: Boolean = false,
    val created_at: String? = null,
    val updated_at: String? = null
)

// Food Stall - matches your existing food_stalls table
data class FoodStall(
    val id: Long? = null, // BIGSERIAL
    val name: String,
    val category: String,
    val location: String,
    val coordinates: Map<String, Any>, // JSONB with lat/lng
    val phone: String? = null,
    val email: String? = null,
    val hours: String? = null,
    val rating: Double? = 0.0,
    val description: String? = null,
    val status: String = "active",
    val image: String? = null,
    val created_at: String? = null,
    val updated_at: String? = null
)

// Float Truck - matches your existing float_trucks table
data class FloatTruck(
    val id: Long? = null, // BIGSERIAL
    val name: String,
    val category: String,
    val current_location: String,
    val coordinates: Map<String, Any>, // JSONB with lat/lng
    val phone: String? = null,
    val email: String? = null,
    val schedule: String? = null,
    val tracking_method: String = "gps",
    val gps_tracker_id: String? = null,
    val driver_phone: String? = null,
    val last_update: String? = null,
    val is_live: Boolean = true,
    val estimated_speed: Int = 0,
    val next_stop: String? = null,
    val estimated_arrival: String? = null,
    val rating: Double? = 0.0,
    val description: String? = null,
    val status: String = "active",
    val image: String? = null,
    val created_at: String? = null,
    val updated_at: String? = null
)

// Group - matches your existing groups table
data class Group(
    val id: Long? = null, // BIGSERIAL
    val name: String,
    val type: String,
    val member_count: Int = 0,
    val description: String? = null,
    val admin: String,
    val email: String,
    val status: String = "active",
    val created_at: String? = null,
    val updated_at: String? = null
)

// Friend - matches your existing friends table
data class Friend(
    val id: Long? = null, // BIGSERIAL
    val name: String,
    val username: String,
    val email: String,
    val phone: String? = null,
    val location: String? = null,
    val join_date: String? = null,
    val status: String = "active",
    val created_at: String? = null,
    val updated_at: String? = null
)

// Location coordinates helper
data class Coordinates(
    val lat: Double,
    val lng: Double
)
