package com.tagyou.festivaltracker.auth

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel

class AuthViewModel : ViewModel() {
    
    private val _authState = MutableLiveData<AuthState>()
    val authState: LiveData<AuthState> = _authState
    
    fun signIn(email: String, password: String) {
        _authState.value = AuthState.Loading
        
        // For now, just simulate success
        _authState.value = AuthState.Success
    }
    
    fun register(email: String, password: String, displayName: String) {
        _authState.value = AuthState.Loading
        
        // For now, just simulate success
        _authState.value = AuthState.Success
    }
    
    fun sendPasswordResetEmail(email: String) {
        _authState.value = AuthState.Loading
        
        // For now, just simulate success
        _authState.value = AuthState.PasswordResetSent
    }
}

sealed class AuthState {
    object Loading : AuthState()
    object Success : AuthState()
    data class Error(val message: String) : AuthState()
    object PasswordResetSent : AuthState()
}

