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

  // Initialize the auth service
  async initialize() {
    try {
      checkSupabaseConnection();

      console.log('🔐 Initializing Supabase Auth Service...');

      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ Error getting session:', error);
        return false;
      }

      if (session) {
        this.currentUser = session.user;
        console.log('✅ User session found:', this.currentUser.email);
        this.notifyAuthStateListeners();
      } else {
        console.log('ℹ️ No active session found');
      }

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
}

// Create and export a singleton instance
export const supabaseAuthService = new SupabaseAuthService();

// Set the global supabase instance
export function setSupabaseInstance(supabaseInstance) {
  supabase = supabaseInstance;
}
