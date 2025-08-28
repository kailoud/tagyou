// Premium Admin Service for Carnival Tracker
// This service handles premium user roles and admin functionality
// Designed to work alongside existing carnival tracking features

class PremiumAdminService {
  constructor() {
    this.supabase = window.supabase;
    this.currentUser = null;
    this.premiumUser = null;
    this.userRole = null;
  }

  // Initialize the premium admin service
  async initialize() {
    try {
      // Get current user
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (error) throw error;

      this.currentUser = user;

      // Check if user has premium status
      await this.loadPremiumStatus();

      // Load user role if premium
      if (this.premiumUser) {
        await this.loadUserRole();
      }

      console.log('Premium Admin Service initialized');
      return true;
    } catch (error) {
      console.error('Error initializing Premium Admin Service:', error);
      return false;
    }
  }

  // Load premium status for current user
  async loadPremiumStatus() {
    try {
      const { data, error } = await this.supabase
        .from('premium_users')
        .select('*')
        .eq('email', this.currentUser.email)
        .eq('is_premium', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      this.premiumUser = data;
      return data;
    } catch (error) {
      console.error('Error loading premium status:', error);
      return null;
    }
  }

  // Load user role for premium user
  async loadUserRole() {
    try {
      const { data, error } = await this.supabase
        .from('premium_user_roles')
        .select('*')
        .eq('premium_user_id', this.premiumUser.id)
        .eq('user_id', this.currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      this.userRole = data;
      return data;
    } catch (error) {
      console.error('Error loading user role:', error);
      return null;
    }
  }

  // Check if user has admin permissions
  hasAdminPermission(permission) {
    if (!this.userRole) return false;

    switch (permission) {
      case 'add_members':
        return this.userRole.can_add_members;
      case 'delete_members':
        return this.userRole.can_delete_members;
      case 'manage_settings':
        return this.userRole.can_manage_squad_settings;
      case 'view_analytics':
        return this.userRole.can_view_analytics;
      default:
        return false;
    }
  }

  // Get squad members for premium user
  async getSquadMembers() {
    try {
      const { data, error } = await this.supabase
        .from('carnival_squad_members')
        .select(`
                    *,
                    squad_member_groups (
                        group_id,
                        squad_groups (
                            id,
                            name,
                            color
                        )
                    )
                `)
        .eq('user_id', this.currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching squad members:', error);
      return [];
    }
  }

  // Add new squad member
  async addSquadMember(memberData) {
    if (!this.hasAdminPermission('add_members')) {
      throw new Error('Insufficient permissions to add squad members');
    }

    try {
      const { data, error } = await this.supabase
        .from('carnival_squad_members')
        .insert([{
          user_id: this.currentUser.id,
          name: memberData.name,
          phone: memberData.phone,
          relationship: memberData.relationship,
          email: memberData.email,
          is_sharing: false
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding squad member:', error);
      throw error;
    }
  }

  // Delete squad member
  async deleteSquadMember(memberId) {
    if (!this.hasAdminPermission('delete_members')) {
      throw new Error('Insufficient permissions to delete squad members');
    }

    try {
      const { error } = await this.supabase
        .from('carnival_squad_members')
        .delete()
        .eq('id', memberId)
        .eq('user_id', this.currentUser.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting squad member:', error);
      throw error;
    }
  }

  // Get squad groups
  async getSquadGroups() {
    try {
      const { data, error } = await this.supabase
        .from('squad_groups')
        .select('*')
        .eq('premium_user_id', this.premiumUser.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching squad groups:', error);
      return [];
    }
  }

  // Create new squad group
  async createSquadGroup(groupData) {
    if (!this.hasAdminPermission('manage_settings')) {
      throw new Error('Insufficient permissions to create groups');
    }

    try {
      const { data, error } = await this.supabase
        .from('squad_groups')
        .insert([{
          premium_user_id: this.premiumUser.id,
          name: groupData.name,
          description: groupData.description,
          color: groupData.color || '#3B82F6'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating squad group:', error);
      throw error;
    }
  }

  // Add member to group
  async addMemberToGroup(memberId, groupId) {
    if (!this.hasAdminPermission('manage_settings')) {
      throw new Error('Insufficient permissions to manage groups');
    }

    try {
      const { data, error } = await this.supabase
        .from('squad_member_groups')
        .insert([{
          squad_member_id: memberId,
          group_id: groupId,
          added_by: this.currentUser.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding member to group:', error);
      throw error;
    }
  }

  // Remove member from group
  async removeMemberFromGroup(memberId, groupId) {
    if (!this.hasAdminPermission('manage_settings')) {
      throw new Error('Insufficient permissions to manage groups');
    }

    try {
      const { error } = await this.supabase
        .from('squad_member_groups')
        .delete()
        .eq('squad_member_id', memberId)
        .eq('group_id', groupId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing member from group:', error);
      throw error;
    }
  }

  // Get safety alerts
  async getSafetyAlerts() {
    try {
      const { data, error } = await this.supabase
        .from('safety_alerts')
        .select(`
                    *,
                    carnival_squad_members (
                        id,
                        name,
                        phone
                    )
                `)
        .eq('user_id', this.currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching safety alerts:', error);
      return [];
    }
  }

  // Create safety alert
  async createSafetyAlert(alertData) {
    try {
      const { data, error } = await this.supabase
        .from('safety_alerts')
        .insert([{
          user_id: this.currentUser.id,
          squad_member_id: alertData.squad_member_id,
          alert_type: alertData.alert_type,
          location_lat: alertData.location_lat,
          location_lng: alertData.location_lng,
          location_area: alertData.location_area,
          message: alertData.message
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating safety alert:', error);
      throw error;
    }
  }

  // Resolve safety alert
  async resolveSafetyAlert(alertId) {
    try {
      const { data, error } = await this.supabase
        .from('safety_alerts')
        .update({
          status: 'resolved',
          resolved_by: this.currentUser.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId)
        .eq('user_id', this.currentUser.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error resolving safety alert:', error);
      throw error;
    }
  }

  // Send squad message
  async sendSquadMessage(messageData) {
    try {
      const { data, error } = await this.supabase
        .from('squad_messages')
        .insert([{
          sender_id: this.currentUser.id,
          squad_member_id: messageData.squad_member_id,
          message_type: messageData.message_type || 'text',
          message_text: messageData.message_text,
          location_data: messageData.location_data,
          media_urls: messageData.media_urls
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending squad message:', error);
      throw error;
    }
  }

  // Get squad messages
  async getSquadMessages(memberId = null) {
    try {
      let query = this.supabase
        .from('squad_messages')
        .select(`
                    *,
                    carnival_squad_members (
                        id,
                        name
                    )
                `)
        .eq('sender_id', this.currentUser.id)
        .order('created_at', { ascending: false });

      if (memberId) {
        query = query.eq('squad_member_id', memberId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching squad messages:', error);
      return [];
    }
  }

  // Get dashboard analytics
  async getDashboardAnalytics() {
    if (!this.hasAdminPermission('view_analytics')) {
      throw new Error('Insufficient permissions to view analytics');
    }

    try {
      const { data, error } = await this.supabase
        .from('premium_user_dashboard')
        .select('*')
        .eq('premium_user_id', this.premiumUser.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      return null;
    }
  }

  // Get squad member summary
  async getSquadMemberSummary() {
    try {
      const { data, error } = await this.supabase
        .from('squad_member_summary')
        .select('*')
        .order('last_update', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching squad member summary:', error);
      return [];
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(preferences) {
    try {
      const { data, error } = await this.supabase
        .from('notification_preferences')
        .upsert([{
          user_id: this.currentUser.id,
          ...preferences
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // Get notification preferences
  async getNotificationPreferences() {
    try {
      const { data, error } = await this.supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  // Log user activity
  async logActivity(activityType, activityData = {}) {
    try {
      const { error } = await this.supabase
        .from('user_activity_log')
        .insert([{
          user_id: this.currentUser.id,
          activity_type: activityType,
          activity_data: activityData,
          ip_address: null, // Could be set from request context
          user_agent: navigator.userAgent
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error logging activity:', error);
      return false;
    }
  }

  // Check if user is premium
  isPremium() {
    return this.premiumUser !== null;
  }

  // Get current user role
  getCurrentRole() {
    return this.userRole;
  }

  // Get premium user info
  getPremiumUser() {
    return this.premiumUser;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PremiumAdminService;
} else {
  // Browser environment
  window.PremiumAdminService = PremiumAdminService;
}
