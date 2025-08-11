package com.tagyou.festivaltracker.viewmodels

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.tagyou.festivaltracker.data.UserProfile

class MainViewModel : ViewModel() {
    
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading
    
    private val _userProfile = MutableLiveData<UserProfile?>()
    val userProfile: LiveData<UserProfile?> = _userProfile
    
    private val _isAdmin = MutableLiveData<Boolean>()
    val isAdmin: LiveData<Boolean> = _isAdmin
    
    fun loadCurrentUserProfile() {
        _isLoading.value = true
        
        // For now, create a mock user profile
        // TODO: Replace with actual Supabase user profile loading
        val mockProfile = UserProfile(
            id = "mock-user-id",
            email = "user@example.com",
            full_name = "Demo User",
            role = "user",
            is_admin = false
        )
        
        _userProfile.value = mockProfile
        _isAdmin.value = false
        _isLoading.value = false
    }
    
    fun setUserProfile(profile: UserProfile?) {
        _userProfile.value = profile
        _isAdmin.value = profile?.is_admin ?: false
    }
    
    fun setLoading(loading: Boolean) {
        _isLoading.value = loading
    }
}

