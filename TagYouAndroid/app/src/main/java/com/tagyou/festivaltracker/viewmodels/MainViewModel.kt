package com.tagyou.festivaltracker.viewmodels

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

class MainViewModel : ViewModel() {
    
    private val auth = FirebaseAuth.getInstance()
    private val firestore = FirebaseFirestore.getInstance()
    
    private val _currentUser = MutableLiveData<FirebaseUser>()
    val currentUser: LiveData<FirebaseUser> = _currentUser
    
    private val _userProfile = MutableLiveData<UserProfile>()
    val userProfile: LiveData<UserProfile> = _userProfile
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    fun setCurrentUser(user: FirebaseUser) {
        _currentUser.value = user
        loadUserProfile(user.uid)
    }
    
    fun refreshUserData() {
        _currentUser.value?.let { user ->
            loadUserProfile(user.uid)
        }
    }
    
    private fun loadUserProfile(userId: String) {
        _isLoading.value = true
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val document = firestore.collection("user_profiles")
                    .document(userId)
                    .get()
                    .await()
                
                if (document.exists()) {
                    val profile = document.toObject(UserProfile::class.java)
                    _userProfile.postValue(profile)
                } else {
                    // Create default profile if doesn't exist
                    val defaultProfile = UserProfile(
                        userId = userId,
                        email = _currentUser.value?.email ?: "",
                        displayName = _currentUser.value?.displayName ?: "",
                        avatarUrl = _currentUser.value?.photoUrl?.toString() ?: "",
                        isProUser = false,
                        createdAt = System.currentTimeMillis()
                    )
                    _userProfile.postValue(defaultProfile)
                    
                    // Save to Firestore
                    firestore.collection("user_profiles")
                        .document(userId)
                        .set(defaultProfile)
                        .await()
                }
            } catch (e: Exception) {
                // Handle error
            } finally {
                _isLoading.postValue(false)
            }
        }
    }
    
    fun updateUserProfile(profile: UserProfile) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                firestore.collection("user_profiles")
                    .document(profile.userId)
                    .set(profile)
                    .await()
                
                _userProfile.postValue(profile)
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}

data class UserProfile(
    val userId: String = "",
    val email: String = "",
    val displayName: String = "",
    val avatarUrl: String = "",
    val isProUser: Boolean = false,
    val createdAt: Long = 0,
    val lastActive: Long = System.currentTimeMillis()
)
