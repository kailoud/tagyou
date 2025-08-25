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

      const { data, error } = await this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('ProfileService: Error updating profile:', error);
        // Return success false to trigger localStorage fallback
        return { success: false, error: error.message };
      }

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

      // Check if storage bucket exists and is accessible
      try {
        const { data: buckets, error: bucketError } = await this.supabase.storage.listBuckets();
        if (bucketError || !buckets.find(b => b.name === 'user-avatars')) {
          console.warn('ProfileService: Storage bucket not available, using localStorage fallback');
          return { success: false, error: 'Storage bucket not available' };
        }
      } catch (error) {
        console.warn('ProfileService: Storage not accessible, using localStorage fallback');
        return { success: false, error: 'Storage not accessible' };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('user-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

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
