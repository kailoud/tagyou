// Admin Panel JavaScript
// Handles data integration between tagyou.org and local application

import supabaseConfig from './supabase-config-secret.js';
import tagYouDataService from './tagyou-data-service.js';

class AdminPanel {
  constructor() {
    this.supabaseClient = null;
    this.isInitialized = false;
    this.init();
  }

  async init() {
    try {
      console.log('🔧 Admin Panel: Initializing...');
      this.addLog('info', 'Admin panel initializing...');

      // Initialize Supabase
      await this.initializeSupabase();

      // Initialize TagYou Data Service
      await tagYouDataService.initialize(this.supabaseClient);

      // Set up event listeners
      this.setupEventListeners();

      // Load initial data
      await this.loadStats();
      await this.checkConnectionStatus();

      this.isInitialized = true;
      this.addLog('success', 'Admin panel initialized successfully');
      console.log('✅ Admin Panel: Initialized successfully');
    } catch (error) {
      console.error('❌ Admin Panel: Initialization failed:', error);
      this.addLog('error', `Initialization failed: ${error.message}`);
    }
  }

  async initializeSupabase() {
    try {
      // Use global Supabase client
      if (!window.supabase || !window.supabase.createClient) {
        throw new Error('Supabase client not available');
      }

      this.supabaseClient = window.supabase.createClient(
        supabaseConfig.supabaseUrl,
        supabaseConfig.supabaseAnonKey
      );

      this.addLog('info', 'Supabase client initialized');
    } catch (error) {
      throw new Error(`Failed to initialize Supabase: ${error.message}`);
    }
  }

  setupEventListeners() {
    // Sync buttons
    document.getElementById('syncCarnivals').addEventListener('click', () => {
      this.syncCarnivals();
    });

    document.getElementById('syncUsers').addEventListener('click', () => {
      this.syncUsers();
    });

    document.getElementById('fullSync').addEventListener('click', () => {
      this.fullSync();
    });

    document.getElementById('refreshStats').addEventListener('click', () => {
      this.loadStats();
    });
  }

  async loadStats() {
    try {
      this.addLog('info', 'Loading statistics...');

      // Get local stats
      const [usersResult, carnivalsResult] = await Promise.all([
        this.supabaseClient.from('profiles').select('id', { count: 'exact' }),
        this.supabaseClient.from('carnivals').select('id', { count: 'exact' })
      ]);

      // Update UI
      document.getElementById('localUsers').textContent = usersResult.count || 0;
      document.getElementById('localCarnivals').textContent = carnivalsResult.count || 0;

      this.addLog('success', `Stats loaded: ${usersResult.count || 0} users, ${carnivalsResult.count || 0} carnivals`);
    } catch (error) {
      console.error('❌ Failed to load stats:', error);
      this.addLog('error', `Failed to load stats: ${error.message}`);
    }
  }

  async checkConnectionStatus() {
    try {
      this.addLog('info', 'Checking connection to tagyou.org...');

      const response = await fetch('https://tagyou.org/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const statusIndicator = document.getElementById('connectionStatus');
      const connectionText = document.getElementById('connectionText');

      if (response.ok) {
        statusIndicator.className = 'status-indicator status-online';
        connectionText.textContent = 'Online';
        this.addLog('success', 'Connection to tagyou.org established');
      } else {
        statusIndicator.className = 'status-indicator status-offline';
        connectionText.textContent = 'Offline';
        this.addLog('warning', 'Connection to tagyou.org failed');
      }
    } catch (error) {
      const statusIndicator = document.getElementById('connectionStatus');
      const connectionText = document.getElementById('connectionText');

      statusIndicator.className = 'status-indicator status-offline';
      connectionText.textContent = 'Error';

      this.addLog('error', `Connection check failed: ${error.message}`);
    }
  }

  async syncCarnivals() {
    try {
      this.setButtonLoading('syncCarnivals', true);
      this.addLog('info', 'Starting carnival synchronization...');

      const result = await tagYouDataService.syncCarnivalsToSupabase();

      if (result) {
        this.addLog('success', `Carnivals synced successfully: ${result.length} carnivals`);
        await this.loadStats();
        this.updateLastSync();
      } else {
        this.addLog('error', 'Carnival sync failed');
      }
    } catch (error) {
      console.error('❌ Carnival sync failed:', error);
      this.addLog('error', `Carnival sync failed: ${error.message}`);
    } finally {
      this.setButtonLoading('syncCarnivals', false);
    }
  }

  async syncUsers() {
    try {
      this.setButtonLoading('syncUsers', true);
      this.addLog('info', 'Starting user synchronization...');

      const result = await tagYouDataService.syncUsersToSupabase();

      if (result) {
        this.addLog('success', 'Users synced successfully');
        await this.loadStats();
        this.updateLastSync();
      } else {
        this.addLog('error', 'User sync failed');
      }
    } catch (error) {
      console.error('❌ User sync failed:', error);
      this.addLog('error', `User sync failed: ${error.message}`);
    } finally {
      this.setButtonLoading('syncUsers', false);
    }
  }

  async fullSync() {
    try {
      this.setButtonLoading('fullSync', true);
      this.addLog('info', 'Starting full synchronization...');

      const result = await tagYouDataService.fullSync();

      if (result) {
        this.addLog('success', 'Full sync completed successfully');
        await this.loadStats();
        this.updateLastSync();
      } else {
        this.addLog('warning', 'Full sync completed with some errors');
      }
    } catch (error) {
      console.error('❌ Full sync failed:', error);
      this.addLog('error', `Full sync failed: ${error.message}`);
    } finally {
      this.setButtonLoading('fullSync', false);
    }
  }

  setButtonLoading(buttonId, loading) {
    const button = document.getElementById(buttonId);
    const icon = button.querySelector('i');
    const text = button.querySelector('span') || button.lastChild;

    if (loading) {
      button.disabled = true;
      icon.style.display = 'none';
      button.insertBefore(this.createLoadingSpinner(), button.firstChild);
    } else {
      button.disabled = false;
      icon.style.display = 'inline';
      const spinner = button.querySelector('.loading');
      if (spinner) {
        spinner.remove();
      }
    }
  }

  createLoadingSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'loading';
    return spinner;
  }

  updateLastSync() {
    const now = new Date();
    const timeString = now.toLocaleString();

    document.getElementById('lastSync').textContent = timeString;
    document.getElementById('lastSyncTime').textContent = timeString;
  }

  addLog(type, message) {
    const logContainer = document.getElementById('logContainer');
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;

    const timestamp = new Date().toLocaleTimeString();
    const icon = this.getLogIcon(type);

    logEntry.innerHTML = `
      <i class="${icon}"></i> 
      [${timestamp}] ${message}
    `;

    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;

    // Keep only last 100 log entries
    while (logContainer.children.length > 100) {
      logContainer.removeChild(logContainer.firstChild);
    }
  }

  getLogIcon(type) {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
      default:
        return 'fas fa-info-circle';
    }
  }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AdminPanel();
});
