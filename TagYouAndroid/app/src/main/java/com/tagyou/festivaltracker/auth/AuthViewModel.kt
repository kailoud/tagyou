package com.tagyou.festivaltracker.auth

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

class AuthViewModel : ViewModel() {
    
    private val auth = FirebaseAuth.getInstance()
    private val firestore = FirebaseFirestore.getInstance()
    
    private val _authState = MutableLiveData<AuthState>()
    val authState: LiveData<AuthState> = _authState
    
    fun signIn(email: String, password: String) {
        _authState.value = AuthState.Loading
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val result = auth.signInWithEmailAndPassword(email, password).await()
                result.user?.let { user ->
                    updateUserLastActive(user.uid)
                    _authState.postValue(AuthState.Success(user))
                } ?: run {
                    _authState.postValue(AuthState.Error("Sign in failed"))
                }
            } catch (e: Exception) {
                _authState.postValue(AuthState.Error(e.message ?: "Sign in failed"))
            }
        }
    }
    
    fun register(email: String, password: String, displayName: String) {
        _authState.value = AuthState.Loading
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val result = auth.createUserWithEmailAndPassword(email, password).await()
                result.user?.let { user ->
                    // Update display name
                    val profileUpdates = com.google.firebase.auth.UserProfileChangeRequest.Builder()
                        .setDisplayName(displayName)
                        .build()
                    user.updateProfile(profileUpdates).await()
                    
                    // Create user profile in Firestore
                    createUserProfile(user.uid, email, displayName)
                    
                    _authState.postValue(AuthState.Success(user))
                } ?: run {
                    _authState.postValue(AuthState.Error("Registration failed"))
                }
            } catch (e: Exception) {
                _authState.postValue(AuthState.Error(e.message ?: "Registration failed"))
            }
        }
    }
    
    fun signInWithGoogle(credential: com.google.firebase.auth.AuthCredential) {
        _authState.value = AuthState.Loading
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val result = auth.signInWithCredential(credential).await()
                result.user?.let { user ->
                    // Check if user profile exists, if not create one
                    val userDoc = firestore.collection("user_profiles")
                        .document(user.uid)
                        .get()
                        .await()
                    
                    if (!userDoc.exists()) {
                        createUserProfile(
                            user.uid,
                            user.email ?: "",
                            user.displayName ?: ""
                        )
                    } else {
                        updateUserLastActive(user.uid)
                    }
                    
                    _authState.postValue(AuthState.Success(user))
                } ?: run {
                    _authState.postValue(AuthState.Error("Google sign in failed"))
                }
            } catch (e: Exception) {
                _authState.postValue(AuthState.Error(e.message ?: "Google sign in failed"))
            }
        }
    }
    
    fun sendPasswordResetEmail(email: String) {
        _authState.value = AuthState.Loading
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                auth.sendPasswordResetEmail(email).await()
                _authState.postValue(AuthState.PasswordResetSent)
            } catch (e: Exception) {
                _authState.postValue(AuthState.Error(e.message ?: "Failed to send reset email"))
            }
        }
    }
    
    private fun createUserProfile(userId: String, email: String, displayName: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val userProfile = UserProfile(
                    userId = userId,
                    email = email,
                    displayName = displayName,
                    avatarUrl = "",
                    isProUser = false,
                    createdAt = System.currentTimeMillis(),
                    lastActive = System.currentTimeMillis()
                )
                
                firestore.collection("user_profiles")
                    .document(userId)
                    .set(userProfile)
                    .await()
            } catch (e: Exception) {
                // Log error but don't fail the auth process
                println("Failed to create user profile: ${e.message}")
            }
        }
    }
    
    private fun updateUserLastActive(userId: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                firestore.collection("user_profiles")
                    .document(userId)
                    .update("lastActive", System.currentTimeMillis())
                    .await()
            } catch (e: Exception) {
                // Log error but don't fail the auth process
                println("Failed to update last active: ${e.message}")
            }
        }
    }
}

sealed class AuthState {
    object Loading : AuthState()
    data class Success(val user: FirebaseUser) : AuthState()
    data class Error(val message: String) : AuthState()
    object PasswordResetSent : AuthState()
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
