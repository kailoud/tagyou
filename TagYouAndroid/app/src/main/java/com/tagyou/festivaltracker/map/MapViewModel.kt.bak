package com.tagyou.festivaltracker.map

import android.location.Location
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.text.SimpleDateFormat
import java.util.*

class MapViewModel : ViewModel() {
    
    private val auth = FirebaseAuth.getInstance()
    private val firestore = FirebaseFirestore.getInstance()
    
    private val _currentLocation = MutableLiveData<Location>()
    val currentLocation: LiveData<Location> = _currentLocation
    
    private val _friendsLocations = MutableLiveData<List<FriendLocation>>()
    val friendsLocations: LiveData<List<FriendLocation>> = _friendsLocations
    
    private val _foodStalls = MutableLiveData<List<FoodStall>>()
    val foodStalls: LiveData<List<FoodStall>> = _foodStalls
    
    private val _floatTrucks = MutableLiveData<List<FloatTruck>>()
    val floatTrucks: LiveData<List<FloatTruck>> = _floatTrucks
    
    private val _isTracking = MutableLiveData<Boolean>()
    val isTracking: LiveData<Boolean> = _isTracking
    
    private var friendsLocationListener: ListenerRegistration? = null
    private var foodStallsListener: ListenerRegistration? = null
    private var floatTrucksListener: ListenerRegistration? = null
    
    private val dateFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
    
    init {
        _isTracking.value = false
        loadFoodStalls()
        loadFloatTrucks()
    }
    
    fun updateCurrentLocation(location: Location) {
        _currentLocation.value = location
        _isTracking.value = true
        
        // Update location in Firestore
        updateLocationInFirestore(location)
        
        // Start listening to friends locations
        startListeningToFriends()
    }
    
    private fun updateLocationInFirestore(location: Location) {
        val currentUser = auth.currentUser ?: return
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val locationData = hashMapOf(
                    "userId" to currentUser.uid,
                    "displayName" to (currentUser.displayName ?: "Unknown"),
                    "latitude" to location.latitude,
                    "longitude" to location.longitude,
                    "accuracy" to location.accuracy,
                    "timestamp" to System.currentTimeMillis(),
                    "lastUpdated" to dateFormat.format(Date())
                )
                
                firestore.collection("user_locations")
                    .document(currentUser.uid)
                    .set(locationData)
                    .await()
                
            } catch (e: Exception) {
                // Handle error
                println("Failed to update location: ${e.message}")
            }
        }
    }
    
    private fun startListeningToFriends() {
        val currentUser = auth.currentUser ?: return
        
        // Stop existing listener
        friendsLocationListener?.remove()
        
        // Start new listener
        friendsLocationListener = firestore.collection("user_locations")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    // Handle error
                    return@addSnapshotListener
                }
                
                val friends = mutableListOf<FriendLocation>()
                
                snapshot?.documents?.forEach { document ->
                    val userId = document.getString("userId")
                    val displayName = document.getString("displayName")
                    val latitude = document.getDouble("latitude")
                    val longitude = document.getDouble("longitude")
                    val lastUpdated = document.getString("lastUpdated")
                    
                    // Don't include current user
                    if (userId != currentUser.uid && 
                        userId != null && 
                        displayName != null && 
                        latitude != null && 
                        longitude != null && 
                        lastUpdated != null) {
                        
                        friends.add(
                            FriendLocation(
                                userId = userId,
                                displayName = displayName,
                                latitude = latitude,
                                longitude = longitude,
                                lastUpdated = lastUpdated
                            )
                        )
                    }
                }
                
                _friendsLocations.value = friends
            }
    }
    
    private fun loadFoodStalls() {
        foodStallsListener?.remove()
        
        foodStallsListener = firestore.collection("food_stalls")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    return@addSnapshotListener
                }
                
                val stalls = mutableListOf<FoodStall>()
                
                snapshot?.documents?.forEach { document ->
                    val id = document.id
                    val name = document.getString("name")
                    val description = document.getString("description")
                    val latitude = document.getDouble("latitude")
                    val longitude = document.getDouble("longitude")
                    val imageUrl = document.getString("image_url")
                    val category = document.getString("category")
                    
                    if (name != null && latitude != null && longitude != null) {
                        stalls.add(
                            FoodStall(
                                id = id,
                                name = name,
                                description = description ?: "",
                                latitude = latitude,
                                longitude = longitude,
                                imageUrl = imageUrl ?: "",
                                category = category ?: ""
                            )
                        )
                    }
                }
                
                _foodStalls.value = stalls
            }
    }
    
    private fun loadFloatTrucks() {
        floatTrucksListener?.remove()
        
        floatTrucksListener = firestore.collection("float_trucks")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    return@addSnapshotListener
                }
                
                val trucks = mutableListOf<FloatTruck>()
                
                snapshot?.documents?.forEach { document ->
                    val id = document.id
                    val name = document.getString("name")
                    val description = document.getString("description")
                    val latitude = document.getDouble("latitude")
                    val longitude = document.getDouble("longitude")
                    val imageUrl = document.getString("image_url")
                    val route = document.getString("route")
                    
                    if (name != null && latitude != null && longitude != null) {
                        trucks.add(
                            FloatTruck(
                                id = id,
                                name = name,
                                description = description ?: "",
                                latitude = latitude,
                                longitude = longitude,
                                imageUrl = imageUrl ?: "",
                                route = route ?: ""
                            )
                        )
                    }
                }
                
                _floatTrucks.value = trucks
            }
    }
    
    fun stopTracking() {
        _isTracking.value = false
        friendsLocationListener?.remove()
        foodStallsListener?.remove()
        floatTrucksListener?.remove()
    }
    
    override fun onCleared() {
        super.onCleared()
        friendsLocationListener?.remove()
        foodStallsListener?.remove()
        floatTrucksListener?.remove()
    }
}

data class FoodStall(
    val id: String,
    val name: String,
    val description: String,
    val latitude: Double,
    val longitude: Double,
    val imageUrl: String,
    val category: String
)

data class FloatTruck(
    val id: String,
    val name: String,
    val description: String,
    val latitude: Double,
    val longitude: Double,
    val imageUrl: String,
    val route: String
)

