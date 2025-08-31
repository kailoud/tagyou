// TagYou Data Integration Service
// Fetches data from tagyou.org and syncs with local Supabase

class TagYouDataService {
  constructor() {
    this.tagyouApiUrl = 'https://tagyou.org/api'; // Adjust this to your actual API endpoint
    this.supabaseClient = null;
    this.isInitialized = false;
  }

  async initialize(supabaseClient) {
    try {
      console.log('🔗 TagYou Data Service: Initializing...');
      this.supabaseClient = supabaseClient;
      this.isInitialized = true;
      console.log('✅ TagYou Data Service: Initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ TagYou Data Service: Initialization failed:', error);
      return false;
    }
  }

  // Fetch carnivals from tagyou.org
  async fetchCarnivalsFromTagYou() {
    try {
      console.log('🌐 Fetching carnivals from tagyou.org...');

      // Example API call - adjust based on your actual API structure
      const response = await fetch(`${this.tagyouApiUrl}/carnivals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers if needed
          // 'Authorization': 'Bearer your-api-key'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const carnivals = await response.json();
      console.log('✅ Carnivals fetched from tagyou.org:', carnivals);
      return carnivals;
    } catch (error) {
      console.error('❌ Failed to fetch carnivals from tagyou.org:', error);
      return null;
    }
  }

  // Fetch users from tagyou.org
  async fetchUsersFromTagYou() {
    try {
      console.log('👥 Fetching users from tagyou.org...');

      const response = await fetch(`${this.tagyouApiUrl}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const users = await response.json();
      console.log('✅ Users fetched from tagyou.org:', users);
      return users;
    } catch (error) {
      console.error('❌ Failed to fetch users from tagyou.org:', error);
      return null;
    }
  }

  // Sync carnivals to local Supabase
  async syncCarnivalsToSupabase() {
    try {
      console.log('🔄 Syncing carnivals to Supabase...');

      const carnivals = await this.fetchCarnivalsFromTagYou();
      if (!carnivals) {
        throw new Error('No carnivals data received from tagyou.org');
      }

      // Clear existing carnivals
      const { error: deleteError } = await this.supabaseClient
        .from('carnivals')
        .delete()
        .neq('id', 0); // Delete all records

      if (deleteError) {
        console.warn('⚠️ Error clearing existing carnivals:', deleteError);
      }

      // Insert new carnivals
      const { data, error } = await this.supabaseClient
        .from('carnivals')
        .insert(carnivals);

      if (error) {
        throw new Error(`Failed to sync carnivals: ${error.message}`);
      }

      console.log('✅ Carnivals synced to Supabase:', data);
      return data;
    } catch (error) {
      console.error('❌ Failed to sync carnivals:', error);
      return null;
    }
  }

  // Sync users to local Supabase
  async syncUsersToSupabase() {
    try {
      console.log('🔄 Syncing users to Supabase...');

      const users = await this.fetchUsersFromTagYou();
      if (!users) {
        throw new Error('No users data received from tagyou.org');
      }

      // Process each user
      for (const user of users) {
        // Check if user already exists
        const { data: existingUser } = await this.supabaseClient
          .from('profiles')
          .select('id')
          .eq('email', user.email)
          .single();

        if (existingUser) {
          // Update existing user
          const { error } = await this.supabaseClient
            .from('profiles')
            .update({
              full_name: user.full_name,
              avatar_url: user.avatar_url,
              updated_at: new Date().toISOString()
            })
            .eq('email', user.email);

          if (error) {
            console.warn(`⚠️ Failed to update user ${user.email}:`, error);
          }
        } else {
          // Insert new user
          const { error } = await this.supabaseClient
            .from('profiles')
            .insert({
              email: user.email,
              full_name: user.full_name,
              avatar_url: user.avatar_url,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (error) {
            console.warn(`⚠️ Failed to insert user ${user.email}:`, error);
          }
        }
      }

      console.log('✅ Users synced to Supabase');
      return true;
    } catch (error) {
      console.error('❌ Failed to sync users:', error);
      return false;
    }
  }

  // Full sync - sync both carnivals and users
  async fullSync() {
    try {
      console.log('🔄 Starting full sync from tagyou.org...');

      const carnivalResult = await this.syncCarnivalsToSupabase();
      const userResult = await this.syncUsersToSupabase();

      if (carnivalResult && userResult) {
        console.log('✅ Full sync completed successfully');
        return true;
      } else {
        console.warn('⚠️ Partial sync completed with some errors');
        return false;
      }
    } catch (error) {
      console.error('❌ Full sync failed:', error);
      return false;
    }
  }

  // Get sync status
  async getSyncStatus() {
    try {
      const [carnivalCount, userCount] = await Promise.all([
        this.supabaseClient.from('carnivals').select('id', { count: 'exact' }),
        this.supabaseClient.from('profiles').select('id', { count: 'exact' })
      ]);

      return {
        carnivals: carnivalCount.count || 0,
        users: userCount.count || 0,
        lastSync: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to get sync status:', error);
      return null;
    }
  }
}

// Create and export singleton instance
const tagYouDataService = new TagYouDataService();
export default tagYouDataService;
