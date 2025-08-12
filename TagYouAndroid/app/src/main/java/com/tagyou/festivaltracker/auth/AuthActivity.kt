package com.tagyou.festivaltracker.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.tagyou.festivaltracker.MainActivity
import com.tagyou.festivaltracker.R
import com.tagyou.festivaltracker.databinding.ActivityAuthBinding

class AuthActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityAuthBinding
    private lateinit var viewModel: FirebaseAuthViewModel
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAuthBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // Initialize ViewModel
        viewModel = ViewModelProvider(this)[FirebaseAuthViewModel::class.java]
        
        // Setup UI
        setupUI()
        
        // Observe authentication state
        observeAuthState()
    }
    
    private fun setupUI() {
        // Setup tab switching
        binding.btnLoginTab.setOnClickListener { switchTab(true) }
        binding.btnRegisterTab.setOnClickListener { switchTab(false) }
        
        // Setup form submission
        binding.btnSubmit.setOnClickListener { handleFormSubmission() }
        
        // Setup Google Sign In (temporarily disabled)
        binding.btnGoogleSignIn.setOnClickListener { 
            Toast.makeText(this, "Google Sign-In not configured yet", Toast.LENGTH_SHORT).show()
        }
        
        // Setup forgot password
        binding.btnForgotPassword.setOnClickListener { showForgotPasswordDialog() }
        
        // Setup form validation
        setupFormValidation()
        
        // Start with login tab
        switchTab(true)
    }
    
    private fun switchTab(isLogin: Boolean) {
        if (isLogin) {
            binding.btnLoginTab.isSelected = true
            binding.btnRegisterTab.isSelected = false
            binding.registerForm.visibility = View.GONE
            binding.loginForm.visibility = View.VISIBLE
            binding.btnSubmit.text = getString(R.string.sign_in)
            binding.btnForgotPassword.visibility = View.VISIBLE
        } else {
            binding.btnLoginTab.isSelected = false
            binding.btnRegisterTab.isSelected = true
            binding.loginForm.visibility = View.GONE
            binding.registerForm.visibility = View.VISIBLE
            binding.btnSubmit.text = getString(R.string.sign_up)
            binding.btnForgotPassword.visibility = View.GONE
        }
        
        // Clear form and errors
        clearForm()
    }
    
    private fun handleFormSubmission() {
        if (binding.btnLoginTab.isSelected) {
            handleLogin()
        } else {
            handleRegister()
        }
    }
    
    private fun handleLogin() {
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString()
        
        if (validateLoginForm(email, password)) {
            viewModel.signIn(email, password)
        }
    }
    
    private fun handleRegister() {
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString()
        val displayName = binding.etDisplayName.text.toString().trim()
        
        if (validateRegisterForm(email, password, displayName)) {
            viewModel.register(email, password, displayName)
        }
    }
    
    private fun validateLoginForm(email: String, password: String): Boolean {
        if (email.isEmpty()) {
            binding.etEmail.error = "Email is required"
            return false
        }
        if (password.isEmpty()) {
            binding.etPassword.error = "Password is required"
            return false
        }
        return true
    }
    
    private fun validateRegisterForm(email: String, password: String, displayName: String): Boolean {
        if (email.isEmpty()) {
            binding.etEmail.error = "Email is required"
            return false
        }
        if (password.isEmpty()) {
            binding.etPassword.error = "Password is required"
            return false
        }
        if (displayName.isEmpty()) {
            binding.etDisplayName.error = "Display name is required"
            return false
        }
        return true
    }
    
    private fun setupFormValidation() {
        // Add text change listeners for real-time validation
        binding.etEmail.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus && binding.etEmail.text.toString().trim().isEmpty()) {
                binding.etEmail.error = "Email is required"
            }
        }
        
        binding.etPassword.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus && binding.etPassword.text.toString().isEmpty()) {
                binding.etPassword.error = "Password is required"
            }
        }
        
        binding.etDisplayName.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus && binding.etDisplayName.text.toString().trim().isEmpty()) {
                binding.etDisplayName.error = "Display name is required"
            }
        }
    }
    
    private fun clearForm() {
        binding.etEmail.text?.clear()
        binding.etPassword.text?.clear()
        binding.etDisplayName.text?.clear()
        binding.etEmail.error = null
        binding.etPassword.error = null
        binding.etDisplayName.error = null
    }
    
    private fun showForgotPasswordDialog() {
        val email = binding.etEmail.text.toString().trim()
        if (email.isEmpty()) {
            binding.etEmail.error = "Please enter your email first"
            return
        }
        
        viewModel.sendPasswordResetEmail(email)
    }
    
    private fun observeAuthState() {
        viewModel.authState.observe(this) { state ->
            when (state) {
                is FirebaseAuthState.Loading -> {
                    showLoading(true)
                }
                is FirebaseAuthState.Success -> {
                    showLoading(false)
                    Toast.makeText(this, "Authentication successful!", Toast.LENGTH_SHORT).show()
                    navigateToMain()
                }
                is FirebaseAuthState.Error -> {
                    showLoading(false)
                    Toast.makeText(this, state.message, Toast.LENGTH_LONG).show()
                }
                is FirebaseAuthState.PasswordResetSent -> {
                    showLoading(false)
                    Toast.makeText(this, "Password reset email sent", Toast.LENGTH_LONG).show()
                }
                is FirebaseAuthState.SignedOut -> {
                    showLoading(false)
                }
            }
        }
    }
    
    private fun showLoading(show: Boolean) {
        binding.progressBar.visibility = if (show) View.VISIBLE else View.GONE
        binding.btnSubmit.isEnabled = !show
        binding.btnGoogleSignIn.isEnabled = !show
    }
    
    private fun navigateToMain() {
        val intent = Intent(this, MainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}

