// Fresh Authentication Service for TagYou
// Clean implementation: Basic User → Premium User

// Use global Supabase instance
let supabase = null;

// Check if Supabase is properly initialized
function checkSupabaseConnection() {
  if (!supabase) {
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
  console.log('✅ Supabase instance set for fresh auth service');
}

// Authentication state
let currentUser = null;
let authStateListeners = [];

// Fresh Authentication Service
export class FreshAuthService {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;
    this.userProfile = null;
    this.isPremium = false;
    this.authStateListeners = [];
  }

  // Initialize the auth service
  async initialize() {
    try {
      checkSupabaseConnection();
      console.log('🔐 Initializing Fresh Auth Service...');

      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ Error getting session:', error);
        return false;
      }

      if (session) {
        this.currentUser = session.user;
        console.log('✅ User session found:', this.currentUser.email);
        
        // Load user profile and premium status
        await this.loadUserProfile();
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session) {
          this.currentUser = session.user;
          await this.loadUserProfile();
        } else if (event === 'SIGNED_OUT') {
          this.currentUser = null;
          this.userProfile = null;
          this.isPremium = false;
        }
        
        this.notifyAuthStateListeners();
      });

      this.isInitialized = true;
      this.notifyAuthStateListeners();
      return true;
    } catch (error) {
      console.error('❌ Error initializing auth service:', error);
      return false;
    }
  }

  // Load user profile and premium status
  async loadUserProfile() {
    if (!this.currentUser) return;

    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', this.currentUser.id)
        .single();

      if (profileError) {
        console.error('❌ Error loading user profile:', profileError);
        return;
      }

      this.userProfile = profile;
      this.isPremium = profile.user_type === 'premium';
      
      console.log('✅ User profile loaded:', {
        email: profile.email,
        userType: profile.user_type,
        isPremium: this.isPremium
      });

      // Update login count and last login
      await this.updateLoginStats();
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
    }
  }

  // Update login statistics
  async updateLoginStats() {
    if (!this.currentUser) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          last_login_at: new Date().toISOString(),
          login_count: this.userProfile.login_count + 1
        })
        .eq('id', this.currentUser.id);

      if (error) {
        console.error('❌ Error updating login stats:', error);
      }
    } catch (error) {
      console.error('❌ Error updating login stats:', error);
    }
  }

  // Sign up with email and password
  async signUp(email, password, displayName = null) {
    try {
      checkSupabaseConnection();
      console.log('🔐 Attempting sign up for:', email);

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: displayName || email.split('@')[0]
          }
        }
      });

      if (error) {
        console.error('❌ Sign up error:', error.message);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('✅ Sign up successful:', data.user.email);
        
        // Profile will be created automatically by the trigger
        // We'll load it when the user signs in
        
        return {
          success: true,
          user: data.user,
          message: 'Account created successfully! Please check your email to verify your account.'
        };
      }

      return {
        success: false,
        message: 'Sign up failed. Please try again.'
      };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      throw error;
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
        
        // Log failed login attempt
        await this.logLoginAttempt(email, false, error.message);
        
        throw new Error(error.message);
      }

      if (data.user) {
        this.currentUser = data.user;
        console.log('✅ Sign in successful:', this.currentUser.email);
        
        // Load user profile and premium status
        await this.loadUserProfile();
        
        // Log successful login attempt
        await this.logLoginAttempt(email, true);
        
        this.notifyAuthStateListeners();
        
        return {
          success: true,
          user: data.user,
          profile: this.userProfile,
          isPremium: this.isPremium
        };
      }

      return {
        success: false,
        message: 'Sign in failed. Please try again.'
      };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      checkSupabaseConnection();
      console.log('🔐 Signing out user:', this.currentUser?.email);

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Sign out error:', error.message);
        throw new Error(error.message);
      }

      this.currentUser = null;
      this.userProfile = null;
      this.isPremium = false;
      
      console.log('✅ Sign out successful');
      this.notifyAuthStateListeners();
      
      return { success: true };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  }

  // Check if user is premium
  async checkPremiumStatus(email = null) {
    try {
      const userEmail = email || this.currentUser?.email;
      if (!userEmail) return false;

      // First check local state
      if (this.userProfile && this.userProfile.user_type === 'premium') {
        return true;
      }

      // Check database
      const { data, error } = await supabase
        .rpc('is_user_premium', { user_email: userEmail });

      if (error) {
        console.error('❌ Error checking premium status:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('❌ Error checking premium status:', error);
      return false;
    }
  }

  // Upgrade user to premium
  async upgradeToPremium(paymentData = {}) {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      console.log('💎 Upgrading user to premium:', this.currentUser.email);

      const { data, error } = await supabase
        .rpc('upgrade_to_premium', {
          user_email: this.currentUser.email,
          payment_data: paymentData
        });

      if (error) {
        console.error('❌ Error upgrading to premium:', error);
        throw new Error(error.message);
      }

      // Reload user profile to get updated premium status
      await this.loadUserProfile();
      
      console.log('✅ User upgraded to premium successfully');
      this.notifyAuthStateListeners();
      
      return {
        success: true,
        isPremium: this.isPremium
      };
    } catch (error) {
      console.error('❌ Error upgrading to premium:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(updates) {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      console.log('📝 Updating user profile:', updates);

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', this.currentUser.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating profile:', error);
        throw new Error(error.message);
      }

      this.userProfile = data;
      console.log('✅ Profile updated successfully');
      
      return {
        success: true,
        profile: data
      };
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
    }
  }

  // Add carnival to favorites
  async addToFavorites(carnivalId, notes = '') {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      console.log('⭐ Adding carnival to favorites:', carnivalId);

      const { data, error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: this.currentUser.id,
          carnival_id: carnivalId,
          notes: notes
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding to favorites:', error);
        throw new Error(error.message);
      }

      console.log('✅ Added to favorites successfully');
      return { success: true, favorite: data };
    } catch (error) {
      console.error('❌ Error adding to favorites:', error);
      throw error;
    }
  }

  // Remove carnival from favorites
  async removeFromFavorites(carnivalId) {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      console.log('🗑️ Removing carnival from favorites:', carnivalId);

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', this.currentUser.id)
        .eq('carnival_id', carnivalId);

      if (error) {
        console.error('❌ Error removing from favorites:', error);
        throw new Error(error.message);
      }

      console.log('✅ Removed from favorites successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error removing from favorites:', error);
      throw error;
    }
  }

  // Get user favorites
  async getFavorites() {
    try {
      if (!this.currentUser) {
        return [];
      }

      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          *,
          carnivals (*)
        `)
        .eq('user_id', this.currentUser.id);

      if (error) {
        console.error('❌ Error getting favorites:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error getting favorites:', error);
      return [];
    }
  }

  // Log login attempt
  async logLoginAttempt(email, success, failureReason = null) {
    try {
      const { error } = await supabase
        .from('login_attempts')
        .insert({
          user_id: this.currentUser?.id || null,
          email: email,
          success: success,
          failure_reason: failureReason,
          ip_address: null, // Could be added if needed
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('❌ Error logging login attempt:', error);
      }
    } catch (error) {
      console.error('❌ Error logging login attempt:', error);
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get user profile
  getUserProfile() {
    return this.userProfile;
  }

  // Check if user is premium
  getIsPremium() {
    return this.isPremium;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Add auth state listener
  addAuthStateListener(listener) {
    this.authStateListeners.push(listener);
  }

  // Remove auth state listener
  removeAuthStateListener(listener) {
    this.authStateListeners = this.authStateListeners.filter(l => l !== listener);
  }

  // Notify auth state listeners
  notifyAuthStateListeners() {
    this.authStateListeners.forEach(listener => {
      try {
        listener({
          user: this.currentUser,
          profile: this.userProfile,
          isPremium: this.isPremium,
          isAuthenticated: this.isAuthenticated()
        });
      } catch (error) {
        console.error('❌ Error in auth state listener:', error);
      }
    });
  }

  // Reset password
  async resetPassword(email) {
    try {
      checkSupabaseConnection();
      console.log('🔐 Sending password reset for:', email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password.html'
      });

      if (error) {
        console.error('❌ Password reset error:', error.message);
        throw new Error(error.message);
      }

      console.log('✅ Password reset email sent');
      return { success: true };
    } catch (error) {
      console.error('❌ Password reset error:', error);
      throw error;
    }
  }

  // Update password
  async updatePassword(newPassword) {
    try {
      checkSupabaseConnection();
      console.log('🔐 Updating password');

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
      console.error('❌ Password update error:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const freshAuthService = new FreshAuthService();
