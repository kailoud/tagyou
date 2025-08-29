// Improved Carnival Squad UI with Better Performance and Data Synchronization
// Fixes loading delays and data visibility issues

class ImprovedCarnivalSquadUI {
  constructor() {
    this.people = [];
    this.isLoading = false;
    this.lastSyncTime = null;
    this.syncInterval = null;
    this.retryAttempts = 0;
    this.maxRetries = 3;
    this.currentUser = null;
    this.isPremium = false;
    this.userTier = 'Basic';
    this.isAuthenticated = false; // New flag to track authentication status

    // Performance optimization flags
    this.isInitialized = false;
    this.pendingUpdates = [];
    this.debounceTimer = null;

    // UI state
    this.isVisible = false;
    this.activeTab = "tracker";
    this.searchTerm = "";

    this.init();
  }

  async init() {
    console.log('🚀 Initializing Improved Carnival Squad UI...');

    // Create UI elements
    this.createUI();
    this.setupEventListeners();

    // Initialize with better error handling
    await this.initializeWithRetry();

    // Set up auto-refresh only if authenticated
    if (this.isAuthenticated) {
      this.setupAutoRefresh();
    }

    console.log('✅ Improved Carnival Squad UI initialized');
  }

  createUI() {
    // Create main container if it doesn't exist
    let container = document.getElementById('carnivalSquadContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'carnivalSquadContainer';
      container.className = 'carnival-squad-container';
      document.body.appendChild(container);
    }

    container.innerHTML = `
      <div class="carnival-squad-header">
        <h2>🎭 Carnival Squad</h2>
        <div class="sync-status">
          <span id="syncStatus" class="sync-indicator">🔄 Syncing...</span>
          <button id="refreshBtn" class="refresh-btn" title="Refresh Data">🔄</button>
        </div>
      </div>
      
      <div class="carnival-squad-content">
        <div class="loading-overlay" id="loadingOverlay">
          <div class="spinner"></div>
          <p>Loading squad data...</p>
        </div>
        
        <!-- Authentication Required State -->
        <div id="authRequiredState" class="auth-required-state" style="display: none;">
          <div class="auth-message">
            <h3>🔐 Sign In Required</h3>
            <p>To use Carnival Squad features, please sign in to your account.</p>
            <div class="auth-actions">
              <button id="signInBtn" class="btn-primary">Sign In</button>
              <button id="signUpBtn" class="btn-secondary">Sign Up</button>
            </div>
            <div class="demo-mode-notice">
              <p><strong>Demo Mode:</strong> You can view the interface but cannot add or modify squad members.</p>
            </div>
          </div>
        </div>
        
        <!-- Authenticated Content -->
        <div id="authenticatedContent" class="authenticated-content">
          <div class="squad-stats">
            <div class="stat-item">
              <span class="stat-number" id="memberCount">0</span>
              <span class="stat-label">Members</span>
            </div>
            <div class="stat-item">
              <span class="stat-number" id="sharingCount">0</span>
              <span class="stat-label">Sharing</span>
            </div>
            <div class="stat-item">
              <span class="stat-number" id="premiumStatus">Basic</span>
              <span class="stat-label">Tier</span>
            </div>
          </div>
          
          <div class="squad-members" id="squadMembers">
            <div class="empty-state" id="emptyState">
              <p>No squad members found</p>
              <button id="addFirstMember" class="add-member-btn">Add Your First Member</button>
            </div>
          </div>
          
          <div class="add-member-section">
            <button id="addMemberBtn" class="add-member-btn">+ Add Squad Member</button>
          </div>
        </div>
      </div>
      
      <!-- Add Member Modal -->
      <div id="addMemberModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Add Squad Member</h3>
            <span class="close">&times;</span>
          </div>
          <div class="modal-body">
            <form id="addMemberForm">
              <div class="form-group">
                <label for="memberName">Name *</label>
                <input type="text" id="memberName" required>
              </div>
              <div class="form-group">
                <label for="memberPhone">Phone</label>
                <input type="tel" id="memberPhone">
              </div>
              <div class="form-group">
                <label for="memberEmail">Email</label>
                <input type="email" id="memberEmail">
              </div>
              <div class="form-group">
                <label for="memberRelationship">Relationship</label>
                <select id="memberRelationship">
                  <option value="Friend">Friend</option>
                  <option value="Family">Family</option>
                  <option value="Partner">Partner</option>
                  <option value="Child">Child</option>
                  <option value="Colleague">Colleague</option>
                </select>
              </div>
              <div class="form-actions">
                <button type="button" class="btn-secondary" id="cancelAdd">Cancel</button>
                <button type="submit" class="btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    // Add CSS styles
    this.addStyles();
  }

  addStyles() {
    const styleId = 'carnival-squad-improved-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .carnival-squad-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        margin: 20px;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .carnival-squad-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .carnival-squad-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
      }

      .sync-status {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .sync-indicator {
        font-size: 0.9rem;
        opacity: 0.9;
      }

      .refresh-btn {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .refresh-btn:hover {
        background: rgba(255,255,255,0.3);
      }

      .carnival-squad-content {
        padding: 20px;
        position: relative;
        min-height: 200px;
      }

      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255,255,255,0.9);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 10px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .auth-required-state {
        text-align: center;
        padding: 40px 20px;
      }

      .auth-message h3 {
        color: #495057;
        margin-bottom: 15px;
        font-size: 1.5rem;
      }

      .auth-message p {
        color: #6c757d;
        margin-bottom: 25px;
        font-size: 1.1rem;
      }

      .auth-actions {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-bottom: 30px;
      }

      .demo-mode-notice {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 8px;
        padding: 15px;
        margin-top: 20px;
      }

      .demo-mode-notice p {
        margin: 0;
        color: #856404;
        font-size: 0.9rem;
      }

      .authenticated-content {
        display: none;
      }

      .authenticated-content.show {
        display: block;
      }

      .squad-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        margin-bottom: 20px;
      }

      .stat-item {
        text-align: center;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .stat-number {
        display: block;
        font-size: 1.5rem;
        font-weight: bold;
        color: #667eea;
      }

      .stat-label {
        font-size: 0.9rem;
        color: #6c757d;
        margin-top: 5px;
      }

      .squad-members {
        margin-bottom: 20px;
      }

      .member-card {
        background: white;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 15px;
        transition: box-shadow 0.2s;
      }

      .member-card:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      .member-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 1.2rem;
      }

      .member-info {
        flex: 1;
      }

      .member-name {
        font-weight: 600;
        margin-bottom: 5px;
      }

      .member-details {
        font-size: 0.9rem;
        color: #6c757d;
      }

      .member-status {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 5px;
      }

      .sharing-indicator {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 500;
      }

      .sharing-indicator.sharing {
        background: #d4edda;
        color: #155724;
      }

      .sharing-indicator.not-sharing {
        background: #f8d7da;
        color: #721c24;
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: #6c757d;
      }

      .add-member-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: transform 0.2s;
      }

      .add-member-btn:hover {
        transform: translateY(-2px);
      }

      .add-member-btn:disabled {
        background: #6c757d;
        cursor: not-allowed;
        transform: none;
      }

      .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
      }

      .modal-content {
        background-color: white;
        margin: 10% auto;
        padding: 0;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      }

      .modal-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 12px 12px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .modal-header h3 {
        margin: 0;
      }

      .close {
        color: white;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
      }

      .modal-body {
        padding: 20px;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #495057;
      }

      .form-group input,
      .form-group select {
        width: 100%;
        padding: 12px;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.3s;
      }

      .form-group input:focus,
      .form-group select:focus {
        outline: none;
        border-color: #667eea;
      }

      .form-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
      }

      .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
      }

      .btn-secondary {
        background: #6c757d;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
      }

      .error-message {
        background: #f8d7da;
        color: #721c24;
        padding: 10px;
        border-radius: 6px;
        margin-bottom: 15px;
        font-size: 0.9rem;
      }

      .success-message {
        background: #d4edda;
        color: #155724;
        padding: 10px;
        border-radius: 6px;
        margin-bottom: 15px;
        font-size: 0.9rem;
      }

      .auth-required-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255,255,255,0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 5;
      }

      .auth-required-overlay .auth-prompt {
        text-align: center;
        padding: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        max-width: 400px;
      }

      .auth-required-overlay h4 {
        color: #495057;
        margin-bottom: 10px;
      }

      .auth-required-overlay p {
        color: #6c757d;
        margin-bottom: 15px;
      }
    `;

    document.head.appendChild(style);
  }

  setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.handleRefresh());
    }

    // Add member button
    const addMemberBtn = document.getElementById('addMemberBtn');
    if (addMemberBtn) {
      addMemberBtn.addEventListener('click', () => this.handleAddMemberClick());
    }

    // Add first member button
    const addFirstMember = document.getElementById('addFirstMember');
    if (addFirstMember) {
      addFirstMember.addEventListener('click', () => this.handleAddMemberClick());
    }

    // Sign in/up buttons
    const signInBtn = document.getElementById('signInBtn');
    const signUpBtn = document.getElementById('signUpBtn');

    if (signInBtn) {
      signInBtn.addEventListener('click', () => this.triggerAvatarSignIn());
    }

    if (signUpBtn) {
      signUpBtn.addEventListener('click', () => this.triggerAvatarSignUp());
    }

    // Modal events
    const modal = document.getElementById('addMemberModal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelAdd');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideAddMemberModal());
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hideAddMemberModal());
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideAddMemberModal();
        }
      });
    }

    // Form submission
    const form = document.getElementById('addMemberForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddMember();
      });
    }
  }

  async initializeWithRetry() {
    this.retryAttempts = 0;
    await this.performInitialization();
  }

  async performInitialization() {
    try {
      this.showLoading(true);

      // Check authentication status first
      await this.checkAuthenticationStatus();

      if (!this.isAuthenticated) {
        // Show unauthenticated state
        this.showUnauthenticatedState();
        this.updateSyncStatus('🔒 Sign in required');
        return;
      }

      // Wait for avatar system to be ready
      await this.waitForAvatarSystem();

      // Get current user
      this.currentUser = await this.getCurrentUser();

      if (!this.currentUser) {
        console.log('⚠️ No user found, showing unauthenticated state');
        this.showUnauthenticatedState();
        return;
      }

      // Check premium status
      await this.checkPremiumStatus();

      // Load squad data
      await this.loadSquadData();

      // Update UI
      this.updateStats();
      this.renderSquadMembers();

      this.isInitialized = true;
      this.updateSyncStatus('✅ Synced');

      // Show authenticated content
      this.showAuthenticatedState();

    } catch (error) {
      console.error('❌ Initialization failed:', error);
      this.retryAttempts++;

      if (this.retryAttempts < this.maxRetries) {
        console.log(`🔄 Retrying initialization (${this.retryAttempts}/${this.maxRetries})...`);
        setTimeout(() => this.performInitialization(), 1000 * this.retryAttempts);
      } else {
        console.log('❌ Max retries reached, showing error state');
        this.showErrorState('Failed to load squad data. Please refresh the page.');
      }
    } finally {
      this.showLoading(false);
    }
  }

  async checkAuthenticationStatus() {
    try {
      // Check multiple sources for authentication
      const sources = [
        () => window.avatarSystem?.user,
        () => {
          try {
            const stored = sessionStorage.getItem('supabase_user');
            return stored ? JSON.parse(stored) : null;
          } catch (e) {
            return null;
          }
        },
        async () => {
          if (window.supabase) {
            const { data: { user } } = await window.supabase.auth.getUser();
            return user;
          }
          return null;
        }
      ];

      for (const source of sources) {
        try {
          const user = await source();
          if (user) {
            this.isAuthenticated = true;
            console.log('✅ User authenticated:', user.email);
            return;
          }
        } catch (error) {
          console.log('⚠️ Auth source failed:', error);
        }
      }

      this.isAuthenticated = false;
      console.log('⚠️ No authenticated user found');

    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      this.isAuthenticated = false;
    }
  }

  showUnauthenticatedState() {
    const authRequiredState = document.getElementById('authRequiredState');
    const authenticatedContent = document.getElementById('authenticatedContent');

    if (authRequiredState) authRequiredState.style.display = 'block';
    if (authenticatedContent) authenticatedContent.classList.remove('show');

    // Disable features when not authenticated
    this.updateFeatureAccessibility();

    console.log('🔒 Showing unauthenticated state');
  }

  showAuthenticatedState() {
    const authRequiredState = document.getElementById('authRequiredState');
    const authenticatedContent = document.getElementById('authenticatedContent');

    if (authRequiredState) authRequiredState.style.display = 'none';
    if (authenticatedContent) authenticatedContent.classList.add('show');

    // Enable features when authenticated
    this.updateFeatureAccessibility();

    console.log('✅ Showing authenticated state');
  }

  updateFeatureAccessibility() {
    const refreshBtn = document.getElementById('refreshBtn');
    const addMemberBtn = document.getElementById('addMemberBtn');
    const addFirstMember = document.getElementById('addFirstMember');

    if (!this.isAuthenticated) {
      // Disable refresh button
      if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.title = 'Sign in required to refresh data';
        refreshBtn.style.opacity = '0.5';
        refreshBtn.style.cursor = 'not-allowed';
      }

      // Disable add member buttons
      if (addMemberBtn) {
        addMemberBtn.disabled = true;
        addMemberBtn.title = 'Sign in required to add members';
        addMemberBtn.style.opacity = '0.5';
        addMemberBtn.style.cursor = 'not-allowed';
      }

      if (addFirstMember) {
        addFirstMember.disabled = true;
        addFirstMember.title = 'Sign in required to add members';
        addFirstMember.style.opacity = '0.5';
        addFirstMember.style.cursor = 'not-allowed';
      }
    } else {
      // Enable features when authenticated
      if (refreshBtn) {
        refreshBtn.disabled = false;
        refreshBtn.title = 'Refresh Data';
        refreshBtn.style.opacity = '1';
        refreshBtn.style.cursor = 'pointer';
      }

      if (addMemberBtn) {
        addMemberBtn.disabled = false;
        addMemberBtn.title = 'Add Squad Member';
        addMemberBtn.style.opacity = '1';
        addMemberBtn.style.cursor = 'pointer';
      }

      if (addFirstMember) {
        addFirstMember.disabled = false;
        addFirstMember.title = 'Add Your First Member';
        addFirstMember.style.opacity = '1';
        addFirstMember.style.cursor = 'pointer';
      }
    }
  }

  triggerAvatarSignIn() {
    console.log('🔐 Triggering avatar sign in...');

    // Try to trigger the avatar system sign in
    if (window.avatarSystem && window.avatarSystem.showSignInModal) {
      window.avatarSystem.showSignInModal();
    } else if (window.avatarSystem && window.avatarSystem.toggleDropdown) {
      window.avatarSystem.toggleDropdown();
    } else {
      // Fallback: show a message to sign in
      this.showErrorMessage('Please sign in using the avatar dropdown in the top right corner.');
    }
  }

  triggerAvatarSignUp() {
    console.log('🔐 Triggering avatar sign up...');

    // Try to trigger the avatar system sign up
    if (window.avatarSystem && window.avatarSystem.showSignUpModal) {
      window.avatarSystem.showSignUpModal();
    } else if (window.avatarSystem && window.avatarSystem.toggleDropdown) {
      window.avatarSystem.toggleDropdown();
    } else {
      // Fallback: show a message to sign up
      this.showErrorMessage('Please sign up using the avatar dropdown in the top right corner.');
    }
  }

  handleRefresh() {
    if (!this.isAuthenticated) {
      this.triggerAvatarSignIn();
      return;
    }

    this.refreshData();
  }

  handleAddMemberClick() {
    if (!this.isAuthenticated) {
      this.triggerAvatarSignIn();
      return;
    }

    this.showAddMemberModal();
  }

  async waitForAvatarSystem() {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max

    while (!window.avatarSystem && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.avatarSystem) {
      throw new Error('Avatar system not available');
    }

    // Wait for user to be loaded
    attempts = 0;
    while (!window.avatarSystem.user && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
  }

  async getCurrentUser() {
    // Try multiple sources for current user
    const sources = [
      () => window.avatarSystem?.user,
      () => {
        try {
          const stored = sessionStorage.getItem('supabase_user');
          return stored ? JSON.parse(stored) : null;
        } catch (e) {
          return null;
        }
      },
      async () => {
        if (window.supabase) {
          const { data: { user } } = await window.supabase.auth.getUser();
          return user;
        }
        return null;
      }
    ];

    for (const source of sources) {
      try {
        const user = await source();
        if (user) {
          console.log('✅ Found user:', user.email);
          return user;
        }
      } catch (error) {
        console.log('⚠️ User source failed:', error);
      }
    }

    return null;
  }

  async checkPremiumStatus() {
    try {
      const email = this.currentUser?.email;
      if (!email) {
        this.setUserTier('Basic');
        return;
      }

      // Check localStorage first
      const premiumStatus = localStorage.getItem(`premium_${email}`);
      if (premiumStatus === 'true') {
        this.setUserTier('Premium');
        return;
      }

      // Check Supabase
      if (window.PremiumUsersService) {
        const isPremium = await window.PremiumUsersService.isPremiumUser(email);
        if (isPremium) {
          this.setUserTier('Premium');
          localStorage.setItem(`premium_${email}`, 'true');
          return;
        }
      }

      // Fallback to local list
      const premiumEmails = ['kaycheckmate@gmail.com', 'truesliks@gmail.com'];
      if (premiumEmails.includes(email.toLowerCase())) {
        this.setUserTier('Premium');
        localStorage.setItem(`premium_${email}`, 'true');
        return;
      }

      this.setUserTier('Basic');
    } catch (error) {
      console.error('❌ Error checking premium status:', error);
      this.setUserTier('Basic');
    }
  }

  setUserTier(tier) {
    this.userTier = tier;
    this.isPremium = tier === 'Premium';
    console.log(`🎯 User tier set to: ${tier}`);
  }

  async loadSquadData() {
    try {
      if (!this.currentUser) {
        throw new Error('No current user');
      }

      const supabaseInstance = window.getSupabaseClient ? window.getSupabaseClient() : (window.supabaseClient || window.supabase);

      if (!supabaseInstance) {
        throw new Error('Supabase not available');
      }

      const { data, error } = await supabaseInstance
        .from('carnival_squad_members')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      this.people = data.map(member => ({
        id: member.id,
        name: member.name,
        phone: member.phone,
        relationship: member.relationship,
        email: member.email,
        isSharing: member.is_sharing,
        location: member.location_lat && member.location_lng ? {
          latitude: member.location_lat,
          longitude: member.location_lng,
          area: member.location_area
        } : null,
        lastUpdate: new Date(member.last_update),
        avatar: member.avatar_data || this.generateAvatar(member.name)
      }));

      this.lastSyncTime = new Date();
      console.log(`✅ Loaded ${this.people.length} squad members`);

    } catch (error) {
      console.error('❌ Error loading squad data:', error);
      throw error;
    }
  }

  generateAvatar(name) {
    if (!name) return '👤';
    return name.charAt(0).toUpperCase();
  }

  updateStats() {
    const memberCount = document.getElementById('memberCount');
    const sharingCount = document.getElementById('sharingCount');
    const premiumStatus = document.getElementById('premiumStatus');

    if (memberCount) memberCount.textContent = this.people.length;
    if (sharingCount) sharingCount.textContent = this.people.filter(p => p.isSharing).length;
    if (premiumStatus) {
      premiumStatus.textContent = this.userTier;
      premiumStatus.className = this.isPremium ? 'premium' : 'basic';
    }
  }

  renderSquadMembers() {
    const container = document.getElementById('squadMembers');
    const emptyState = document.getElementById('emptyState');

    if (!container) return;

    if (this.people.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = this.people.map(member => `
      <div class="member-card" data-member-id="${member.id}">
        <div class="member-avatar">${member.avatar}</div>
        <div class="member-info">
          <div class="member-name">${member.name}</div>
          <div class="member-details">
            ${member.phone ? `📞 ${member.phone}` : ''}
            ${member.relationship ? ` • ${member.relationship}` : ''}
            ${member.location ? ` • 📍 ${member.location.area || 'Location shared'}` : ''}
          </div>
        </div>
        <div class="member-status">
          <span class="sharing-indicator ${member.isSharing ? 'sharing' : 'not-sharing'}">
            ${member.isSharing ? '📍 Sharing' : '❌ Not sharing'}
          </span>
          ${member.lastUpdate ? `<small>${this.formatLastUpdate(member.lastUpdate)}</small>` : ''}
        </div>
      </div>
    `).join('');
  }

  formatLastUpdate(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = show ? 'flex' : 'none';
    }
  }

  showEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
      emptyState.style.display = 'block';
    }
  }

  showErrorState(message) {
    const container = document.getElementById('squadMembers');
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          ${message}
          <button onclick="window.improvedCarnivalSquad.refreshData()" class="add-member-btn" style="margin-top: 10px;">
            Try Again
          </button>
        </div>
      `;
    }
  }

  updateSyncStatus(status) {
    const statusElement = document.getElementById('syncStatus');
    if (statusElement) {
      statusElement.textContent = status;
    }
  }

  setupAutoRefresh() {
    // Auto-refresh every 30 seconds only if authenticated
    if (this.isAuthenticated) {
      this.syncInterval = setInterval(() => {
        if (this.isInitialized && !this.isLoading) {
          this.refreshData(true); // Silent refresh
        }
      }, 30000);
    }
  }

  async refreshData(silent = false) {
    if (this.isLoading) {
      console.log('⚠️ Refresh already in progress');
      return;
    }

    if (!this.isAuthenticated) {
      this.triggerAvatarSignIn();
      return;
    }

    try {
      if (!silent) {
        this.updateSyncStatus('🔄 Refreshing...');
      }

      this.isLoading = true;
      await this.loadSquadData();
      this.updateStats();
      this.renderSquadMembers();

      if (!silent) {
        this.updateSyncStatus('✅ Synced');
        this.showSuccessMessage('Squad data refreshed successfully');
      }

    } catch (error) {
      console.error('❌ Refresh failed:', error);
      if (!silent) {
        this.updateSyncStatus('❌ Sync failed');
        this.showErrorMessage('Failed to refresh squad data');
      }
    } finally {
      this.isLoading = false;
    }
  }

  showAddMemberModal() {
    if (!this.isAuthenticated) {
      this.triggerAvatarSignIn();
      return;
    }

    const modal = document.getElementById('addMemberModal');
    if (modal) {
      modal.style.display = 'block';
      document.getElementById('memberName').focus();
    }
  }

  hideAddMemberModal() {
    const modal = document.getElementById('addMemberModal');
    if (modal) {
      modal.style.display = 'none';
      document.getElementById('addMemberForm').reset();
    }
  }

  async handleAddMember() {
    try {
      if (!this.isAuthenticated) {
        this.triggerAvatarSignIn();
        return;
      }

      const formData = {
        name: document.getElementById('memberName').value.trim(),
        phone: document.getElementById('memberPhone').value.trim(),
        email: document.getElementById('memberEmail').value.trim(),
        relationship: document.getElementById('memberRelationship').value
      };

      if (!formData.name) {
        this.showErrorMessage('Name is required');
        return;
      }

      if (!this.currentUser) {
        this.showErrorMessage('Please sign in to add squad members');
        return;
      }

      // Check member limits for basic users
      if (!this.isPremium && this.people.length >= 1) {
        this.showErrorMessage('Basic users can only add 1 squad member. Upgrade to Premium for unlimited members.');
        return;
      }

      await this.addSquadMember(formData);

      this.hideAddMemberModal();
      this.showSuccessMessage('Squad member added successfully');

      // Refresh data
      await this.refreshData();

    } catch (error) {
      console.error('❌ Error adding member:', error);
      this.showErrorMessage('Failed to add squad member: ' + error.message);
    }
  }

  async addSquadMember(memberData) {
    try {
      const supabaseInstance = window.getSupabaseClient ? window.getSupabaseClient() : (window.supabaseClient || window.supabase);

      if (!supabaseInstance) {
        throw new Error('Supabase not available');
      }

      const { data, error } = await supabaseInstance
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

      if (error) {
        throw error;
      }

      console.log('✅ Squad member added:', data);
      return data;

    } catch (error) {
      console.error('❌ Error adding squad member:', error);
      throw error;
    }
  }

  showSuccessMessage(message) {
    this.showMessage(message, 'success');
  }

  showErrorMessage(message) {
    this.showMessage(message, 'error');
  }

  showMessage(message, type) {
    const container = document.querySelector('.carnival-squad-content');
    if (!container) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.textContent = message;

    container.insertBefore(messageDiv, container.firstChild);

    setTimeout(() => {
      messageDiv.remove();
    }, 5000);
  }

  // Public methods for external access
  getSquadMembers() {
    return this.people;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isPremiumUser() {
    return this.isPremium;
  }

  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  // Method to recheck authentication status (useful after sign in/out)
  async recheckAuthentication() {
    await this.checkAuthenticationStatus();

    if (this.isAuthenticated) {
      // Reinitialize if now authenticated
      await this.performInitialization();
    } else {
      // Show unauthenticated state
      this.showUnauthenticatedState();
      this.updateSyncStatus('🔒 Sign in required');
    }
  }

  // Cleanup method
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    const container = document.getElementById('carnivalSquadContainer');
    if (container) {
      container.remove();
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for other systems to initialize
  setTimeout(() => {
    window.improvedCarnivalSquad = new ImprovedCarnivalSquadUI();
  }, 500);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImprovedCarnivalSquadUI;
}
