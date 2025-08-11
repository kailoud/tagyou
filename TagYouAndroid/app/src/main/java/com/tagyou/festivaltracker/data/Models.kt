package com.tagyou.festivaltracker.data

import kotlinx.serialization.Serializable
import java.util.*

@Serializable
data class User(
    val id: String,
    val email: String,
    val display_name: String? = null,
    val avatar_url: String? = null,
    val is_pro_user: Boolean = false,
    val created_at: String,
    val last_active: String
)

@Serializable
data class UserLocation(
    val user_id: String,
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float? = null,
    val timestamp: String,
    val display_name: String? = null
)

@Serializable
data class FoodStall(
    val id: String,
    val name: String,
    val description: String? = null,
    val latitude: Double,
    val longitude: Double,
    val image_url: String? = null,
    val category: String? = null
)

@Serializable
data class FloatTruck(
    val id: String,
    val name: String,
    val description: String? = null,
    val latitude: Double,
    val longitude: Double,
    val image_url: String? = null,
    val route: String? = null
)

@Serializable
data class UserGroup(
    val id: String,
    val name: String,
    val created_by: String,
    val created_at: String,
    val members: List<String> = emptyList()
)
