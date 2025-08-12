package com.tagyou.festivaltracker.data

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.tasks.await

object FirebaseClient {
    
    // Firebase instances
    val auth: FirebaseAuth = FirebaseAuth.getInstance()
    val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
    val storage: FirebaseStorage = FirebaseStorage.getInstance()
    val messaging: FirebaseMessaging = FirebaseMessaging.getInstance()
    
    // Collections
    object Collections {
        const val USER_PROFILES = "user_profiles"
        const val USER_LOCATIONS = "user_locations"
        const val GROUPS = "groups"
        const val FOOD_STALLS = "food_stalls"
        const val FLOAT_TRUCKS = "float_trucks"
        const val GROUP_MEMBERS = "group_members"
    }
    
    // Authentication helpers
    object Auth {
        fun getCurrentUser() = auth.currentUser
        
        fun isUserLoggedIn() = auth.currentUser != null
        
        suspend fun signOut() {
            auth.signOut()
        }
        
        fun getUserId(): String? = auth.currentUser?.uid
    }
    
    // Database helpers
    object Database {
        fun getUserProfiles() = firestore.collection(Collections.USER_PROFILES)
        
        fun getUserLocations() = firestore.collection(Collections.USER_LOCATIONS)
        
        fun getGroups() = firestore.collection(Collections.GROUPS)
        
        fun getFoodStalls() = firestore.collection(Collections.FOOD_STALLS)
        
        fun getFloatTrucks() = firestore.collection(Collections.FLOAT_TRUCKS)
        
        fun getGroupMembers() = firestore.collection(Collections.GROUP_MEMBERS)
        
        // Helper to get user's location document
        fun getUserLocationDoc(userId: String) = 
            firestore.collection(Collections.USER_LOCATIONS).document(userId)
        
        // Helper to get user's profile document
        fun getUserProfileDoc(userId: String) = 
            firestore.collection(Collections.USER_PROFILES).document(userId)
    }
    
    // Storage helpers
    object Storage {
        fun getProfileImagesRef() = storage.reference.child("profile_images")
        
        fun getGroupImagesRef() = storage.reference.child("group_images")
    }
    
    // Messaging helpers
    object Messaging {
        suspend fun getToken(): String? {
            return try {
                messaging.token.await()
            } catch (e: Exception) {
                null
            }
        }
    }
}
