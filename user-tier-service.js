// User Tier Service
// Handles user tier operations and permissions

let supabase = null;

// Set the global supabase instance for tier service
export function setSupabaseInstance(supabaseInstance) {
  supabase = supabaseInstance;
  console.log('✅ Supabase instance set for tier service');
}

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

export class UserTierService {
  constructor() {
    this.isInitialized = false;
  }

  // Initialize the tier service
  async initialize() {
    try {
      checkSupabaseConnection();
      console.log('🔐 Initializing User Tier Service...');
      this.isInitialized = true;
      console.log('✅ User Tier Service initialized');
      return true;
    } catch (error) {
      console.error('❌ UserTierService.initialize error:', error);
      return false;
    }
  }

  // Get current user's permissions and tier information
  async getCurrentUserPermissions() {
    try {
      checkSupabaseConnection();

      console.log('🔐 Getting current user permissions...');

      const { data, error } = await supabase.rpc('get_user_permissions');

      if (error) {
        console.error('❌ Error getting user permissions:', error);
        throw new Error(error.message);
      }

      if (data.success) {
        console.log('✅ User permissions retrieved:', data);
        return data;
      } else {
        console.error('❌ Failed to get user permissions:', data.error);
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('❌ UserTierService.getCurrentUserPermissions error:', error);
      throw error;
    }
  }

  // Get grace period status for current user
  async getGracePeriodStatus(userEmail = null) {
    try {
      checkSupabaseConnection();

      console.log('⏰ Getting grace period status...');

      const { data, error } = await supabase.rpc('get_grace_period_status', {
        user_email: userEmail
      });

      if (error) {
        console.error('❌ Error getting grace period status:', error);
        throw new Error(error.message);
      }

      if (data.success) {
        console.log('✅ Grace period status retrieved:', data);
        return data;
      } else {
        console.error('❌ Failed to get grace period status:', data.error);
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('❌ UserTierService.getGracePeriodStatus error:', error);
      throw error;
    }
  }

  // Reset expired grace periods (admin function)
  async resetExpiredGracePeriods() {
    try {
      checkSupabaseConnection();

      console.log('🔄 Resetting expired grace periods...');

      const { data, error } = await supabase.rpc('reset_expired_grace_periods');

      if (error) {
        console.error('❌ Error resetting grace periods:', error);
        throw new Error(error.message);
      }

      console.log('✅ Grace periods reset successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ UserTierService.resetExpiredGracePeriods error:', error);
      throw error;
    }
  }

  // Upgrade user to premium
  async upgradeToPremium(userEmail = null) {
    try {
      checkSupabaseConnection();

      // If no email provided, get current user's email
      if (!userEmail) {
        const currentUser = supabase.auth.getUser();
        if (currentUser) {
          userEmail = currentUser.email;
        } else {
          throw new Error('No user email provided and no current user found');
        }
      }

      console.log('🔐 Upgrading user to premium:', userEmail);

      const { data, error } = await supabase.rpc('upgrade_user_to_premium', {
        user_email: userEmail
      });

      if (error) {
        console.error('❌ Error upgrading to premium:', error);
        throw new Error(error.message);
      }

      if (data) {
        console.log('✅ User upgraded to premium successfully');
        return { success: true, message: 'User upgraded to premium successfully' };
      } else {
        console.error('❌ Failed to upgrade user to premium');
        throw new Error('Failed to upgrade user to premium');
      }
    } catch (error) {
      console.error('❌ UserTierService.upgradeToPremium error:', error);
      throw error;
    }
  }

  // Add a new user (with permission checking)
  async addNewUser(newUserEmail, newUserName = null) {
    try {
      checkSupabaseConnection();

      console.log('🔐 Adding new user:', newUserEmail);

      const { data, error } = await supabase.rpc('add_new_user', {
        new_user_email: newUserEmail,
        new_user_name: newUserName
      });

      if (error) {
        console.error('❌ Error adding new user:', error);
        throw new Error(error.message);
      }

      if (data.success) {
        console.log('✅ New user added successfully:', data);
        return data;
      } else {
        console.error('❌ Failed to add new user:', data.error);
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('❌ UserTierService.addNewUser error:', error);
      throw error;
    }
  }

  // Get all users added by current user
  async getUsersAddedByMe() {
    try {
      checkSupabaseConnection();

      console.log('🔐 Getting users added by current user...');

      const { data, error } = await supabase
        .from('user_relationships')
        .select(`
          added_user_id,
          relationship_type,
          created_at,
          expires_at,
          is_active,
          user_tiers!inner(
            email,
            tier_type,
            tier_status,
            created_at
          )
        `)
        .eq('added_by_user_id', (await supabase.auth.getUser()).data.user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error getting users added by me:', error);
        throw new Error(error.message);
      }

      console.log('✅ Users added by me retrieved:', data);
      return data;
    } catch (error) {
      console.error('❌ UserTierService.getUsersAddedByMe error:', error);
      throw error;
    }
  }

  // Check if current user can add more users
  async canAddMoreUsers() {
    try {
      const permissions = await this.getCurrentUserPermissions();
      return permissions.can_add_users;
    } catch (error) {
      console.error('❌ Error checking if user can add more users:', error);
      return false;
    }
  }

  // Get user tier information
  async getUserTierInfo(userEmail = null) {
    try {
      checkSupabaseConnection();

      let query = supabase
        .from('user_tiers')
        .select('*')
        .single();

      if (userEmail) {
        query = query.eq('email', userEmail);
      } else {
        // Use current user
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (!currentUser) {
          throw new Error('No current user found');
        }
        query = query.eq('id', currentUser.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error getting user tier info:', error);
        throw new Error(error.message);
      }

      console.log('✅ User tier info retrieved:', data);
      return data;
    } catch (error) {
      console.error('❌ UserTierService.getUserTierInfo error:', error);
      throw error;
    }
  }

  // Get all users in the system (admin function)
  async getAllUsers() {
    try {
      checkSupabaseConnection();

      console.log('🔐 Getting all users...');

      const { data, error } = await supabase
        .from('user_tiers')
        .select(`
          *,
          profiles!inner(
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error getting all users:', error);
        throw new Error(error.message);
      }

      console.log('✅ All users retrieved:', data);
      return data;
    } catch (error) {
      console.error('❌ UserTierService.getAllUsers error:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      checkSupabaseConnection();

      console.log('🔐 Getting user statistics...');

      const { data, error } = await supabase
        .from('user_tiers')
        .select('tier_type, tier_status, is_active');

      if (error) {
        console.error('❌ Error getting user stats:', error);
        throw new Error(error.message);
      }

      const stats = {
        total: data.length,
        basic: data.filter(u => u.tier_type === 'basic').length,
        premium: data.filter(u => u.tier_type === 'premium').length,
        permanent: data.filter(u => u.tier_status === 'permanent').length,
        temporary: data.filter(u => u.tier_status === 'temporary').length,
        active: data.filter(u => u.is_active).length,
        inactive: data.filter(u => !u.is_active).length
      };

      console.log('✅ User statistics retrieved:', stats);
      return stats;
    } catch (error) {
      console.error('❌ UserTierService.getUserStats error:', error);
      throw error;
    }
  }

  // Update user's last activity
  async updateLastActivity() {
    try {
      checkSupabaseConnection();

      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) {
        throw new Error('No current user found');
      }

      const { error } = await supabase
        .from('user_tiers')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', currentUser.id);

      if (error) {
        console.error('❌ Error updating last activity:', error);
        throw new Error(error.message);
      }

      console.log('✅ Last activity updated');
    } catch (error) {
      console.error('❌ UserTierService.updateLastActivity error:', error);
      // Don't throw error as this is not critical
    }
  }
}

// Create and export a singleton instance
export const userTierService = new UserTierService();
