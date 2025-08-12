package com.tagyou.festivaltracker.map

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.tagyou.festivaltracker.data.FirebaseClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

// Simple data class for user locations
data class UserLocation(
    val user_id: String,
    val latitude: Double,
    val longitude: Double,
    val timestamp: Long,
    val accuracy: Double
)

// Simple data class for food stalls
data class FoodStall(
    val id: String,
    val name: String,
    val latitude: Double,
    val longitude: Double,
    val description: String = ""
)

// Simple data class for float trucks
data class FloatTruck(
    val id: String,
    val name: String,
    val latitude: Double,
    val longitude: Double,
    val description: String = ""
)

// Simple data class for groups
data class Group(
    val id: String,
    val name: String,
    val description: String = ""
)

class MapViewModel : ViewModel() {
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val _errorMessage = MutableLiveData<String?>()
    val errorMessage: LiveData<String?> = _errorMessage
    
    private val _friends = MutableLiveData<List<UserLocation>>()
    val friends: LiveData<List<UserLocation>> = _friends
    
    private val _foodStalls = MutableLiveData<List<FoodStall>>()
    val foodStalls: LiveData<List<FoodStall>> = _foodStalls
    
    private val _floatTrucks = MutableLiveData<List<FloatTruck>>()
    val floatTrucks: LiveData<List<FloatTruck>> = _floatTrucks
    
    private val _groups = MutableLiveData<List<Group>>()
    val groups: LiveData<List<Group>> = _groups
    
    fun loadFriends() {
        _isLoading.value = true
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val currentUserId = FirebaseAuth.getInstance().currentUser?.uid
                if (currentUserId == null) {
                    _errorMessage.postValue("User not authenticated")
                    return@launch
                }
                
                val snapshot = FirebaseClient.Database.getUserLocations()
                    .whereNotEqualTo("user_id", currentUserId)
                    .get()
                    .await()
                
                val friendsList = snapshot.documents.mapNotNull { doc ->
                    try {
                        UserLocation(
                            user_id = doc.getString("user_id") ?: return@mapNotNull null,
                            latitude = doc.getDouble("latitude") ?: return@mapNotNull null,
                            longitude = doc.getDouble("longitude") ?: return@mapNotNull null,
                            timestamp = doc.getLong("timestamp") ?: 0L,
                            accuracy = doc.getDouble("accuracy") ?: 0.0
                        )
                    } catch (e: Exception) {
                        null
                    }
                }
                
                _friends.postValue(friendsList)
                
            } catch (e: Exception) {
                _errorMessage.postValue("Error loading friends: ${e.message}")
            } finally {
                _isLoading.postValue(false)
            }
        }
    }
    
    fun loadFoodStalls() {
        _isLoading.value = true
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val snapshot = FirebaseClient.Database.getFoodStalls()
                    .get()
                    .await()
                
                val stallsList = snapshot.documents.mapNotNull { doc ->
                    try {
                        val coordinates = doc.get("coordinates") as? Map<String, Any>
                        val lat = coordinates?.get("lat") as? Double ?: 0.0
                        val lng = coordinates?.get("lng") as? Double ?: 0.0
                        
                        FoodStall(
                            id = doc.id,
                            name = doc.getString("name") ?: "",
                            latitude = lat,
                            longitude = lng,
                            description = doc.getString("description") ?: ""
                        )
                    } catch (e: Exception) {
                        null
                    }
                }
                
                _foodStalls.postValue(stallsList)
                
            } catch (e: Exception) {
                _errorMessage.postValue("Error loading food stalls: ${e.message}")
            } finally {
                _isLoading.postValue(false)
            }
        }
    }
    
    fun loadFloatTrucks() {
        _isLoading.value = true
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val snapshot = FirebaseClient.Database.getFloatTrucks()
                    .get()
                    .await()
                
                val trucksList = snapshot.documents.mapNotNull { doc ->
                    try {
                        val coordinates = doc.get("coordinates") as? Map<String, Any>
                        val lat = coordinates?.get("lat") as? Double ?: 0.0
                        val lng = coordinates?.get("lng") as? Double ?: 0.0
                        
                        FloatTruck(
                            id = doc.id,
                            name = doc.getString("name") ?: "",
                            latitude = lat,
                            longitude = lng,
                            description = doc.getString("description") ?: ""
                        )
                    } catch (e: Exception) {
                        null
                    }
                }
                
                _floatTrucks.postValue(trucksList)
                
            } catch (e: Exception) {
                _errorMessage.postValue("Error loading float trucks: ${e.message}")
            } finally {
                _isLoading.postValue(false)
            }
        }
    }
    
    fun loadGroups() {
        _isLoading.value = true
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val currentUserId = FirebaseAuth.getInstance().currentUser?.uid
                if (currentUserId == null) {
                    _errorMessage.postValue("User not authenticated")
                    return@launch
                }
                
                // Get groups where user is a member
                val groupMembersSnapshot = FirebaseClient.Database.getGroupMembers()
                    .whereEqualTo("user_id", currentUserId)
                    .get()
                    .await()
                
                val groupIds = groupMembersSnapshot.documents.map { it.getString("group_id") ?: "" }
                
                if (groupIds.isNotEmpty()) {
                    val groupsSnapshot = FirebaseClient.Database.getGroups()
                        .whereIn("id", groupIds)
                        .get()
                        .await()
                    
                    val groupsList = groupsSnapshot.documents.mapNotNull { doc ->
                        try {
                            Group(
                                id = doc.id,
                                name = doc.getString("name") ?: "",
                                description = doc.getString("description") ?: ""
                            )
                        } catch (e: Exception) {
                            null
                        }
                    }
                    
                    _groups.postValue(groupsList)
                } else {
                    _groups.postValue(emptyList())
                }
                
            } catch (e: Exception) {
                _errorMessage.postValue("Error loading groups: ${e.message}")
            } finally {
                _isLoading.postValue(false)
            }
        }
    }
    
    fun clearError() {
        _errorMessage.value = null
    }
}
