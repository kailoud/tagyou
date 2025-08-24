// Avatar System - Adapted from React component for vanilla JavaScript
class AvatarSystem {
  constructor() {
    this.user = null;
    this.loading = true;
    this.authMode = 'signin';
    this.showAuthModal = false;
    this.formData = { email: '', password: '', confirmPassword: '' };
    this.authLoading = false;
    this.authError = '';
    this.authSuccess = '';
    this.isDropdownOpen = false;
    this.isCarnivalDropdownOpen = false;
    this.trackedCarnivals = new Set();
    this.carnivalNotes = {};
    this.selectedCarnival = null;
    this.showCarnivalDetails = false;
    this.dropdownRef = null;
    this.authService = null;

    // UK Carnival data
    this.ukCarnivals = [
      {
        id: 1,
        name: "Notting Hill Carnival",
        location: "London",
        date: "Aug 24-26, 2025",
        status: "active",
        description: "Europe's largest street festival celebrating Caribbean culture",
        website: "https://thelondonnottinghillcarnival.com",
        expectedAttendance: "2+ million",
        highlights: ["Steel Pan Competition", "Mas Bands", "Sound Systems", "Caribbean Food"]
      },
      {
        id: 2,
        name: "Manchester Caribbean Carnival",
        location: "Manchester",
        date: "Aug 9-10, 2025",
        status: "finished",
        description: "Celebrating Caribbean heritage in the heart of Manchester",
        website: "https://manchestercarnival.com",
        expectedAttendance: "100,000+",
        highlights: ["Parade Route", "Alexandra Park Festival", "Local Caribbean Cuisine"]
      },
      {
        id: 3,
        name: "Leeds West Indian Carnival",
        location: "Leeds",
        date: "Aug 25, 2025",
        status: "upcoming",
        description: "One of the oldest Caribbean carnivals in Europe",
        website: "https://leedscarnival.co.uk",
        expectedAttendance: "150,000+",
        highlights: ["Chapeltown Festival", "Steel Band Competition", "Caribbean Market"]
      },
      {
        id: 4,
        name: "Birmingham International Carnival",
        location: "Birmingham",
        date: "Sep 13-14, 2025",
        status: "upcoming",
        description: "A vibrant celebration of multicultural Birmingham",
        website: "https://birminghamcarnival.com",
        expectedAttendance: "75,000+",
        highlights: ["Handsworth Park", "International Food Village", "Live Music Stages"]
      }
    ];

    this.init();
  }

  async initializeSupabase() {
    try {
      console.log('🔐 Avatar System: Initializing Supabase...');

      // Wait for Supabase to be available
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait

      while (!window.supabase && attempts < maxAttempts) {
        console.log('🔐 Avatar System: Waiting for Supabase to be ready...', attempts + 1);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.supabase) {
        throw new Error('Supabase not available after waiting');
      }

      console.log('🔐 Avatar System: Supabase is ready, proceeding with initialization...');

      // Import the auth service
      const authModule = await import('./supabase-auth-service.js');
      console.log('🔐 Avatar System: Auth module imported:', authModule);

      // Get the singleton instance
      this.authService = authModule.supabaseAuthService;
      console.log('🔐 Avatar System: Auth service assigned:', this.authService);

      // Set the global supabase instance for the auth service
      authModule.setSupabaseInstance(window.supabase);
      console.log('🔐 Avatar System: Supabase instance set');

      // Initialize the auth service
      const initialized = await this.authService.initialize();
      console.log('✅ Avatar System: Auth service initialized:', initialized);

      if (initialized) {
        // Set up auth state listener
        this.authService.onAuthStateChanged((user) => {
          console.log('Avatar System: Auth state changed:', user?.email);
          this.user = user;
          if (user) {
            sessionStorage.setItem('supabase_user', JSON.stringify(user));
          } else {
            sessionStorage.removeItem('supabase_user');
          }
          this.renderDropdown();
        });

        console.log('✅ Avatar System: Supabase Auth Service fully initialized');
      } else {
        console.warn('⚠️ Avatar System: Auth service failed to initialize');
      }
    } catch (error) {
      console.error('❌ Avatar System: Error initializing Supabase Auth Service:', error);
    }
  }

  setupAuthListener() {
    // Auth listener is now handled in initializeSupabase()
  }

  async init() {
    await this.initializeSupabase();
    await this.checkUser();
    this.createAvatarElement();
    this.setupEventListeners();
    this.setupAuthListener();
  }

  async checkUser() {
    try {
      if (this.authService) {
        // Use the auth service
        this.user = this.authService.getCurrentUser();
      } else {
        // Fallback to sessionStorage
        const storedUser = sessionStorage.getItem('supabase_user');
        if (storedUser) {
          this.user = JSON.parse(storedUser);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      this.loading = false;
    }
  }

  createAvatarElement() {
    console.log('🎨 Avatar System: Creating avatar element...');
    // Create avatar container
    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'avatar-container';
    avatarContainer.style.cssText = `
      position: fixed;
      top: 40px;
      right: 40px;
      z-index: 9999;
    `;

    // Create avatar button
    const avatarButton = document.createElement('button');
    avatarButton.className = 'avatar-button';
    avatarButton.style.cssText = `
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
    `;

    // Set background based on user state
    if (this.user) {
      avatarButton.style.background = 'linear-gradient(135deg, #8b5cf6, #3b82f6, #14b8a6)';
    } else {
      avatarButton.style.background = 'linear-gradient(135deg, #9ca3af, #6b7280)';
    }

    // Create user icon
    const userIcon = document.createElement('div');
    userIcon.innerHTML = '<i class="fas fa-user" style="font-size: 24px; color: white;"></i>';
    avatarButton.appendChild(userIcon);

    // Create status indicator
    const statusIndicator = document.createElement('div');
    statusIndicator.className = 'status-indicator';
    statusIndicator.style.cssText = `
      position: absolute;
      top: -4px;
      right: -4px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid white;
    `;

    if (this.user) {
      statusIndicator.style.backgroundColor = '#4ade80'; // Green for authenticated
    } else {
      statusIndicator.style.backgroundColor = '#fb923c'; // Orange for guest
    }

    avatarButton.appendChild(statusIndicator);

    // Add click handler
    avatarButton.addEventListener('click', () => this.toggleDropdown());

    avatarContainer.appendChild(avatarButton);
    this.dropdownRef = avatarContainer;

    // Add to page
    document.body.appendChild(avatarContainer);
  }

  toggleDropdown() {
    console.log('🎨 Avatar System: Toggle dropdown called, current state:', this.isDropdownOpen);
    this.isDropdownOpen = !this.isDropdownOpen;
    this.renderDropdown();
  }

  renderDropdown() {
    console.log('🎨 Avatar System: Rendering dropdown, isOpen:', this.isDropdownOpen);
    // Remove existing dropdown
    const existingDropdown = document.querySelector('.avatar-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
    }

    if (!this.isDropdownOpen) return;

    const dropdown = document.createElement('div');
    dropdown.className = 'avatar-dropdown';
    dropdown.style.cssText = `
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 16px;
      width: 320px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid #f3f4f6;
      overflow: hidden;
      z-index: 10000;
    `;

    if (this.user) {
      dropdown.innerHTML = this.renderAuthenticatedDropdown();
    } else {
      dropdown.innerHTML = this.renderGuestDropdown();
    }

    this.dropdownRef.appendChild(dropdown);

    // Add click outside handler
    setTimeout(() => {
      document.addEventListener('click', this.handleClickOutside.bind(this));
    }, 100);
  }

  renderAuthenticatedDropdown() {
    return `
      <div class="dropdown-header" style="background: linear-gradient(135deg, #8b5cf6, #3b82f6, #14b8a6); padding: 24px; color: white;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
            <i class="fas fa-user" style="font-size: 32px; color: white;"></i>
          </div>
          <div style="flex: 1;">
            <h3 style="font-weight: bold; font-size: 18px; margin: 0;">${this.user.user_metadata?.full_name || 'User'}</h3>
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 4px 0;">${this.user.email}</p>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <i class="fas fa-star" style="color: #fbbf24;"></i>
              <span style="font-size: 14px; color: rgba(255,255,255,0.9);">Premium User</span>
            </div>
          </div>
        </div>
      </div>

      <div style="padding: 8px;">
        <div style="position: relative;">
          <button class="menu-button carnival-button" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 12px; border: none; background: none; cursor: pointer; border-radius: 8px; transition: background 0.2s;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <i class="fas fa-map-marker-alt" style="color: #8b5cf6; font-size: 20px;"></i>
              <span style="font-size: 14px; font-weight: 500; color: #374151;">UK Carnivals</span>
            </div>
            <i class="fas fa-chevron-right" style="color: #9ca3af; font-size: 16px;"></i>
          </button>
        </div>
        
        <button class="menu-button" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 12px; border: none; background: none; cursor: pointer; border-radius: 8px; transition: background 0.2s;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <i class="fas fa-bell" style="color: #8b5cf6; font-size: 20px;"></i>
            <span style="font-size: 14px; font-weight: 500; color: #374151;">Notifications</span>
          </div>
          <span style="background: #ef4444; color: white; font-size: 12px; padding: 2px 8px; border-radius: 12px;">3</span>
        </button>
      </div>

      <div style="border-top: 1px solid #f3f4f6; margin: 8px 0;"></div>

      <div style="padding: 8px;">
        <button class="menu-button" style="width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px; border: none; background: none; cursor: pointer; border-radius: 8px; transition: background 0.2s;">
          <i class="fas fa-cog" style="color: #6b7280; font-size: 20px;"></i>
          <span style="font-size: 14px; font-weight: 500; color: #374151;">Settings</span>
        </button>
        
        <button class="menu-button" style="width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px; border: none; background: none; cursor: pointer; border-radius: 8px; transition: background 0.2s;">
          <i class="fas fa-question-circle" style="color: #6b7280; font-size: 20px;"></i>
          <span style="font-size: 14px; font-weight: 500; color: #374151;">Help & Support</span>
        </button>
        
        <button class="menu-button signout-button" style="width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px; border: none; background: none; cursor: pointer; border-radius: 8px; transition: background 0.2s;">
          <i class="fas fa-sign-out-alt" style="color: #dc2626; font-size: 20px;"></i>
          <span style="font-size: 14px; font-weight: 500; color: #dc2626;">Sign Out</span>
        </button>
      </div>

      <div style="background: #f9fafb; padding: 16px; border-top: 1px solid #f3f4f6;">
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #6b7280; margin-bottom: 12px;">
          <span>Joined Today</span>
          <span>Free Plan</span>
        </div>
        <button style="width: 100%; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; padding: 8px 16px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s;">
          Upgrade to Pro
        </button>
      </div>
    `;
  }

  renderGuestDropdown() {
    return `
      <div class="dropdown-header" style="background: linear-gradient(135deg, #6b7280, #4b5563); padding: 24px; color: white;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
            <i class="fas fa-user" style="font-size: 32px; color: white;"></i>
          </div>
          <div style="flex: 1;">
            <h3 style="font-weight: bold; font-size: 18px; margin: 0;">Welcome!</h3>
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 4px 0;">Sign in to track carnivals</p>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <span style="font-size: 14px; color: rgba(255,255,255,0.9);">Guest User</span>
            </div>
          </div>
        </div>
      </div>

      <div style="padding: 16px;">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button class="signin-button auth-submit-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 16px; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; transition: background 0.2s;">
            <i class="fas fa-user" style="font-size: 20px;"></i>
            <span>Sign In</span>
          </button>
          
          <button class="signup-button" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: white; color: #8b5cf6; padding: 12px 16px; border: 2px solid #8b5cf6; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s;">
            <i class="fas fa-user-plus" style="font-size: 20px;"></i>
            <span>Create Account</span>
          </button>
        </div>

        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #f3f4f6;">
          <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 0;">
            Sign in to access carnival tracking, notifications, and personalized features.
          </p>
        </div>

        <div style="margin-top: 16px;">
          <h4 style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">What you'll get:</h4>
          <ul style="display: flex; flex-direction: column; gap: 8px;">
            <li style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #6b7280;">
              <i class="fas fa-map-marker-alt" style="color: #8b5cf6; font-size: 16px;"></i>
              <span>Track UK carnival events</span>
            </li>
            <li style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #6b7280;">
              <i class="fas fa-bell" style="color: #8b5cf6; font-size: 16px;"></i>
              <span>Get event notifications</span>
            </li>
            <li style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #6b7280;">
              <i class="fas fa-edit" style="color: #8b5cf6; font-size: 16px;"></i>
              <span>Add personal notes</span>
            </li>
            <li style="display: flex; align-items: center; gap: 8px; font-size: 14px; color: #6b7280;">
              <i class="fas fa-bookmark" style="color: #8b5cf6; font-size: 16px;"></i>
              <span>Save favorite events</span>
            </li>
          </ul>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Event delegation for dropdown buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.signin-button')) {
        this.showAuthModal = true;
        this.authMode = 'signin';
        this.isDropdownOpen = false;
        this.renderAuthModal();
      } else if (e.target.closest('.signup-button')) {
        this.showAuthModal = true;
        this.authMode = 'signup';
        this.isDropdownOpen = false;
        this.renderAuthModal();
      } else if (e.target.closest('.signout-button')) {
        this.handleSignOut();
      } else if (e.target.closest('.carnival-button')) {
        this.toggleCarnivalDropdown();
      } else if (e.target.closest('.auth-mode-toggle')) {
        this.authMode = this.authMode === 'signin' ? 'signup' : 'signin';
        this.authError = '';
        this.authSuccess = '';
        this.renderAuthModal();
      } else if (e.target.closest('.auth-modal') && !e.target.closest('.auth-modal > div')) {
        this.closeAuthModal();
      }
    });

    // Event delegation for form submission
    document.addEventListener('submit', (e) => {
      if (e.target.classList.contains('auth-form')) {
        e.preventDefault();
        this.handleAuth();
      }
    });

    // Event delegation for input changes
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('auth-input')) {
        const field = e.target.id === 'auth-email' ? 'email' :
          e.target.id === 'auth-confirm-password' ? 'confirmPassword' : 'password';
        this.formData[field] = e.target.value;
      }
    });

    // Event delegation for auth mode toggle
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('auth-mode-toggle')) {
        e.preventDefault();
        this.authMode = this.authMode === 'signin' ? 'signup' : 'signin';
        this.authError = '';
        this.authSuccess = '';
        this.renderAuthModal();
      } else if (e.target.classList.contains('forgot-password-link')) {
        e.preventDefault();
        // TODO: Implement forgot password functionality
        console.log('Forgot password clicked');
      } else if (e.target.classList.contains('track-carnival-btn')) {
        e.preventDefault();
        e.stopPropagation();
        const carnivalId = parseInt(e.target.dataset.carnivalId);
        this.toggleCarnivalTracking(carnivalId);
      } else if (e.target.closest('.carnival-item')) {
        const carnivalItem = e.target.closest('.carnival-item');
        const carnivalName = carnivalItem.dataset.carnivalName;

        if (carnivalName === 'Notting Hill Carnival') {
          this.toggleCarnivalRoute();
        }

        // Close carnival dropdown after selection
        this.isCarnivalDropdownOpen = false;
        const existingDropdown = document.querySelector('.carnival-dropdown');
        if (existingDropdown) {
          existingDropdown.remove();
        }
      }
    });
  }

  handleClickOutside(event) {
    if (!this.dropdownRef.contains(event.target)) {
      this.isDropdownOpen = false;
      this.isCarnivalDropdownOpen = false;
      this.renderDropdown();
      document.removeEventListener('click', this.handleClickOutside);
    }
  }

  handleCarnivalClickOutside(event) {
    const carnivalDropdown = document.querySelector('.carnival-dropdown');
    if (carnivalDropdown && !carnivalDropdown.contains(event.target) && !this.dropdownRef.contains(event.target)) {
      this.isCarnivalDropdownOpen = false;
      carnivalDropdown.remove();
      document.removeEventListener('click', this.handleCarnivalClickOutside);
    }
  }

  toggleCarnivalDropdown() {
    this.isCarnivalDropdownOpen = !this.isCarnivalDropdownOpen;
    this.renderCarnivalDropdown();
  }

  renderCarnivalDropdown() {
    // Remove existing carnival dropdown
    const existingDropdown = document.querySelector('.carnival-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
    }

    if (!this.isCarnivalDropdownOpen) return;

    const dropdown = document.createElement('div');
    dropdown.className = 'carnival-dropdown';
    dropdown.style.cssText = `
      position: absolute;
      top: 60px;
      right: 0;
      width: 320px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      z-index: 10001;
      overflow: hidden;
      transform: translateY(-10px);
      opacity: 0;
      transition: all 0.3s ease;
    `;

    dropdown.innerHTML = this.renderCarnivalContent();

    // Append to avatar container
    if (this.dropdownRef) {
      this.dropdownRef.appendChild(dropdown);

      // Trigger animation
      setTimeout(() => {
        dropdown.style.transform = 'translateY(0)';
        dropdown.style.opacity = '1';
      }, 10);
    }

    // Add click outside handler for carnival dropdown
    document.addEventListener('click', this.handleCarnivalClickOutside.bind(this));
  }

  renderCarnivalContent() {
    const trackedCount = this.trackedCarnivals.size;
    const totalCount = this.ukCarnivals.length;

    return `
      <div style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); padding: 24px; color: white;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
            <i class="fas fa-calendar-alt" style="font-size: 32px; color: white;"></i>
          </div>
          <div style="flex: 1;">
            <h3 style="font-weight: bold; font-size: 18px; margin: 0;">UK Carnivals</h3>
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 4px 0;">Track your favorite events</p>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <span style="font-size: 14px; color: rgba(255,255,255,0.9);">Tracking ${trackedCount} of ${totalCount} carnivals</span>
            </div>
          </div>
        </div>
      </div>

      <div style="padding: 16px; max-height: 300px; overflow-y: auto;">
        ${this.ukCarnivals.map(carnival => `
          <div class="carnival-item" data-carnival-id="${carnival.id}" data-carnival-name="${carnival.name}" style="
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid #f3f4f6;
            background: ${this.trackedCarnivals.has(carnival.id) ? '#f0f9ff' : 'white'};
            ${carnival.name === 'Notting Hill Carnival' ? `
              position: relative;
              overflow: hidden;
            ` : ''}
          ">
            ${carnival.name === 'Notting Hill Carnival' ? `
              <div class="notting-hill-hover" style="
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.1), transparent);
                transition: left 0.5s ease;
                pointer-events: none;
              "></div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="flex: 1;">
                <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #374151;">
                  ${carnival.name}
                </h4>
                <p style="margin: 0 0 2px 0; font-size: 12px; color: #6b7280;">
                  📍 ${carnival.location} • 📅 ${carnival.date}
                </p>
                <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                  👥 ${carnival.expectedAttendance}
                </p>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="
                  padding: 2px 8px;
                  border-radius: 12px;
                  font-size: 10px;
                  font-weight: 500;
                  background: ${carnival.status === 'active' ? '#dcfce7' : carnival.status === 'finished' ? '#fee2e2' : '#fef3c7'};
                  color: ${carnival.status === 'active' ? '#166534' : carnival.status === 'finished' ? '#991b1b' : '#92400e'};
                ">
                  ${carnival.status === 'active' ? 'Active' : carnival.status === 'finished' ? 'Finished' : 'Upcoming'}
                </span>
                <button class="track-carnival-btn" data-carnival-id="${carnival.id}" style="
                  background: ${this.trackedCarnivals.has(carnival.id) ? '#ef4444' : '#10b981'};
                  color: white;
                  border: none;
                  border-radius: 6px;
                  padding: 4px 8px;
                  font-size: 10px;
                  cursor: pointer;
                  transition: all 0.2s ease;
                ">
                  ${this.trackedCarnivals.has(carnival.id) ? 'Untrack' : 'Track'}
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  toggleCarnivalTracking(carnivalId) {
    if (this.trackedCarnivals.has(carnivalId)) {
      this.trackedCarnivals.delete(carnivalId);
      console.log(`Untracked carnival ${carnivalId}`);
    } else {
      this.trackedCarnivals.add(carnivalId);
      console.log(`Tracked carnival ${carnivalId}`);
    }

    // Update the carnival dropdown content
    this.renderCarnivalDropdown();

    // Update the main dropdown to show new count
    this.renderDropdown();
  }

  renderAuthModal() {
    if (!this.showAuthModal) return;

    const modal = document.createElement('div');
    modal.className = 'auth-modal show';
    modal.innerHTML = `
      <div class="auth-modal-overlay">
        <div class="auth-modal-content">
          <button class="auth-modal-close" onclick="window.avatarSystem.closeAuthModal()">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="auth-modal-header">
            <h2>${this.authMode === 'signin' ? 'Sign In' : 'Create Account'}</h2>
            <p>${this.authMode === 'signin'
        ? 'Welcome back! Please sign in to your account.'
        : 'Join us to start tracking your favorite carnivals.'}
            </p>
            ${this.authLoading ? `
              <div class="auth-loading-indicator">
                <i class="fas fa-spinner fa-spin"></i>
                <span>${this.authMode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
              </div>
            ` : ''}
          </div>

          ${this.authError ? `
            <div class="auth-error">
              <i class="fas fa-exclamation-circle"></i>
              ${this.authError}
            </div>
          ` : ''}

          ${this.authSuccess ? `
            <div class="auth-success">
              <i class="fas fa-check-circle"></i>
              ${this.authSuccess}
            </div>
          ` : ''}

          <form class="auth-form">
            <div class="form-group">
              <label for="auth-email">Email Address</label>
              <input type="email" id="auth-email" class="auth-input" required value="${this.formData.email}" placeholder="Enter your email">
            </div>

            <div class="form-group">
              <label for="auth-password">Password</label>
              <input type="password" id="auth-password" class="auth-input" required value="${this.formData.password}" placeholder="Enter your password">
            </div>

            ${this.authMode === 'signup' ? `
              <div class="form-group">
                <label for="auth-confirm-password">Confirm Password</label>
                <input type="password" id="auth-confirm-password" class="auth-input" required value="${this.formData.confirmPassword}" placeholder="Confirm your password">
              </div>
            ` : ''}

            <button type="submit" class="auth-submit-btn" ${this.authLoading ? 'disabled' : ''}>
              ${this.authLoading ? '<i class="fas fa-spinner fa-spin"></i>' : ''}
              <i class="fas ${this.authMode === 'signin' ? 'fa-user' : 'fa-user-plus'}"></i>
              <span>${this.authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>

          <div class="auth-modal-footer">
            <p>
              ${this.authMode === 'signin' ? "Don't have an account?" : "Already have an account?"}
              <a href="#" class="auth-link auth-mode-toggle">
                ${this.authMode === 'signin' ? 'Create Account' : 'Sign In'}
              </a>
            </p>
            ${this.authMode === 'signin' ? `
              <p>
                <a href="#" class="auth-link forgot-password-link">
                  Forgot Password?
                </a>
              </p>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    modal.innerHTML = `
      <div style="background: white; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); max-width: 448px; width: 100%; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); padding: 24px; color: white;">
          <h2 style="font-size: 24px; font-weight: bold; margin: 0;">
            ${this.authMode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0 0;">
            ${this.authMode === 'signin'
        ? 'Welcome back! Please sign in to your account.'
        : 'Join us to start tracking your favorite carnivals.'
      }
          </p>
        </div>

        <div style="padding: 24px;">
          ${this.authError ? `
            <div style="margin-bottom: 16px; padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-exclamation-circle" style="color: #ef4444; font-size: 16px;"></i>
              <span style="font-size: 14px; color: #dc2626;">${this.authError}</span>
            </div>
          ` : ''}

          ${this.authSuccess ? `
            <div style="margin-bottom: 16px; padding: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
              <span style="font-size: 14px; color: #16a34a;">${this.authSuccess}</span>
            </div>
          ` : ''}

          <form class="auth-form" style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">
                Email Address
              </label>
              <div style="position: relative;">
                <i class="fas fa-envelope" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 16px;"></i>
                <input type="email" required value="${this.formData.email}" class="auth-input" style="width: 100%; padding: 8px 12px 8px 40px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;" placeholder="Enter your email">
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">
                Password
              </label>
              <div style="position: relative;">
                <i class="fas fa-lock" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 16px;"></i>
                <input type="password" required value="${this.formData.password}" class="auth-input" style="width: 100%; padding: 8px 12px 8px 40px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;" placeholder="Enter your password">
              </div>
            </div>

            ${this.authMode === 'signup' ? `
              <div>
                <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">
                  Confirm Password
                </label>
                <div style="position: relative;">
                  <i class="fas fa-lock" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 16px;"></i>
                  <input type="password" required value="${this.formData.confirmPassword}" class="auth-input" style="width: 100%; padding: 8px 12px 8px 40px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;" placeholder="Confirm your password">
                </div>
              </div>
            ` : ''}

            <button type="submit" class="auth-submit" style="width: 100%; background: #8b5cf6; color: white; padding: 8px 16px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;">
              ${this.authLoading ? '<div style="width: 16px; height: 16px; border: 2px solid white; border-top: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>' : ''}
              <i class="fas ${this.authMode === 'signin' ? 'fa-user' : 'fa-user-plus'}" style="font-size: 16px;"></i>
              <span>${this.authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>

          <div style="margin-top: 16px; text-align: center;">
            <button class="auth-mode-toggle" style="background: none; border: none; color: #8b5cf6; font-size: 14px; cursor: pointer; transition: color 0.2s;">
              ${this.authMode === 'signin'
        ? "Don't have an account? Sign up"
        : 'Already have an account? Sign in'
      }
            </button>
          </div>
        </div>

        <div style="background: #f9fafb; padding: 16px; border-top: 1px solid #f3f4f6;">
          <button class="close-modal" style="width: 100%; text-align: center; background: none; border: none; color: #6b7280; font-size: 14px; cursor: pointer; transition: color 0.2s;">
            Close
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('.close-modal')) {
        this.closeAuthModal();
      }
    });

    const form = modal.querySelector('.auth-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAuth();
    });

    const modeToggle = modal.querySelector('.auth-mode-toggle');
    modeToggle.addEventListener('click', () => {
      this.authMode = this.authMode === 'signin' ? 'signup' : 'signin';
      this.authError = '';
      this.authSuccess = '';
      this.formData = { email: '', password: '', confirmPassword: '' };
      this.closeAuthModal();
      this.renderAuthModal();
    });

    // Add input event listeners
    const inputs = modal.querySelectorAll('.auth-input');
    inputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        const field = index === 0 ? 'email' : index === 1 ? 'password' : 'confirmPassword';
        this.formData[field] = e.target.value;
      });
    });
  }

  async handleAuth() {
    console.log('🔐 Avatar System: handleAuth called, mode:', this.authMode);
    console.log('🔐 Avatar System: formData:', this.formData);
    console.log('🔐 Avatar System: authService available:', !!this.authService);

    this.authLoading = true;
    this.authError = '';
    this.authSuccess = '';

    try {
      if (this.authMode === 'signup') {
        // Step 1: Validation
        console.log('🔐 Avatar System: Step 1 - Validating signup data...');

        if (!this.formData.email || !this.formData.password || !this.formData.confirmPassword || !this.formData.email.includes('@') || this.formData.password.length < 6) {
          this.authError = 'Please fill in all fields correctly. Email must be valid and password must be at least 6 characters.';
          return;
        }

        if (this.formData.password !== this.formData.confirmPassword) {
          this.authError = 'Passwords do not match';
          return;
        }

        // Step 2: Supabase Signup
        if (this.authService && this.authService.isInitialized) {
          console.log('🔐 Avatar System: Step 2 - Attempting Supabase signup...');
          console.log('🔐 Avatar System: Auth service available:', !!this.authService);
          console.log('🔐 Avatar System: Auth service type:', typeof this.authService);
          console.log('🔐 Avatar System: Auth service constructor:', this.authService.constructor.name);
          try {
            const result = await this.authService.signUp(this.formData.email, this.formData.password);
            console.log('🔐 Avatar System: Signup result:', result);

            if (result.success) {
              this.authSuccess = '🎉 Account created successfully! Please check your email to confirm your account.';
              console.log('🔐 Avatar System: Signup successful, email confirmation required');
              this.closeAuthModal();
              this.renderDropdown();
            } else {
              this.authError = result.error || 'Sign up failed. Please try again.';
              console.error('🔐 Avatar System: Signup failed:', result.error);
            }
          } catch (error) {
            console.error('🔐 Avatar System: Signup error:', error);
            this.authError = error.message || 'Sign up failed. Please try again.';
          }
        } else {
          console.error('🔐 Avatar System: Auth service not properly initialized');
          this.authError = 'Authentication service not ready. Please refresh the page and try again.';
          return;
        }

      } else {
        // Step 1: Validation
        console.log('🔐 Avatar System: Step 1 - Validating signin data...');

        if (!this.formData.email || !this.formData.password || !this.formData.email.includes('@') || this.formData.password.length < 6) {
          this.authError = 'Please enter a valid email and password (min 6 characters)';
          return;
        }

        // Step 2: Supabase Signin
        if (this.authService && this.authService.isInitialized) {
          console.log('🔐 Avatar System: Step 2 - Attempting Supabase signin...');
          try {
            const result = await this.authService.signIn(this.formData.email, this.formData.password);
            console.log('🔐 Avatar System: Signin result:', result);

            if (result.success) {
              this.authSuccess = '🎉 Signed in successfully! Welcome back!';
              console.log('🔐 Avatar System: Signin successful');
              this.closeAuthModal();
              this.renderDropdown();
            } else {
              this.authError = result.error || 'Sign in failed. Please check your credentials.';
              console.error('🔐 Avatar System: Signin failed:', result.error);
            }
          } catch (error) {
            console.error('🔐 Avatar System: Signin error:', error);
            this.authError = error.message || 'Sign in failed. Please check your credentials.';
          }
        } else {
          console.error('🔐 Avatar System: Auth service not properly initialized');
          this.authError = 'Authentication service not ready. Please refresh the page and try again.';
          return;
        }
      }
    } catch (error) {
      console.error('🔐 Avatar System: Unexpected error:', error);
      this.authError = error.message || 'An unexpected error occurred. Please try again.';
    } finally {
      this.authLoading = false;
      this.renderAuthModal();
    }
  }

  async handleSignOut() {
    this.authLoading = true;
    try {
      if (this.authService) {
        // Use existing auth service signout
        await this.authService.signOut();
      }

      sessionStorage.removeItem('supabase_user');
      this.user = null;
      this.isDropdownOpen = false;
      this.renderDropdown();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      this.authLoading = false;
    }
  }

  closeAuthModal() {
    this.showAuthModal = false;
    const modal = document.querySelector('.auth-modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
      }, 300); // Wait for transition to complete
    }
  }

  toggleCarnivalRoute() {
    // Check if global functions exist
    if (typeof window.showCarnivalRoute === 'function' &&
      typeof window.showJudgingZone === 'function' &&
      typeof window.showStartFlag === 'function') {

      // Toggle carnival route visibility using global state
      if (window.carnivalRouteActive) {
        // Route is visible, hide it
        if (window.carnivalRoute && window.map) {
          window.map.removeLayer(window.carnivalRoute);
          window.carnivalRoute = null;
        }
        if (window.startFlag && window.map) {
          window.map.removeLayer(window.startFlag);
          window.startFlag = null;
        }
        // Remove judging zone (it's a text overlay, so we need to find and remove it)
        const judgingZone = document.querySelector('.judging-zone-label');
        if (judgingZone) {
          judgingZone.remove();
        }
        // Update global state
        window.carnivalRouteActive = false;

        // Synchronize star button state
        const starButton = document.getElementById('festivalBtn');
        if (starButton) {
          starButton.classList.remove('active');
        }

        console.log('🎭 Carnival route hidden');
      } else {
        // Route is hidden, show it
        window.showCarnivalRoute();
        window.showJudgingZone();
        window.showStartFlag();

        // Synchronize star button state
        const starButton = document.getElementById('festivalBtn');
        if (starButton) {
          starButton.classList.add('active');
        }

        console.log('🎭 Carnival route activated');
      }
    } else {
      console.warn('🎭 Carnival route functions not found. Make sure the main script is loaded.');
    }
  }
}

// Initialize avatar system when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.avatarSystem) {
      window.avatarSystem = new AvatarSystem();
    }
  });
} else {
  // DOM is already loaded
  if (!window.avatarSystem) {
    window.avatarSystem = new AvatarSystem();
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .avatar-button:hover {
    transform: scale(1.1);
  }
  
  .menu-button:hover {
    background-color: #f9fafb;
  }
  
  .auth-input:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
  
  .auth-submit:hover {
    background-color: #7c3aed;
  }
  
  .auth-mode-toggle:hover {
    color: #7c3aed;
  }
  
  .close-modal:hover {
    color: #374151;
  }
  
  /* Authentication Loading Indicator */
  .auth-loading-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 8px 12px;
    background: rgba(139, 92, 246, 0.1);
    border-radius: 8px;
    color: #8b5cf6;
    font-size: 14px;
    font-weight: 500;
  }
  
  .auth-loading-indicator i {
    font-size: 16px;
  }
  
  /* Notting Hill Carnival Special Hover Effect */
  .carnival-item:hover .notting-hill-hover {
    left: 100%;
  }
  
  .carnival-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: #8b5cf6;
  }
  
  /* Special effect for Notting Hill Carnival */
  .carnival-item[data-carnival-id="1"]:hover {
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    border-color: #8b5cf6;
    box-shadow: 0 10px 30px rgba(139, 92, 246, 0.2);
  }
`;
document.head.appendChild(style);
