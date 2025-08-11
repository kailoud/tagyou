package com.tagyou.festivaltracker

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.tagyou.festivaltracker.auth.AuthActivity
import com.tagyou.festivaltracker.databinding.ActivityMainBinding
import com.tagyou.festivaltracker.map.MapActivity
import com.tagyou.festivaltracker.viewmodels.MainViewModel

class MainActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityMainBinding
    private lateinit var viewModel: MainViewModel
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // Initialize ViewModel
        viewModel = ViewModelProvider(this)[MainViewModel::class.java]
        
        // For now, show main content directly (no auth check)
        // TODO: Implement proper authentication check
        showMainContent()
        
        // Setup UI
        setupUI()
        
        // Observe user profile
        observeUserProfile()
        
        // Load user profile
        viewModel.loadCurrentUserProfile()
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
    
    private fun observeUserProfile() {
        viewModel.userProfile.observe(this) { profile ->
            profile?.let {
                binding.tvWelcome.text = "Welcome, ${it.full_name ?: it.email}"
                
                // Show admin features if user is admin
                if (it.is_admin) {
                    // TODO: Show admin-specific UI elements
                }
            }
        }
        
        viewModel.isLoading.observe(this) { loading ->
            // TODO: Show/hide loading indicator
        }
    }
    
    private fun showMainContent() {
        binding.authContainer.visibility = View.GONE
        binding.mainContainer.visibility = View.VISIBLE
    }
    
    private fun logout() {
        // For now, just navigate to auth activity
        // TODO: Implement proper Supabase logout
        startActivity(Intent(this, AuthActivity::class.java))
        finish()
    }
    
    override fun onResume() {
        super.onResume()
        // Refresh user data when returning to main activity
        viewModel.loadCurrentUserProfile()
    }
}

