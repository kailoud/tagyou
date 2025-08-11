package com.tagyou.festivaltracker.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.tagyou.festivaltracker.MainActivity
import com.tagyou.festivaltracker.R
import com.tagyou.festivaltracker.databinding.ActivityAuthBinding

class AuthActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityAuthBinding
    private lateinit var viewModel: AuthViewModel
    private lateinit var auth: FirebaseAuth
    private lateinit var googleSignInClient: GoogleSignInClient
    
    companion object {
        private const val RC_SIGN_IN = 9001
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAuthBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // Initialize Firebase Auth
        auth = FirebaseAuth.getInstance()
        
        // Initialize ViewModel
        viewModel = ViewModelProvider(this)[AuthViewModel::class.java]
        
        // Configure Google Sign In
        configureGoogleSignIn()
        
        // Setup UI
        setupUI()
        
        // Observe authentication state
        observeAuthState()
    }
    
    private fun configureGoogleSignIn() {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(getString(R.string.default_web_client_id))
            .requestEmail()
            .build()
        
        googleSignInClient = GoogleSignIn.getClient(this, gso)
    }
    
    private fun setupUI() {
        // Setup tab switching
        binding.btnLoginTab.setOnClickListener { switchTab(true) }
        binding.btnRegisterTab.setOnClickListener { switchTab(false) }
        
        // Setup form submission
        binding.btnSubmit.setOnClickListener { handleFormSubmission() }
        
        // Setup Google Sign In
        binding.btnGoogleSignIn.setOnClickListener { signInWithGoogle() }
        
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
    
    private fun setupFormValidation() {
        // Email validation
        binding.etEmail.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: android.text.Editable?) {
                validateEmail()
            }
        })
        
        // Password validation
        binding.etPassword.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: android.text.Editable?) {
                validatePassword()
            }
        })
        
        // Confirm password validation (for register)
        binding.etConfirmPassword.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: android.text.Editable?) {
                validateConfirmPassword()
            }
        })
    }
    
    private fun validateEmail(): Boolean {
        val email = binding.etEmail.text.toString()
        return if (android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.tilEmail.error = null
            true
        } else {
            binding.tilEmail.error = getString(R.string.error_invalid_email)
            false
        }
    }
    
    private fun validatePassword(): Boolean {
        val password = binding.etPassword.text.toString()
        return if (password.length >= 6) {
            binding.tilPassword.error = null
            true
        } else {
            binding.tilPassword.error = getString(R.string.error_weak_password)
            false
        }
    }
    
    private fun validateConfirmPassword(): Boolean {
        val password = binding.etPassword.text.toString()
        val confirmPassword = binding.etConfirmPassword.text.toString()
        return if (password == confirmPassword) {
            binding.tilConfirmPassword.error = null
            true
        } else {
            binding.tilConfirmPassword.error = getString(R.string.error_passwords_dont_match)
            false
        }
    }
    
    private fun handleFormSubmission() {
        val isLogin = binding.loginForm.visibility == View.VISIBLE
        
        if (!validateForm(isLogin)) {
            return
        }
        
        val email = binding.etEmail.text.toString()
        val password = binding.etPassword.text.toString()
        
        showLoading(true)
        
        if (isLogin) {
            viewModel.signIn(email, password)
        } else {
            val displayName = binding.etDisplayName.text.toString()
            viewModel.register(email, password, displayName)
        }
    }
    
    private fun validateForm(isLogin: Boolean): Boolean {
        val emailValid = validateEmail()
        val passwordValid = validatePassword()
        
        if (isLogin) {
            return emailValid && passwordValid
        } else {
            val confirmPasswordValid = validateConfirmPassword()
            val displayNameValid = binding.etDisplayName.text.toString().isNotBlank()
            
            if (!displayNameValid) {
                binding.tilDisplayName.error = "Display name is required"
            }
            
            return emailValid && passwordValid && confirmPasswordValid && displayNameValid
        }
    }
    
    private fun signInWithGoogle() {
        val signInIntent = googleSignInClient.signInIntent
        startActivityForResult(signInIntent, RC_SIGN_IN)
    }
    
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        if (requestCode == RC_SIGN_IN) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(data)
            try {
                val account = task.getResult(ApiException::class.java)
                firebaseAuthWithGoogle(account)
            } catch (e: ApiException) {
                showLoading(false)
                Toast.makeText(this, "Google sign in failed: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    private fun firebaseAuthWithGoogle(account: GoogleSignInAccount) {
        val credential = GoogleAuthProvider.getCredential(account.idToken, null)
        viewModel.signInWithGoogle(credential)
    }
    
    private fun showForgotPasswordDialog() {
        val email = binding.etEmail.text.toString()
        if (email.isBlank()) {
            binding.tilEmail.error = "Please enter your email first"
            return
        }
        
        viewModel.sendPasswordResetEmail(email)
    }
    
    private fun observeAuthState() {
        viewModel.authState.observe(this) { state ->
            when (state) {
                is AuthState.Loading -> showLoading(true)
                is AuthState.Success -> {
                    showLoading(false)
                    navigateToMain()
                }
                is AuthState.Error -> {
                    showLoading(false)
                    Toast.makeText(this, state.message, Toast.LENGTH_LONG).show()
                }
                is AuthState.PasswordResetSent -> {
                    showLoading(false)
                    Toast.makeText(this, "Password reset email sent", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
    
    private fun showLoading(show: Boolean) {
        binding.progressBar.visibility = if (show) View.VISIBLE else View.GONE
        binding.btnSubmit.isEnabled = !show
        binding.btnGoogleSignIn.isEnabled = !show
    }
    
    private fun clearForm() {
        binding.etEmail.text?.clear()
        binding.etPassword.text?.clear()
        binding.etConfirmPassword.text?.clear()
        binding.etDisplayName.text?.clear()
        
        binding.tilEmail.error = null
        binding.tilPassword.error = null
        binding.tilConfirmPassword.error = null
        binding.tilDisplayName.error = null
    }
    
    private fun navigateToMain() {
        val intent = Intent(this, MainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}
