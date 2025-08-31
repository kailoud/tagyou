// Profile Service for TagYou
// Handles user profile operations with Supabase

class ProfileService {
  constructor() {
    this.supabase = window.supabaseClient;
  }

  // Get user profile from Supabase
  async getUserProfile(userId) {
    try {
      if (!this.supabase) {
        console.error('ProfileService: Supabase client not available');
        return null;
      }

      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('ProfileService: Error fetching profile:', error);
        // Return null to trigger localStorage fallback
        return null;
      }

      return data;
    } catch (error) {
      console.error('ProfileService: Error in getUserProfile:', error);
      return null;
    }
  }

  // Create or update user profile
  async upsertUserProfile(profileData) {
    try {
      if (!this.supabase) {
        console.error('ProfileService: Supabase client not available');
        return { success: false, error: 'Supabase client not available' };
      }

      const { data, error } = await this.supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('ProfileService: Error upserting profile:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('ProfileService: Error in upsertUserProfile:', error);
      return { success: false, error: error.message };
    }
  }

  // Update specific profile fields
  async updateProfile(userId, updates) {
    try {
      if (!this.supabase) {
        console.error('ProfileService: Supabase client not available');
        return { success: false, error: 'Supabase client not available' };
      }

      console.log('ProfileService: Updating profile for user:', userId, 'with updates:', updates);

      const { data, error } = await this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select();

      if (error) {
        console.error('ProfileService: Error updating profile:', error);
        return { success: false, error: error.message };
      }

      console.log('ProfileService: Profile updated successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('ProfileService: Error in updateProfile:', error);
      return { success: false, error: error.message };
    }
  }

  // Upload avatar image to Supabase Storage
  async uploadAvatar(userId, file) {
    try {
      if (!this.supabase) {
        console.error('ProfileService: Supabase client not available');
        return { success: false, error: 'Supabase client not available' };
      }

      // Skip bucket check for faster upload (assume bucket exists)
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to Supabase Storage with timeout
      const uploadPromise = this.supabase.storage
        .from('user-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      // Add 10-second timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout')), 10000);
      });

      const { data: uploadData, error: uploadError } = await Promise.race([
        uploadPromise,
        timeoutPromise
      ]);

      if (uploadError) {
        console.error('ProfileService: Error uploading avatar:', uploadError);
        return { success: false, error: uploadError.message };
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath
      };
    } catch (error) {
      console.error('ProfileService: Error in uploadAvatar:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete avatar from Supabase Storage
  async deleteAvatar(filePath) {
    try {
      if (!this.supabase) {
        console.error('ProfileService: Supabase client not available');
        return { success: false, error: 'Supabase client not available' };
      }

      const { error } = await this.supabase.storage
        .from('user-avatars')
        .remove([filePath]);

      if (error) {
        console.error('ProfileService: Error deleting avatar:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('ProfileService: Error in deleteAvatar:', error);
      return { success: false, error: error.message };
    }
  }

  // Get profile by email (for compatibility)
  async getProfileByEmail(email) {
    try {
      if (!this.supabase) {
        console.error('ProfileService: Supabase client not available');
        return null;
      }

      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', email) // Using email as id for now
        .single();

      if (error) {
        console.error('ProfileService: Error fetching profile by email:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('ProfileService: Error in getProfileByEmail:', error);
      return null;
    }
  }

  // Initialize profile for new user
  async initializeProfile(userId, email, fullName = '') {
    try {
      const profileData = {
        id: userId,
        avatar_url: null,
        bio: null,
        location: null,
        website: null
      };

      return await this.upsertUserProfile(profileData);
    } catch (error) {
      console.error('ProfileService: Error initializing profile:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create global instance
window.profileService = new ProfileService();
