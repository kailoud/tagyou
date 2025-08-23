// Modern Profile Service - Supabase Integration
// Handles user profiles, settings, preferences, and data management

import { supabaseAuthService } from './supabase-auth-service.js';

class ModernProfileService {
  constructor() {
    this.currentProfile = null;
    this.profileListeners = [];
    this.isInitialized = false;
    this.supabase = null;
  }

  // Initialize the profile service
  async initialize() {
    try {
      console.log('👤 Initializing Modern Profile Service...');

      // Wait for Supabase to be available
      await this.waitForSupabase();

      // Set up auth state listener
      supabaseAuthService.onAuthStateChanged(async (user) => {
        if (user) {
          await this.loadUserProfile(user);
        } else {
          this.clearProfile();
        }
      });

      this.isInitialized = true;
      console.log('✅ Modern Profile Service initialized');
      return true;
    } catch (error) {
      console.error('❌ Modern Profile Service initialization error:', error);
      return false;
    }
  }

  // Wait for Supabase to be available
  async waitForSupabase() {
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      if (window.supabase) {
        this.supabase = window.supabase;
        console.log('✅ Supabase available for profile service');
        return;
      }
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Supabase not available after 30 seconds');
  }

  // Load user profile from Supabase
  async loadUserProfile(user) {
    try {
      console.log('👤 Loading profile for user:', user.email);

      // First, try to get existing profile
      const { data: existingProfile, error: fetchError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error fetching profile:', fetchError);
        throw fetchError;
      }

      if (existingProfile) {
        // Profile exists, use it
        this.currentProfile = {
          ...existingProfile,
          email: user.email,
          lastSignIn: user.last_sign_in_at
        };
        console.log('✅ Existing profile loaded:', this.currentProfile);
      } else {
        // Create new profile
        const newProfile = await this.createUserProfile(user);
        this.currentProfile = newProfile;
        console.log('✅ New profile created:', this.currentProfile);
      }

      this.notifyProfileListeners();
      return this.currentProfile;
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      // Create a basic profile object as fallback
      this.currentProfile = this.createBasicProfile(user);
      this.notifyProfileListeners();
      return this.currentProfile;
    }
  }

  // Create a new user profile
  async createUserProfile(user) {
    try {
      const profileData = {
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.full_name || user.email.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url || null,
        bio: '',
        location: '',
        website: '',
        phone: '',
        date_of_birth: null,
        gender: null,
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          privacy: {
            profile_visible: true,
            location_visible: true,
            activity_visible: true
          },
          theme: 'auto',
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        settings: {
          dark_mode: false,
          auto_save: true,
          location_services: true,
          analytics: true
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error in createUserProfile:', error);
      throw error;
    }
  }

  // Create a basic profile object (fallback)
  createBasicProfile(user) {
    return {
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.full_name || user.email.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url || null,
      bio: '',
      location: '',
      website: '',
      phone: '',
      date_of_birth: null,
      gender: null,
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        privacy: {
          profile_visible: true,
          location_visible: true,
          activity_visible: true
        },
        theme: 'auto',
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      settings: {
        dark_mode: false,
        auto_save: true,
        location_services: true,
        analytics: true
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // Update user profile
  async updateProfile(updates) {
    try {
      if (!this.currentProfile) {
        throw new Error('No profile to update');
      }

      console.log('👤 Updating profile:', updates);

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('profiles')
        .update(updateData)
        .eq('id', this.currentProfile.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating profile:', error);
        throw error;
      }

      this.currentProfile = { ...this.currentProfile, ...data };
      this.notifyProfileListeners();
      console.log('✅ Profile updated successfully');
      return this.currentProfile;
    } catch (error) {
      console.error('❌ Error in updateProfile:', error);
      throw error;
    }
  }

  // Update specific profile field
  async updateProfileField(field, value) {
    return this.updateProfile({ [field]: value });
  }

  // Update preferences
  async updatePreferences(preferences) {
    const currentPreferences = this.currentProfile?.preferences || {};
    const updatedPreferences = { ...currentPreferences, ...preferences };
    return this.updateProfile({ preferences: updatedPreferences });
  }

  // Update settings
  async updateSettings(settings) {
    const currentSettings = this.currentProfile?.settings || {};
    const updatedSettings = { ...currentSettings, ...settings };
    return this.updateProfile({ settings: updatedSettings });
  }

  // Get current profile
  getCurrentProfile() {
    return this.currentProfile;
  }

  // Check if user has a profile
  hasProfile() {
    return !!this.currentProfile;
  }

  // Clear profile (on sign out)
  clearProfile() {
    this.currentProfile = null;
    this.notifyProfileListeners();
    console.log('👤 Profile cleared');
  }

  // Add profile change listener
  onProfileChange(callback) {
    this.profileListeners.push(callback);

    // Call immediately with current state
    if (this.isInitialized) {
      callback(this.currentProfile);
    }

    // Return unsubscribe function
    return () => {
      const index = this.profileListeners.indexOf(callback);
      if (index > -1) {
        this.profileListeners.splice(index, 1);
      }
    };
  }

  // Notify all profile listeners
  notifyProfileListeners() {
    this.profileListeners.forEach(callback => {
      try {
        callback(this.currentProfile);
      } catch (error) {
        console.error('❌ Profile listener error:', error);
      }
    });
  }

  // Get user avatar URL or initials
  getUserAvatar(user = null) {
    const profile = user || this.currentProfile;
    if (!profile) return null;

    if (profile.avatar_url) {
      return profile.avatar_url;
    }

    // Generate initials from display name or email
    const name = profile.display_name || profile.email;
    const initials = name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);

    return initials;
  }

  // Get user display name
  getUserDisplayName(user = null) {
    const profile = user || this.currentProfile;
    if (!profile) return 'Guest';

    return profile.display_name || profile.email.split('@')[0];
  }

  // Get user initials for avatar
  getUserInitials(user = null) {
    const profile = user || this.currentProfile;
    if (!profile) return 'G';

    const name = profile.display_name || profile.email;
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  // Upload avatar image
  async uploadAvatar(file) {
    try {
      if (!this.currentProfile) {
        throw new Error('No profile to update');
      }

      console.log('📸 Uploading avatar...');

      const fileExt = file.name.split('.').pop();
      const fileName = `${this.currentProfile.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Error uploading avatar:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      await this.updateProfileField('avatar_url', urlData.publicUrl);

      console.log('✅ Avatar uploaded successfully');
      return urlData.publicUrl;
    } catch (error) {
      console.error('❌ Error in uploadAvatar:', error);
      throw error;
    }
  }

  // Delete avatar
  async deleteAvatar() {
    try {
      if (!this.currentProfile?.avatar_url) {
        return;
      }

      console.log('🗑️ Deleting avatar...');

      // Extract file path from URL
      const urlParts = this.currentProfile.avatar_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `avatars/${fileName}`;

      // Delete from Supabase Storage
      const { error: deleteError } = await this.supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (deleteError) {
        console.error('❌ Error deleting avatar:', deleteError);
        throw deleteError;
      }

      // Update profile to remove avatar URL
      await this.updateProfileField('avatar_url', null);

      console.log('✅ Avatar deleted successfully');
    } catch (error) {
      console.error('❌ Error in deleteAvatar:', error);
      throw error;
    }
  }

  // Export profile data
  exportProfileData() {
    if (!this.currentProfile) {
      throw new Error('No profile to export');
    }

    const exportData = {
      ...this.currentProfile,
      exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profile-${this.currentProfile.id}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('📤 Profile data exported');
  }

  // Import profile data
  async importProfileData(file) {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      // Validate import data
      if (!importData.id || !importData.email) {
        throw new Error('Invalid profile data format');
      }

      // Update profile with imported data
      const updates = {
        display_name: importData.display_name,
        bio: importData.bio,
        location: importData.location,
        website: importData.website,
        phone: importData.phone,
        preferences: importData.preferences,
        settings: importData.settings
      };

      await this.updateProfile(updates);
      console.log('📥 Profile data imported successfully');
    } catch (error) {
      console.error('❌ Error importing profile data:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const modernProfileService = new ModernProfileService();

// Export the class for testing
export { ModernProfileService };

