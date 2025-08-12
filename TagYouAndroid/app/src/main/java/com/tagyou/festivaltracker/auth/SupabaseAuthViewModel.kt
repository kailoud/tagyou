package com.tagyou.festivaltracker.auth

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.FirebaseFirestore
import com.tagyou.festivaltracker.data.FirebaseClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

class FirebaseAuthViewModel : ViewModel() {
    
    private val _authState = MutableLiveData<FirebaseAuthState>()
    val authState: LiveData<FirebaseAuthState> = _authState
    
    private val _currentUser = MutableLiveData<FirebaseUser?>()
    val currentUser: LiveData<FirebaseUser?> = _currentUser
    
    init {
        // Listen for auth state changes
        FirebaseAuth.getInstance().addAuthStateListener { auth ->
            _currentUser.value = auth.currentUser
            if (auth.currentUser != null) {
                _authState.value = FirebaseAuthState.Success
            } else {
                _authState.value = FirebaseAuthState.SignedOut
            }
        }
    }
    
    fun signIn(email: String, password: String) {
        _authState.value = FirebaseAuthState.Loading
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val result = FirebaseAuth.getInstance().signInWithEmailAndPassword(email, password).await()
                if (result.user != null) {
                    _authState.postValue(FirebaseAuthState.Success)
                } else {
                    _authState.postValue(FirebaseAuthState.Error("Sign in failed"))
                }
            } catch (e: Exception) {
                _authState.postValue(FirebaseAuthState.Error(e.message ?: "Sign in failed"))
            }
        }
    }
    
    fun register(email: String, password: String, displayName: String) {
        _authState.value = FirebaseAuthState.Loading
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val result = FirebaseAuth.getInstance().createUserWithEmailAndPassword(email, password).await()
                if (result.user != null) {
                    // Create user profile in Firestore
                    createUserProfile(result.user!!.uid, email, displayName)
                    _authState.postValue(FirebaseAuthState.Success)
                } else {
                    _authState.postValue(FirebaseAuthState.Error("Registration failed"))
                }
            } catch (e: Exception) {
                _authState.postValue(FirebaseAuthState.Error(e.message ?: "Registration failed"))
            }
        }
    }
    
    private suspend fun createUserProfile(userId: String, email: String, displayName: String) {
        try {
            val userProfile = hashMapOf(
                "userId" to userId,
                "email" to email,
                "displayName" to displayName,
                "full_name" to displayName,
                "avatarUrl" to "",
                "isProUser" to false,
                "is_admin" to false,
                "createdAt" to System.currentTimeMillis(),
                "lastActive" to System.currentTimeMillis()
            )
            
            FirebaseFirestore.getInstance()
                .collection("user_profiles")
                .document(userId)
                .set(userProfile)
                .await()
        } catch (e: Exception) {
            // Handle profile creation error
        }
    }
    
    fun signInWithGoogle(idToken: String) {
        _authState.value = FirebaseAuthState.Loading
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val credential = com.google.firebase.auth.GoogleAuthProvider.getCredential(idToken, null)
                val result = FirebaseAuth.getInstance().signInWithCredential(credential).await()
                if (result.user != null) {
                    // Create or update user profile
                    createOrUpdateUserProfile(result.user!!)
                    _authState.postValue(FirebaseAuthState.Success)
                } else {
                    _authState.postValue(FirebaseAuthState.Error("Google sign in failed"))
                }
            } catch (e: Exception) {
                _authState.postValue(FirebaseAuthState.Error(e.message ?: "Google sign in failed"))
            }
        }
    }
    
    private suspend fun createOrUpdateUserProfile(user: FirebaseUser) {
        try {
            val userProfile = hashMapOf(
                "userId" to user.uid,
                "email" to (user.email ?: ""),
                "displayName" to (user.displayName ?: ""),
                "full_name" to (user.displayName ?: ""),
                "avatarUrl" to (user.photoUrl?.toString() ?: ""),
                "isProUser" to false,
                "is_admin" to false,
                "lastActive" to System.currentTimeMillis()
            )
            
            FirebaseFirestore.getInstance()
                .collection("user_profiles")
                .document(user.uid)
                .set(userProfile, com.google.firebase.firestore.SetOptions.merge())
                .await()
        } catch (e: Exception) {
            // Handle profile creation error
        }
    }
    
    fun sendPasswordResetEmail(email: String) {
        _authState.value = FirebaseAuthState.Loading
        
        CoroutineScope(Dispatchers.IO).launch {
            try {
                FirebaseAuth.getInstance().sendPasswordResetEmail(email).await()
                _authState.postValue(FirebaseAuthState.PasswordResetSent)
            } catch (e: Exception) {
                _authState.postValue(FirebaseAuthState.Error(e.message ?: "Failed to send reset email"))
            }
        }
    }
    
    fun signOut() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                FirebaseAuth.getInstance().signOut()
                _authState.postValue(FirebaseAuthState.SignedOut)
            } catch (e: Exception) {
                _authState.postValue(FirebaseAuthState.Error(e.message ?: "Sign out failed"))
            }
        }
    }
    
    fun getCurrentUser(): FirebaseUser? {
        return FirebaseAuth.getInstance().currentUser
    }
}

sealed class FirebaseAuthState {
    object Loading : FirebaseAuthState()
    object Success : FirebaseAuthState()
    object SignedOut : FirebaseAuthState()
    data class Error(val message: String) : FirebaseAuthState()
    object PasswordResetSent : FirebaseAuthState()
}


