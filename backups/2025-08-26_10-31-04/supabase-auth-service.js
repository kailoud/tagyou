// Supabase Authentication Service
// Using CDN imports for better compatibility with live server

// Use global Supabase instance
let supabase = null;

// Check if Supabase is properly initialized
function checkSupabaseConnection() {
  if (!supabase) {
    // Try to get the global supabase instance
    if (window.supabase) {
      supabase = window.supabase;
    } else {
      throw new Error('Supabase not initialized. Please check your configuration.');
    }
  }
}

// Set the global supabase instance for auth service
export function setSupabaseInstance(supabaseInstance) {
  supabase = supabaseInstance;
  console.log('✅ Supabase instance set for auth service');
}

// Authentication state
let currentUser = null;
let authStateListeners = [];

// Initialize the auth service
export class SupabaseAuthService {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;
    this.authStateListeners = [];
  }

  // Check if profiles table exists
  async checkProfilesTable() {
    try {
      console.log('🔐 Checking if profiles table exists...');
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        console.error('❌ Profiles table error:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error code:', error.code);
        return false;
      } else {
        console.log('✅ Profiles table exists and is accessible');
        return true;
      }
    } catch (error) {
      console.error('❌ Error checking profiles table:', error);
      return false;
    }
  }

  // Initialize the auth service
  async initialize() {
    try {
      checkSupabaseConnection();

      console.log('🔐 Initializing Supabase Auth Service...');

      // Check if profiles table exists
      try {
        console.log('🔐 Checking profiles table...');
        const { error: tableCheckError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);

        if (tableCheckError) {
          console.error('❌ Profiles table not found:', tableCheckError);
          console.warn('⚠️ Please run the supabase-schema.sql in your Supabase SQL editor');
        } else {
          console.log('✅ Profiles table exists');
        }
      } catch (error) {
        console.error('❌ Error checking profiles table:', error);
      }

      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ Error getting session:', error);
        return false;
      }

      if (session) {
        this.currentUser = session.user;
        console.log('✅ User session found:', this.currentUser.email);

        // Fetch profile data for existing session
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!profileError && profileData) {
            console.log('✅ User profile found:', profileData);
            this.currentUser = { ...this.currentUser, profile: profileData };
          }
        } catch (profileError) {
          console.error('❌ Profile fetch error:', profileError);
        }

        this.notifyAuthStateListeners();
      } else {
        console.log('ℹ️ No active session found');
      }

      // Check if profiles table exists
      await this.checkProfilesTable();

      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔐 Auth state changed:', event, session?.user?.email);

          if (event === 'SIGNED_IN' && session) {
            this.currentUser = session.user;
            console.log('✅ User signed in:', this.currentUser.email);
          } else if (event === 'SIGNED_OUT') {
            this.currentUser = null;
            console.log('👋 User signed out');
          }

          this.notifyAuthStateListeners();
        }
      );

      this.isInitialized = true;
      console.log('✅ Supabase Auth Service initialized');
      return true;
    } catch (error) {
      console.error('❌ SupabaseAuthService.initialize error:', error);
      return false;
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      checkSupabaseConnection();

      console.log('🔐 Attempting sign in for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        console.error('❌ Sign in error:', error.message);
        throw new Error(error.message);
      }

      if (data.user) {
        this.currentUser = data.user;
        console.log('✅ Sign in successful:', this.currentUser.email);

        // Fetch user profile data
        try {
          console.log('🔐 Fetching user profile from database...');
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            console.error('❌ Profile fetch error:', profileError);
          } else {
            console.log('✅ User profile fetched:', profileData);
            // Merge profile data with user data
            this.currentUser = { ...this.currentUser, profile: profileData };
          }
        } catch (profileError) {
          console.error('❌ Profile fetch failed:', profileError);
        }

        this.notifyAuthStateListeners();
        return { success: true, user: this.currentUser };
      }

      throw new Error('Sign in failed - no user data returned');
    } catch (error) {
      console.error('❌ SupabaseAuthService.signIn error:', error);
      throw error;
    }
  }

  // Sign up with email and password
  async signUp(email, password) {
    try {
      checkSupabaseConnection();

      console.log('🔐 Attempting sign up for:', email);

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
      });

      if (error) {
        console.error('❌ Sign up error:', error.message);
        throw new Error(error.message);
      }

      if (data.user) {
        this.currentUser = data.user;
        console.log('✅ Sign up successful:', this.currentUser.email);

        // Create profile in profiles table
        try {
          console.log('🔐 Creating user profile in database...');
          console.log('🔐 User ID:', data.user.id);
          console.log('🔐 User Email:', data.user.email);

          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                display_name: data.user.email.split('@')[0].charAt(0).toUpperCase() + data.user.email.split('@')[0].slice(1),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])
            .select();

          if (profileError) {
            console.error('❌ Profile creation error:', profileError);
            console.error('❌ Error details:', profileError.message);
            console.error('❌ Error code:', profileError.code);
            // Don't throw error here as auth was successful
          } else {
            console.log('✅ User profile created successfully');
            console.log('✅ Profile data:', profileData);
          }
        } catch (profileError) {
          console.error('❌ Profile creation failed:', profileError);
          console.error('❌ Error details:', profileError.message);
          // Don't throw error here as auth was successful
        }

        this.notifyAuthStateListeners();
        return { success: true, user: this.currentUser };
      }

      throw new Error('Sign up failed - no user data returned');
    } catch (error) {
      console.error('❌ SupabaseAuthService.signUp error:', error);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      checkSupabaseConnection();

      console.log('🔐 Attempting sign out');

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Sign out error:', error.message);
        throw new Error(error.message);
      }

      this.currentUser = null;
      console.log('✅ Sign out successful');
      this.notifyAuthStateListeners();
      return { success: true };
    } catch (error) {
      console.error('❌ SupabaseAuthService.signOut error:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Add auth state listener
  onAuthStateChanged(callback) {
    this.authStateListeners.push(callback);

    // Call immediately with current state
    if (this.isInitialized) {
      callback(this.currentUser);
    }

    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Notify all auth state listeners
  notifyAuthStateListeners() {
    this.authStateListeners.forEach(callback => {
      try {
        callback(this.currentUser);
      } catch (error) {
        console.error('❌ Auth state listener error:', error);
      }
    });
  }

  // Reset password
  async resetPassword(email) {
    try {
      checkSupabaseConnection();

      console.log('🔐 Attempting password reset for:', email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
      });

      if (error) {
        console.error('❌ Password reset error:', error.message);
        throw new Error(error.message);
      }

      console.log('✅ Password reset email sent');
      return { success: true };
    } catch (error) {
      console.error('❌ SupabaseAuthService.resetPassword error:', error);
      throw error;
    }
  }

  // Update password
  async updatePassword(newPassword) {
    try {
      checkSupabaseConnection();

      console.log('🔐 Attempting password update');

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ Password update error:', error.message);
        throw new Error(error.message);
      }

      console.log('✅ Password updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ SupabaseAuthService.updatePassword error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(updates) {
    try {
      checkSupabaseConnection();

      console.log('🔐 Attempting profile update');

      const { data, error } = await supabase.auth.updateUser(updates);

      if (error) {
        console.error('❌ Profile update error:', error.message);
        throw new Error(error.message);
      }

      if (data.user) {
        this.currentUser = data.user;
        console.log('✅ Profile updated successfully');
        this.notifyAuthStateListeners();
        return { success: true, user: this.currentUser };
      }

      throw new Error('Profile update failed - no user data returned');
    } catch (error) {
      console.error('❌ SupabaseAuthService.updateProfile error:', error);
      throw error;
    }
  }

  // Sign in with Google (OAuth)
  async signInWithGoogle() {
    try {
      checkSupabaseConnection();

      console.log('🔐 Attempting Google sign in');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        console.error('❌ Google sign in error:', error.message);
        throw new Error(error.message);
      }

      console.log('✅ Google sign in initiated');
      return { success: true, data };
    } catch (error) {
      console.error('❌ SupabaseAuthService.signInWithGoogle error:', error);
      throw error;
    }
  }

  // Sign in with Facebook (OAuth)
  async signInWithFacebook() {
    try {
      checkSupabaseConnection();

      console.log('🔐 Attempting Facebook sign in');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        console.error('❌ Facebook sign in error:', error.message);
        throw new Error(error.message);
      }

      console.log('✅ Facebook sign in initiated');
      return { success: true, data };
    } catch (error) {
      console.error('❌ SupabaseAuthService.signInWithFacebook error:', error);
      throw error;
    }
  }

  // Show sign in modal
  showSignInModal() {
    console.log('🔐 Showing sign in modal...');
    this.createAuthModal('signin');
  }

  // Show sign up modal
  showSignUpModal() {
    console.log('🔐 Showing sign up modal...');
    this.createAuthModal('signup');
  }

  // Create authentication modal
  createAuthModal(type) {
    // Remove any existing modal
    const existingModal = document.querySelector('.auth-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
      <div class="auth-modal-overlay">
        <div class="auth-modal-content">
          <div class="auth-modal-header">
            <h2>${type === 'signup' ? 'Create Account' : 'Sign In'}</h2>
            <button class="auth-modal-close" onclick="this.closest('.auth-modal').remove()">×</button>
          </div>
          
          <div class="auth-modal-body">
            <form class="auth-form" id="authForm">
              <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required>
              </div>
              
              <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
              </div>
              
              ${type === 'signup' ? `
                <div class="form-group">
                  <label for="confirmPassword">Confirm Password</label>
                  <input type="password" id="confirmPassword" name="confirmPassword" required>
                </div>
              ` : ''}
              
              <div class="auth-error" id="authError" style="display: none;"></div>
              
              <button type="submit" class="auth-submit-btn">
                ${type === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </form>
            
            <div class="auth-divider">
              <span>or</span>
            </div>
            
            <div class="oauth-buttons">
              <button class="oauth-btn google-btn" onclick="window.authService.signInWithGoogle()">
                <i class="fab fa-google"></i>
                Sign in with Google
              </button>
              <button class="oauth-btn facebook-btn" onclick="window.authService.signInWithFacebook()">
                <i class="fab fa-facebook"></i>
                Sign in with Facebook
              </button>
            </div>
            
            <div class="auth-footer">
              ${type === 'signup' ?
        '<p>Already have an account? <a href="#" onclick="window.authService.showSignInModal()">Sign in</a></p>' :
        '<p>Don\'t have an account? <a href="#" onclick="window.authService.showSignUpModal()">Create one</a></p>'
      }
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Show the modal with animation
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);

    // Handle form submission
    const form = modal.querySelector('#authForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = form.email.value;
      const password = form.password.value;
      const confirmPassword = form.confirmPassword?.value;
      const errorDiv = modal.querySelector('#authError');

      // Clear previous errors
      errorDiv.style.display = 'none';
      errorDiv.textContent = '';

      try {
        if (type === 'signup') {
          if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
          }
          await this.signUp(email, password);
        } else {
          await this.signIn(email, password);
        }

        // Close modal on success
        modal.remove();
      } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
      }
    });

    // Close modal when clicking overlay
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
}

// Create and export a singleton instance
export const supabaseAuthService = new SupabaseAuthService();

// Set the global supabase instance
export function setSupabaseInstance(supabaseInstance) {
  supabase = supabaseInstance;
}
