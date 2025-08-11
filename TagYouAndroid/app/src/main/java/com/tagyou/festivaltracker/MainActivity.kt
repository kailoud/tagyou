package com.tagyou.festivaltracker

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.google.firebase.auth.FirebaseAuth
import com.tagyou.festivaltracker.auth.AuthActivity
import com.tagyou.festivaltracker.databinding.ActivityMainBinding
import com.tagyou.festivaltracker.map.MapActivity
import com.tagyou.festivaltracker.viewmodels.MainViewModel

class MainActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityMainBinding
    private lateinit var viewModel: MainViewModel
    private lateinit var auth: FirebaseAuth
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // Initialize Firebase Auth
        auth = FirebaseAuth.getInstance()
        
        // Initialize ViewModel
        viewModel = ViewModelProvider(this)[MainViewModel::class.java]
        
        // Check authentication status
        checkAuthStatus()
        
        // Setup UI
        setupUI()
    }
    
    private fun checkAuthStatus() {
        val currentUser = auth.currentUser
        if (currentUser == null) {
            // User not authenticated, go to auth activity
            startActivity(Intent(this, AuthActivity::class.java))
            finish()
        } else {
            // User is authenticated, show main UI
            viewModel.setCurrentUser(currentUser)
            showMainContent()
        }
    }
    
    private fun setupUI() {
        // Setup navigation buttons
        binding.btnOpenMap.setOnClickListener {
            startActivity(Intent(this, MapActivity::class.java))
        }
        
        binding.btnGroups.setOnClickListener {
            // TODO: Navigate to groups activity
        }
        
        binding.btnProfile.setOnClickListener {
            // TODO: Navigate to profile activity
        }
        
        binding.btnSettings.setOnClickListener {
            // TODO: Navigate to settings activity
        }
        
        binding.btnLogout.setOnClickListener {
            logout()
        }
    }
    
    private fun showMainContent() {
        binding.authContainer.visibility = View.GONE
        binding.mainContainer.visibility = View.VISIBLE
        
        // Update UI with user info
        viewModel.currentUser.observe(this) { user ->
            user?.let {
                binding.tvWelcome.text = "Welcome, ${it.displayName ?: it.email}"
            }
        }
    }
    
    private fun logout() {
        auth.signOut()
        startActivity(Intent(this, AuthActivity::class.java))
        finish()
    }
    
    override fun onResume() {
        super.onResume()
        // Refresh user data when returning to main activity
        viewModel.refreshUserData()
    }
}

