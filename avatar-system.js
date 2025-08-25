// Avatar System - Fixed version with authentication debugging
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
    this.rememberMe = false; // Remember Me functionality
    this.userTier = 'Basic'; // 'Basic' or 'Premium'
    this.isPremium = false;

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

    // Create avatar immediately without waiting for async operations
    this.createAvatarElement();
    this.setupEventListeners();

    // Initialize authentication in background
    this.init();
  }

  async initializeSupabase() {
    try {
      console.log('AUTH DEBUG: Initializing Supabase...');

      // Wait for Supabase to be available (reduced timeout)
      let attempts = 0;
      const maxAttempts = 50; // Reduced from 300 to 50 (5 seconds max)

      while (!window.supabase && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.supabase) {
        console.warn('AUTH DEBUG: Supabase not available, will continue without it');
        this.authService = this.createFallbackAuthService();
        return;
      }

      // Wait for Supabase client to be fully initialized (reduced timeout)
      attempts = 0;
      while (!window.supabaseClient && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.supabaseClient) {
        console.warn('AUTH DEBUG: Supabase client not available, will try to create one');
      }

      console.log('AUTH DEBUG: Supabase is ready, proceeding with initialization...');

      // Try to import the auth service - handle missing file gracefully
      let authModule;
      try {
        authModule = await import('./supabase-auth-service.js');
        this.authService = authModule.supabaseAuthService;
      } catch (importError) {
        console.warn('AUTH DEBUG: Failed to import auth service, creating fallback');
        this.authService = this.createFallbackAuthService();
      }

      // Set the global supabase instance for the auth service
      if (window.supabaseClient) {
        if (authModule && authModule.setSupabaseInstance) {
          authModule.setSupabaseInstance(window.supabaseClient);
        }
      } else {
        // Create our own Supabase client if none exists
        try {
          const config = await import('./supabase-config-secret.js');
          const supabaseClient = window.supabase.createClient(
            config.default.supabaseUrl,
            config.default.supabaseAnonKey
          );
          window.supabaseClient = supabaseClient;
          if (authModule && authModule.setSupabaseInstance) {
            authModule.setSupabaseInstance(supabaseClient);
          }
        } catch (error) {
          console.warn('AUTH DEBUG: Failed to create Supabase client, using fallback');
          this.authService = this.createFallbackAuthService();
          return;
        }
      }

      // Skip connection test for faster loading
      console.log('AUTH DEBUG: Supabase client ready');

      // Initialize the auth service (simplified)
      try {
        if (this.authService.initialize) {
          await this.authService.initialize();
        }

        // Set up auth state listener
        if (this.authService.onAuthStateChanged) {
          this.authService.onAuthStateChanged((user) => {
            this.user = user;
            if (user) {
              sessionStorage.setItem('supabase_user', JSON.stringify(user));
              // Load profile and refresh avatar when user signs in
              this.loadUserProfile().then(() => {
                this.refreshMainAvatar();
              });
            } else {
              sessionStorage.removeItem('supabase_user');
            }
            this.renderDropdown();
            this.updateStatusIndicator();
          });
        }

        console.log('AUTH DEBUG: Supabase Auth Service initialized');
      } catch (error) {
        console.warn('AUTH DEBUG: Auth service initialization failed, using fallback');
        this.authService = this.createFallbackAuthService();
      }
    } catch (error) {
      console.error('AUTH DEBUG: Error initializing Supabase Auth Service:', error);
    }
  }

  // Email validation function
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Fallback auth service for when the module is missing
  createFallbackAuthService() {
    return {
      isInitialized: true,
      initialize: async () => true,
      getCurrentUser: () => {
        try {
          const storedUser = sessionStorage.getItem('supabase_user');
          return storedUser ? JSON.parse(storedUser) : null;
        } catch {
          return null;
        }
      },
      signIn: async (email, password) => {
        console.log('AUTH DEBUG: Fallback signIn called with:', email);
        try {
          if (!window.supabaseClient) {
            console.error('AUTH DEBUG: Supabase client not available');
            return { success: false, error: 'Authentication service not available. Please refresh the page.' };
          }

          const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email,
            password
          });

          console.log('AUTH DEBUG: Supabase signIn response:', { data, error });

          if (error) {
            return { success: false, error: error.message };
          }

          if (data.user) {
            sessionStorage.setItem('supabase_user', JSON.stringify(data.user));
            return { success: true, user: data.user };
          }

          return { success: false, error: 'No user returned from sign in' };
        } catch (error) {
          console.error('AUTH DEBUG: Fallback signIn error:', error);
          return { success: false, error: error.message };
        }
      },
      signUp: async (email, password) => {
        console.log('AUTH DEBUG: Fallback signUp called with:', email);
        try {
          if (!window.supabaseClient) {
            console.error('AUTH DEBUG: Supabase client not available');
            return { success: false, error: 'Authentication service not available. Please refresh the page.' };
          }

          const { data, error } = await window.supabaseClient.auth.signUp({
            email,
            password
          });

          console.log('AUTH DEBUG: Supabase signUp response:', { data, error });

          if (error) {
            return { success: false, error: error.message };
          }

          return { success: true, user: data.user };
        } catch (error) {
          console.error('AUTH DEBUG: Fallback signUp error:', error);
          return { success: false, error: error.message };
        }
      },
      signOut: async () => {
        console.log('AUTH DEBUG: Fallback signOut called');
        try {
          if (!window.supabaseClient) {
            console.error('AUTH DEBUG: Supabase client not available');
            return { success: false, error: 'Authentication service not available. Please refresh the page.' };
          }

          const { error } = await window.supabaseClient.auth.signOut();
          if (error) {
            console.error('AUTH DEBUG: SignOut error:', error);
          }
          sessionStorage.removeItem('supabase_user');
          return { success: !error };
        } catch (error) {
          console.error('AUTH DEBUG: Fallback signOut error:', error);
          return { success: false, error: error.message };
        }
      },
      onAuthStateChanged: (callback) => {
        if (window.supabaseClient && window.supabaseClient.auth) {
          return window.supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('AUTH DEBUG: Auth state change event:', event, session?.user?.email);
            callback(session?.user || null);
          });
        }
        return { data: { subscription: { unsubscribe: () => { } } } };
      }
    };
  }

  async init() {
    // Initialize authentication in background
    this.initializeSupabase().then(() => {
      this.checkUser();
    }).catch(error => {
      console.warn('AUTH DEBUG: Background initialization failed:', error);
    });

    // Check premium status after user is loaded
    this.checkPremiumStatus();
  }

  async checkPremiumStatus() {
    try {
      if (!this.user || !this.user.email) {
        this.setUserTier('Basic');
        return;
      }

      // First check localStorage for premium status (for immediate updates after payment)
      const premiumStatus = localStorage.getItem(`premium_${this.user.email}`);
      if (premiumStatus === 'true') {
        console.log('💎 Premium user detected in avatar system from localStorage:', this.user.email);
        this.setUserTier('Premium');
        return;
      }

      // Check Supabase for premium status
      if (window.PremiumUsersService) {
        try {
          const isPremium = await window.PremiumUsersService.isPremiumUser(this.user.email);
          if (isPremium) {
            console.log('💎 Premium user detected in avatar system from Supabase:', this.user.email);
            this.setUserTier('Premium');
            // Cache in localStorage for faster future checks
            localStorage.setItem(`premium_${this.user.email}`, 'true');
            return;
          }
        } catch (error) {
          console.log('⚠️ Supabase check failed in avatar system, falling back to local list:', error);
        }
      } else {
        // Wait for PremiumUsersService to be loaded
        console.log('⏳ PremiumUsersService not loaded yet, waiting...');
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts && !window.PremiumUsersService) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (window.PremiumUsersService) {
          try {
            const isPremium = await window.PremiumUsersService.isPremiumUser(this.user.email);
            if (isPremium) {
              console.log('💎 Premium user detected in avatar system from Supabase (after waiting):', this.user.email);
              this.setUserTier('Premium');
              localStorage.setItem(`premium_${this.user.email}`, 'true');
              return;
            }
          } catch (error) {
            console.log('⚠️ Supabase check failed after waiting, falling back to local list:', error);
          }
        }
      }

      // Fallback to local premium emails list
      const premiumEmails = [
        'kaycheckmate@gmail.com',
        'truesliks@gmail.com',
        // Add payment emails here - these users have paid for premium
        // Add your payment email below:
        // 'your-payment-email@example.com',
        // Add more premium emails here
      ];

      if (premiumEmails.includes(this.user.email.toLowerCase())) {
        console.log('💎 Premium user detected in avatar system from local list:', this.user.email);
        this.setUserTier('Premium');
        // Store in localStorage for future checks
        localStorage.setItem(`premium_${this.user.email}`, 'true');
      } else {
        console.log('📱 Basic user detected in avatar system:', this.user.email);
        this.setUserTier('Basic');
      }
    } catch (error) {
      console.error('❌ Error checking premium status:', error);
      this.setUserTier('Basic');
    }
  }

  setPremiumStatus(email, isPremium) {
    if (email) {
      localStorage.setItem(`premium_${email}`, isPremium ? 'true' : 'false');
      console.log(`💎 Avatar system premium status set for ${email}: ${isPremium ? 'Premium' : 'Basic'}`);

      // Update current user tier if email matches
      if (this.user?.email === email) {
        this.setUserTier(isPremium ? 'Premium' : 'Basic');
      }
    }
  }

  setUserTier(tier) {
    this.userTier = tier;
    this.isPremium = tier === 'Premium';
    console.log(`🎯 Avatar system user tier set to: ${tier}`);

    // Update dropdown if it's currently open
    if (this.isDropdownOpen) {
      this.renderDropdown();
    }
  }

  // Force refresh premium status from Supabase
  async refreshPremiumStatus() {
    console.log('🔄 Forcing premium status refresh...');
    await this.checkPremiumStatus();
  }

  async checkUser() {
    try {
      // First check for remembered login (localStorage)
      const rememberedUser = localStorage.getItem('tagyou_remembered_user');
      if (rememberedUser) {
        try {
          const userData = JSON.parse(rememberedUser);
          const expiryTime = userData.expiryTime;

          // Check if the remembered session is still valid (30 days)
          if (expiryTime && new Date().getTime() < expiryTime) {
            this.user = userData.user;
            this.rememberMe = true;
            console.log('AUTH DEBUG: Restored remembered user session');
            // Check premium status after user is loaded
            await this.checkPremiumStatus();
            return;
          } else {
            // Session expired, remove it
            localStorage.removeItem('tagyou_remembered_user');
            console.log('AUTH DEBUG: Remembered session expired, removed');
          }
        } catch (parseError) {
          console.error('AUTH DEBUG: Error parsing remembered user:', parseError);
          localStorage.removeItem('tagyou_remembered_user');
        }
      }

      // Check for current session (sessionStorage)
      if (this.authService) {
        this.user = this.authService.getCurrentUser();
        console.log('AUTH DEBUG: Current user from auth service:', this.user?.email || 'none');
      } else {
        const storedUser = sessionStorage.getItem('supabase_user');
        if (storedUser) {
          this.user = JSON.parse(storedUser);
          console.log('AUTH DEBUG: Current user from session storage:', this.user?.email || 'none');
        }
      }

      // Check premium status after user is loaded
      await this.checkPremiumStatus();

      // Update status indicator after user state is determined
      this.updateStatusIndicator();
    } catch (error) {
      console.error('AUTH DEBUG: Error checking user:', error);
    } finally {
      this.loading = false;
    }
  }

  createAvatarElement() {
    console.log('UI DEBUG: Creating avatar element...');
    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'avatar-container';
    avatarContainer.style.cssText = `
      position: fixed;
      top: 40px;
      right: 40px;
      z-index: 9999;
    `;

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

    if (this.user) {
      avatarButton.style.background = 'linear-gradient(135deg, #8b5cf6, #3b82f6, #14b8a6)';
    } else {
      avatarButton.style.background = 'linear-gradient(135deg, #9ca3af, #6b7280)';
    }

    const userIcon = document.createElement('div');
    // Check for saved avatar from multiple sources
    let savedAvatar = null;
    if (this.user) {
      // Check user metadata first
      savedAvatar = this.user.user_metadata?.avatar_url;
      // Then check localStorage
      if (!savedAvatar) {
        savedAvatar = localStorage.getItem(`avatar_${this.user.email}`);
      }
      // Then check profile data
      if (!savedAvatar) {
        const storedProfile = localStorage.getItem(`profile_${this.user.email}`);
        if (storedProfile) {
          try {
            const profile = JSON.parse(storedProfile);
            savedAvatar = profile.avatar_url;
          } catch (error) {
            console.error('Error parsing stored profile:', error);
          }
        }
      }
    }

    if (savedAvatar) {
      userIcon.innerHTML = `<img src="${savedAvatar}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
      userIcon.innerHTML = '<i class="fas fa-user" style="font-size: 24px; color: white;"></i>';
    }
    avatarButton.appendChild(userIcon);

    // Load profile from Supabase if user is logged in
    if (this.user && window.profileService) {
      this.loadUserProfile();
    }

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
      statusIndicator.style.backgroundColor = '#4ade80';
    } else {
      statusIndicator.style.backgroundColor = '#fb923c';
    }

    avatarButton.appendChild(statusIndicator);
    avatarButton.addEventListener('click', () => this.toggleDropdown());

    avatarContainer.appendChild(avatarButton);
    this.dropdownRef = avatarContainer;
    document.body.appendChild(avatarContainer);
  }

  toggleDropdown() {
    console.log('UI DEBUG: Toggle dropdown called, current state:', this.isDropdownOpen);
    this.isDropdownOpen = !this.isDropdownOpen;

    // Force check premium status when dropdown opens (non-blocking)
    if (this.isDropdownOpen && this.user) {
      this.refreshPremiumStatus().catch(error => {
        console.error('Error refreshing premium status:', error);
      });
    }

    this.renderDropdown();
  }

  renderDropdown() {
    console.log('UI DEBUG: Rendering dropdown, isOpen:', this.isDropdownOpen);
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

    setTimeout(() => {
      document.addEventListener('click', this.handleClickOutside.bind(this));
    }, 100);
  }

  renderAuthenticatedDropdown() {
    return `
      <div class="dropdown-header" style="background: linear-gradient(135deg, #8b5cf6, #3b82f6, #14b8a6); padding: 24px; color: white;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div class="current-avatar" style="width: 64px; height: 64px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); overflow: hidden;">
            ${this.user && (this.user.user_metadata?.avatar_url || localStorage.getItem(`avatar_${this.user.email}`)) ? `
              <img src="${this.user.user_metadata?.avatar_url || localStorage.getItem(`avatar_${this.user.email}`)}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">
            ` : `
              <i class="fas fa-user" style="font-size: 32px; color: white;"></i>
            `}
          </div>
          <div style="flex: 1;">
            <h3 style="font-weight: bold; font-size: 18px; margin: 0;">${this.getDisplayName()}</h3>
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 4px 0;">${this.user.email}</p>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              ${this.isPremium ? `
                <i class="fas fa-star" style="color: #fbbf24;"></i>
                <span style="font-size: 14px; color: rgba(255,255,255,0.9);">Premium User</span>
              ` : `
                <i class="fas fa-user" style="color: #9ca3af;"></i>
                <span style="font-size: 14px; color: rgba(255,255,255,0.9);">Basic User</span>
              `}
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
      </div>

      <div style="border-top: 1px solid #f3f4f6; margin: 8px 0;"></div>

      <div style="padding: 8px;">
        <button class="menu-button profile-edit-btn" style="width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px; border: none; background: none; cursor: pointer; border-radius: 8px; transition: background 0.2s;">
          <i class="fas fa-user-edit" style="color: #6b7280; font-size: 20px;"></i>
          <span style="font-size: 14px; font-weight: 500; color: #374151;">Edit Profile</span>
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
          <span>${this.isPremium ? 'Premium Plan' : 'Free Plan'}</span>
        </div>
        ${this.isPremium ? `
          <button class="avatar-premium-btn" style="width: 100%; background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 8px 16px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: default; transition: all 0.3s;">
            Premium 💎
          </button>
        ` : `
          <button class="avatar-upgrade-btn" style="width: 100%; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; padding: 8px 16px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s;">
            Upgrade 💎
          </button>
          <button class="refresh-premium-btn" style="width: 100%; background: #f3f4f6; color: #6b7280; padding: 4px 8px; border: none; border-radius: 4px; font-size: 12px; margin-top: 8px; cursor: pointer; transition: all 0.3s;">
            🔄 Refresh Premium Status
          </button>
        `}
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
    document.addEventListener('click', (e) => {
      if (e.target.closest('.signin-button')) {
        console.log('UI DEBUG: Sign in button clicked');
        this.showAuthModal = true;
        this.authMode = 'signin';
        this.isDropdownOpen = false;
        this.formData = { email: '', password: '', confirmPassword: '' }; // Reset form data
        this.renderAuthModal();
      } else if (e.target.closest('.signup-button')) {
        console.log('UI DEBUG: Sign up button clicked');
        this.showAuthModal = true;
        this.authMode = 'signup';
        this.isDropdownOpen = false;
        this.formData = { email: '', password: '', confirmPassword: '' }; // Reset form data
        this.renderAuthModal();
      } else if (e.target.closest('.signout-button')) {
        this.handleSignOut();
      } else if (e.target.closest('.avatar-upgrade-btn')) {
        this.handleUpgradeClick();
      } else if (e.target.closest('.refresh-premium-btn')) {
        console.log('UI DEBUG: Refresh premium status button clicked');
        this.refreshPremiumStatus();
      } else if (e.target.closest('.profile-edit-btn')) {
        console.log('UI DEBUG: Profile edit button clicked');
        this.showProfileEditModal().catch(error => {
          console.error('Error showing profile edit modal:', error);
        });
      } else if (e.target.closest('.carnival-button')) {
        this.toggleCarnivalDropdown();
      } else if (e.target.closest('.auth-modal') && !e.target.closest('.auth-modal > div')) {
        this.closeAuthModal();
      }
    });

    document.addEventListener('submit', (e) => {
      if (e.target.classList.contains('auth-form')) {
        console.log('FORM DEBUG: Form submitted');
        e.preventDefault();
        this.handleAuth();
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

  renderAuthModal() {
    console.log('UI DEBUG: Rendering auth modal, mode:', this.authMode);

    if (!this.showAuthModal) return;

    // Remove any existing auth modal to prevent duplicate IDs
    const existingModal = document.querySelector('.auth-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'auth-modal show';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      padding: 16px;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease, background 0.3s ease;
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
          ${this.authLoading ? `
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 8px 12px; background: rgba(139, 92, 246, 0.1); border-radius: 8px; color: #8b5cf6; font-size: 14px; font-weight: 500;">
              <div style="width: 16px; height: 16px; border: 2px solid white; border-top: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
              <span>${this.authMode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
            </div>
          ` : ''}
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
                <input type="email" id="auth-email" required value="${this.formData.email}" class="auth-input" style="width: 100%; padding: 8px 12px 8px 40px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box;" placeholder="Enter your email">
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">
                Password
              </label>
              <div style="position: relative;">
                <i class="fas fa-lock" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 16px;"></i>
                <input type="password" id="auth-password" required value="${this.formData.password}" class="auth-input" style="width: 100%; padding: 8px 12px 8px 40px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box;" placeholder="Enter your password">
              </div>
            </div>

            ${this.authMode === 'signin' ? `
              <div style="display: flex; align-items: center; gap: 8px; margin-top: -8px;">
                <input type="checkbox" id="remember-me" ${this.rememberMe ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: #8b5cf6;">
                <label for="remember-me" style="font-size: 14px; color: #6b7280; cursor: pointer; user-select: none;">
                  Remember me on this device
                </label>
              </div>
            ` : ''}

            ${this.authMode === 'signup' ? `
              <div>
                <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">
                  Confirm Password
                </label>
                <div style="position: relative;">
                  <i class="fas fa-lock" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 16px;"></i>
                  <input type="password" id="auth-confirm-password" required value="${this.formData.confirmPassword}" class="auth-input" style="width: 100%; padding: 8px 12px 8px 40px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box;" placeholder="Confirm your password">
                </div>
              </div>
            ` : ''}

            <button type="submit" class="auth-submit" ${this.authLoading ? 'disabled' : ''} style="width: 100%; background: #8b5cf6; color: white; padding: 12px 16px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;">
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

    // Add fade-in animation
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 10);

    // FIXED: Proper event listeners for the modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('.close-modal')) {
        this.closeAuthModal();
      }
    });

    const form = modal.querySelector('.auth-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('FORM DEBUG: Form submit handler fired');
      this.handleAuth();
    });

    const modeToggle = modal.querySelector('.auth-mode-toggle');
    modeToggle.addEventListener('click', () => {
      console.log('UI DEBUG: Mode toggle clicked, switching from', this.authMode);
      this.authMode = this.authMode === 'signin' ? 'signup' : 'signin';
      this.authError = '';
      this.authSuccess = '';
      this.formData = { email: '', password: '', confirmPassword: '' };
      this.closeAuthModal();
      setTimeout(() => this.renderAuthModal(), 100);
    });

    // FIXED: Proper input event listeners with correct field mapping
    const emailInput = modal.querySelector('#auth-email');
    const passwordInput = modal.querySelector('#auth-password');
    const confirmPasswordInput = modal.querySelector('#auth-confirm-password');

    if (emailInput) {
      emailInput.addEventListener('input', (e) => {
        console.log('INPUT DEBUG: Email changed:', e.target.value);
        this.formData.email = e.target.value;

        // Reset styling when user starts typing
        if (e.target.style.borderColor === 'rgb(239, 68, 68)') {
          e.target.style.borderColor = '#d1d5db';
          e.target.placeholder = 'Enter your email';
        }
      });
    }

    if (passwordInput) {
      passwordInput.addEventListener('input', (e) => {
        console.log('INPUT DEBUG: Password changed:', e.target.value ? '[HIDDEN]' : '');
        this.formData.password = e.target.value;
      });
    }

    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', (e) => {
        console.log('INPUT DEBUG: Confirm password changed:', e.target.value ? '[HIDDEN]' : '');
        this.formData.confirmPassword = e.target.value;
      });
    }

    // Remember Me checkbox
    const rememberMeCheckbox = modal.querySelector('#remember-me');
    if (rememberMeCheckbox) {
      rememberMeCheckbox.addEventListener('change', (e) => {
        this.rememberMe = e.target.checked;
        console.log('INPUT DEBUG: Remember me changed:', this.rememberMe);
      });
    }

    console.log('UI DEBUG: Auth modal rendered with event listeners attached');
  }

  async handleAuth() {
    console.log('AUTH DEBUG: ===== AUTHENTICATION FLOW STARTED =====');
    console.log('AUTH DEBUG: Mode:', this.authMode);
    console.log('AUTH DEBUG: Form data:', {
      email: this.formData.email,
      password: this.formData.password ? '[HIDDEN]' : '',
      confirmPassword: this.formData.confirmPassword ? '[HIDDEN]' : '',
      emailLength: this.formData.email.length,
      passwordLength: this.formData.password.length,
      confirmPasswordLength: this.formData.confirmPassword.length
    });
    console.log('AUTH DEBUG: Auth service available:', !!this.authService);
    console.log('AUTH DEBUG: Auth service initialized:', this.authService?.isInitialized);

    this.authLoading = true;
    this.authError = '';
    this.authSuccess = '';
    this.renderAuthModal(); // Update UI to show loading

    try {
      if (this.authMode === 'signup') {
        console.log('AUTH DEBUG: === SIGNUP FLOW ===');

        // Step 1: Validation
        if (!this.formData.email || !this.formData.password || !this.formData.confirmPassword) {
          this.authError = 'Please fill in all fields';
          console.log('AUTH DEBUG: Validation failed - missing fields');
          return;
        }

        if (!this.isValidEmail(this.formData.email)) {
          this.authError = 'Please enter a valid email address (e.g., user@domain.com)';
          console.log('AUTH DEBUG: Validation failed - invalid email format');
          // Clear email field and focus on it
          this.formData.email = '';
          this.renderAuthModal();
          setTimeout(() => {
            const emailInput = document.querySelector('#auth-email');
            if (emailInput) {
              emailInput.focus();
              emailInput.placeholder = 'Enter a valid email address';
              emailInput.style.borderColor = '#ef4444';
            }
          }, 100);
          return;
        }

        if (this.formData.password.length < 6) {
          this.authError = 'Password must be at least 6 characters long';
          console.log('AUTH DEBUG: Validation failed - password too short');
          return;
        }

        if (this.formData.password !== this.formData.confirmPassword) {
          this.authError = 'Passwords do not match';
          console.log('AUTH DEBUG: Validation failed - passwords do not match');
          return;
        }

        console.log('AUTH DEBUG: Validation passed, proceeding with signup');

        // Step 2: Attempt signup
        const result = await this.authService.signUp(this.formData.email, this.formData.password);
        console.log('AUTH DEBUG: Signup result:', result);

        if (result.success) {
          this.authSuccess = 'Account created successfully! Please check your email to verify your account.';
          console.log('AUTH DEBUG: Signup successful');
          // Close modal quickly after showing success message
          setTimeout(() => {
            this.closeAuthModal();
          }, 1000);
        } else {
          this.authError = result.error || 'Failed to create account. Please try again.';
          console.log('AUTH DEBUG: Signup failed:', result.error);
        }

      } else {
        console.log('AUTH DEBUG: === SIGNIN FLOW ===');

        // Step 1: Validation
        if (!this.formData.email || !this.formData.password) {
          this.authError = 'Please fill in all fields';
          console.log('AUTH DEBUG: Validation failed - missing fields');
          return;
        }

        if (!this.isValidEmail(this.formData.email)) {
          this.authError = 'Please enter a valid email address (e.g., user@domain.com)';
          console.log('AUTH DEBUG: Validation failed - invalid email format');
          // Clear email field and focus on it
          this.formData.email = '';
          this.renderAuthModal();
          setTimeout(() => {
            const emailInput = document.querySelector('#auth-email');
            if (emailInput) {
              emailInput.focus();
              emailInput.placeholder = 'Enter a valid email address';
              emailInput.style.borderColor = '#ef4444';
            }
          }, 100);
          return;
        }

        if (this.formData.password.length < 6) {
          this.authError = 'Password must be at least 6 characters long';
          console.log('AUTH DEBUG: Validation failed - password too short');
          return;
        }

        console.log('AUTH DEBUG: Validation passed, proceeding with signin');

        // Step 2: Attempt signin
        const result = await this.authService.signIn(this.formData.email, this.formData.password);
        console.log('AUTH DEBUG: Signin result:', result);

        if (result.success) {
          this.authSuccess = 'Signed in successfully! Welcome back!';
          this.user = result.user;
          console.log('AUTH DEBUG: Signin successful, user:', this.user?.email);

          // Handle Remember Me functionality
          if (this.rememberMe) {
            // Save to localStorage for persistent login (30 days)
            const expiryTime = new Date().getTime() + (30 * 24 * 60 * 60 * 1000); // 30 days
            const rememberData = {
              user: this.user,
              expiryTime: expiryTime
            };
            localStorage.setItem('tagyou_remembered_user', JSON.stringify(rememberData));
            console.log('AUTH DEBUG: User session saved for 30 days');
          } else {
            // Clear any existing remembered session
            localStorage.removeItem('tagyou_remembered_user');
            console.log('AUTH DEBUG: Remembered session cleared');
          }

          // Close modal immediately and refresh UI
          setTimeout(() => {
            this.closeAuthModal();
            this.renderDropdown();
          }, 800);
        } else {
          this.authError = result.error || 'Sign in failed. Please check your credentials and try again.';
          console.log('AUTH DEBUG: Signin failed:', result.error);
        }
      }

    } catch (error) {
      console.error('AUTH DEBUG: Unexpected error in handleAuth:', error);
      this.authError = error.message || 'An unexpected error occurred. Please try again.';
    } finally {
      this.authLoading = false;
      this.renderAuthModal(); // Update UI to hide loading
      console.log('AUTH DEBUG: ===== AUTHENTICATION FLOW COMPLETED =====');
    }
  }

  async handleSignOut() {
    console.log('AUTH DEBUG: Sign out initiated');
    this.authLoading = true;

    try {
      if (this.authService && this.authService.signOut) {
        const result = await this.authService.signOut();
        console.log('AUTH DEBUG: Sign out result:', result);
      }

      // Clear user data regardless of service result
      sessionStorage.removeItem('supabase_user');
      localStorage.removeItem('tagyou_remembered_user'); // Clear remembered session
      this.user = null;
      this.rememberMe = false;
      this.isDropdownOpen = false;

      // Update UI
      this.createAvatarElement(); // Recreate avatar with guest styling
      this.renderDropdown();
      this.updateStatusIndicator();

      console.log('AUTH DEBUG: Sign out completed');
    } catch (error) {
      console.error('AUTH DEBUG: Error during sign out:', error);
    } finally {
      this.authLoading = false;
    }
  }

  closeAuthModal() {
    console.log('UI DEBUG: Closing auth modal');
    this.showAuthModal = false;
    const modal = document.querySelector('.auth-modal');
    if (modal) {
      // Smooth fade-out animation for both modal and background
      modal.style.opacity = '0';
      modal.style.transform = 'scale(0.95)';
      modal.style.background = 'rgba(0, 0, 0, 0)'; // Fade background to transparent

      // Remove modal after animation completes
      setTimeout(() => {
        if (modal && modal.parentNode) {
          modal.remove();
        }
      }, 300); // Slightly longer duration for smoother transition
    }
    // Reset form data when modal closes
    this.formData = { email: '', password: '', confirmPassword: '' };
    this.authError = '';
    this.authSuccess = '';
  }

  // Carnival dropdown methods (keeping existing functionality)
  toggleCarnivalDropdown() {
    this.isCarnivalDropdownOpen = !this.isCarnivalDropdownOpen;
    this.renderCarnivalDropdown();
  }

  renderCarnivalDropdown() {
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

    if (this.dropdownRef) {
      this.dropdownRef.appendChild(dropdown);
      setTimeout(() => {
        dropdown.style.transform = 'translateY(0)';
        dropdown.style.opacity = '1';
      }, 10);

      // Add click handlers for carnival items
      const carnivalItems = dropdown.querySelectorAll('.carnival-item');
      carnivalItems.forEach(item => {
        item.addEventListener('click', () => {
          const carnivalName = item.dataset.carnivalName;
          console.log('🎭 Carnival item clicked:', carnivalName);

          // Special handling for Notting Hill Carnival
          if (carnivalName === 'Notting Hill Carnival') {
            console.log('🎭 Notting Hill Carnival clicked - toggling route');
            this.toggleCarnivalRoute();
          } else {
            console.log('🎭 Other carnival clicked:', carnivalName);
            // Add tracking functionality for other carnivals
            const carnivalId = item.dataset.carnivalId;
            if (this.trackedCarnivals.has(carnivalId)) {
              this.trackedCarnivals.delete(carnivalId);
              item.style.background = 'white';
            } else {
              this.trackedCarnivals.add(carnivalId);
              item.style.background = '#f0f9ff';
            }
          }

          // Close the carnival dropdown
          this.isCarnivalDropdownOpen = false;
          this.renderCarnivalDropdown();
        });

        // Add hover effects
        item.addEventListener('mouseenter', () => {
          item.style.transform = 'translateY(-2px)';
          item.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        });

        item.addEventListener('mouseleave', () => {
          item.style.transform = 'translateY(0)';
          item.style.boxShadow = 'none';
        });
      });
    }
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
            border: 1px solid ${carnival.name === 'Notting Hill Carnival' && window.carnivalRouteActive ? '#8b5cf6' : '#f3f4f6'};
            background: ${this.trackedCarnivals.has(carnival.id) ? '#f0f9ff' : 'white'};
            ${carnival.name === 'Notting Hill Carnival' && window.carnivalRouteActive ? 'box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);' : ''}
          ">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="flex: 1;">
                <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 8px;">
                  ${carnival.name}
                  ${carnival.name === 'Notting Hill Carnival' && window.carnivalRouteActive ? '<i class="fas fa-star" style="color: #8b5cf6; font-size: 12px;"></i>' : ''}
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
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  toggleCarnivalRoute() {
    if (typeof window.showCarnivalRoute === 'function' &&
      typeof window.showJudgingZone === 'function' &&
      typeof window.showStartFlag === 'function') {

      if (window.carnivalRouteActive) {
        if (window.carnivalRoute && window.map) {
          window.map.removeLayer(window.carnivalRoute);
          window.carnivalRoute = null;
        }
        if (window.startFlag && window.map) {
          window.map.removeLayer(window.startFlag);
          window.startFlag = null;
        }
        const judgingZone = document.querySelector('.judging-zone-label');
        if (judgingZone) {
          judgingZone.remove();
        }
        window.carnivalRouteActive = false;

        const compassButton = document.getElementById('compassBtn');
        if (compassButton) {
          compassButton.classList.remove('active');
        }

        console.log('🎭 Carnival route hidden');

        // Refresh carnival dropdown if it's open
        if (this.isCarnivalDropdownOpen) {
          this.renderCarnivalDropdown();
        }
      } else {
        window.showCarnivalRoute();
        window.showJudgingZone();
        window.showStartFlag();

        const compassButton = document.getElementById('compassBtn');
        if (compassButton) {
          compassButton.classList.add('active');
        }

        console.log('🎭 Carnival route activated');

        // Refresh carnival dropdown if it's open
        if (this.isCarnivalDropdownOpen) {
          this.renderCarnivalDropdown();
        }
      }
    } else {
      console.warn('🎭 Carnival route functions not found. Make sure the main script is loaded.');
    }
  }

  handleUpgradeClick() {
    console.log('UI DEBUG: Avatar upgrade button clicked');

    // Close dropdown
    this.isDropdownOpen = false;
    this.renderDropdown();

    // Use carnival tracker's upgrade handler if available
    if (window.carnivalTracker && window.carnivalTracker.handleUpgradeClick) {
      console.log('UI DEBUG: Using carnival tracker upgrade handler');
      window.carnivalTracker.handleUpgradeClick();
    } else {
      console.log('UI DEBUG: Carnival tracker not available, showing fallback upgrade modal');
      this.showFallbackUpgradeModal();
    }
  }

  showFallbackUpgradeModal() {
    // Create a simple upgrade modal if carnival tracker is not available
    const modal = document.createElement('div');
    modal.className = 'fallback-upgrade-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      padding: 16px;
    `;

    modal.innerHTML = `
      <div style="background: white; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); max-width: 448px; width: 100%; padding: 24px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">💎</div>
        <h2 style="font-size: 24px; font-weight: bold; margin: 0 0 16px 0; color: #374151;">Upgrade to Premium</h2>
        <p style="color: #6b7280; margin: 0 0 24px 0; line-height: 1.6;">
          Unlock unlimited squad members and advanced features for your carnival tracking experience.
        </p>
        <button class="fallback-upgrade-btn" style="width: 100%; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
          Get 3-Month Deal
        </button>
        <button class="fallback-close-btn" style="width: 100%; background: #f3f4f6; color: #374151; padding: 12px 24px; border: none; border-radius: 8px; font-size: 16px; font-weight: 500; cursor: pointer; margin-top: 12px; transition: all 0.3s;">
          Maybe Later
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('.fallback-upgrade-btn').addEventListener('click', () => {
      modal.remove();
      // Try to use carnival tracker's upgrade method
      if (window.carnivalTracker && window.carnivalTracker.upgradeToPremium) {
        window.carnivalTracker.upgradeToPremium();
      } else {
        alert('Upgrade functionality not available. Please try again later.');
      }
    });

    modal.querySelector('.fallback-close-btn').addEventListener('click', () => {
      modal.remove();
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  async showProfileEditModal() {
    // Remove any existing modals
    const existingModal = document.querySelector('.profile-edit-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Get current user data from multiple sources
    let currentName = this.user?.user_metadata?.full_name || '';
    const currentEmail = this.user?.email || '';
    let currentAvatar = this.user?.user_metadata?.avatar_url || '';

    // Try to get saved profile data
    if (this.user) {
      // Check localStorage first
      const storedProfile = localStorage.getItem(`profile_${this.user.email}`);
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile);
          if (profile.full_name) currentName = profile.full_name;
          if (profile.avatar_url) currentAvatar = profile.avatar_url;
        } catch (error) {
          console.error('Error parsing stored profile:', error);
        }
      }

      // Check Supabase profile if available
      if (window.profileService) {
        try {
          const profile = await window.profileService.getUserProfile(this.user.id);
          if (profile) {
            if (profile.avatar_url) currentAvatar = profile.avatar_url;
            if (profile.display_name) currentName = profile.display_name;
          }
        } catch (error) {
          console.error('Error loading profile from Supabase:', error);
        }
      }
    }

    const modal = document.createElement('div');
    modal.className = 'profile-edit-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      padding: 16px;
    `;

    modal.innerHTML = `
      <div style="background: white; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); max-width: 480px; width: 100%; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); padding: 24px; color: white;">
          <h2 style="font-size: 24px; font-weight: bold; margin: 0;">Edit Profile</h2>
          <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0 0;">Update your profile information and avatar</p>
        </div>

        <div style="padding: 24px;">
          <form class="profile-edit-form">
            <!-- Avatar Upload Section -->
            <div style="margin-bottom: 24px;">
              <label style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">Profile Picture</label>
              <div style="display: flex; align-items: center; gap: 16px;">
                <div class="current-avatar" style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #3b82f6); display: flex; align-items: center; justify-content: center; border: 3px solid #e5e7eb; overflow: hidden;">
                  ${currentAvatar ? `
                    <img src="${currentAvatar}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">
                  ` : `
                    <i class="fas fa-user" style="font-size: 32px; color: white;"></i>
                  `}
                </div>
                <div style="flex: 1;">
                  <input type="file" id="avatarUpload" accept="image/*" style="display: none;">
                  <button type="button" class="upload-avatar-btn" style="background: #f3f4f6; color: #374151; border: 2px dashed #d1d5db; padding: 12px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s; width: 100%; font-size: 14px;">
                    <i class="fas fa-camera" style="margin-right: 8px;"></i>
                    Upload New Photo
                  </button>
                  <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">JPG, PNG or GIF. Max 5MB.</p>
                </div>
              </div>
            </div>

            <!-- Name Field -->
            <div style="margin-bottom: 20px;">
              <label for="profileName" style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">Full Name</label>
              <input type="text" id="profileName" value="${currentName}" placeholder="Enter your full name" style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: border-color 0.2s;">
            </div>

            <!-- Email Field (Read-only) -->
            <div style="margin-bottom: 24px;">
              <label for="profileEmail" style="display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">Email Address</label>
              <input type="email" id="profileEmail" value="${currentEmail}" readonly style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: #f9fafb; color: #6b7280;">
              <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">Email cannot be changed</p>
            </div>

            <!-- Action Buttons -->
            <div style="display: flex; gap: 12px;">
              <button type="submit" class="save-profile-btn" style="flex: 1; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; padding: 12px 24px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                Save Changes
              </button>
              <button type="button" class="cancel-profile-btn" style="flex: 1; background: #f3f4f6; color: #374151; padding: 12px 24px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    const uploadBtn = modal.querySelector('.upload-avatar-btn');
    const fileInput = modal.querySelector('#avatarUpload');
    const currentAvatarDiv = modal.querySelector('.current-avatar');
    const form = modal.querySelector('.profile-edit-form');
    const cancelBtn = modal.querySelector('.cancel-profile-btn');

    // Handle avatar upload
    uploadBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB');
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file');
          return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          currentAvatarDiv.innerHTML = `<img src="${e.target.result}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">`;
        };
        reader.readAsDataURL(file);
      }
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveProfileChanges(modal);
    });

    // Handle cancel
    cancelBtn.addEventListener('click', () => {
      modal.remove();
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // Compress image for faster upload (mobile optimized)
  async compressImage(file) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Check if device is mobile for different compression settings
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Set maximum dimensions for avatar (smaller for mobile)
        const maxWidth = isMobile ? 200 : 300;
        const maxHeight = isMobile ? 200 : 300;

        // Calculate new dimensions
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        // Use higher compression for mobile (70% quality vs 80% for desktop)
        const quality = isMobile ? 0.7 : 0.8;

        // Convert to blob with optimized quality
        canvas.toBlob((blob) => {
          // Create new file with compressed data
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  async saveProfileChanges(modal) {
    const nameInput = modal.querySelector('#profileName');
    const fileInput = modal.querySelector('#avatarUpload');
    const newName = nameInput.value.trim();
    const newAvatarFile = fileInput.files[0];

    try {
      // Show loading state
      const saveBtn = modal.querySelector('.save-profile-btn');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Saving...';
      saveBtn.disabled = true;

      let avatarUrl = null;

      // Handle avatar upload if file is selected
      if (newAvatarFile) {
        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (newAvatarFile.size > maxSize) {
          alert('Image file is too large. Please select an image smaller than 5MB.');
          saveBtn.textContent = originalText;
          saveBtn.disabled = false;
          return;
        }

        // Compress and optimize image
        const optimizedFile = await this.compressImage(newAvatarFile);

        // Update loading text
        saveBtn.textContent = 'Processing image...';

        // Create data URL for the avatar (fast local storage)
        avatarUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target.result;
            localStorage.setItem(`avatar_${this.user.email}`, dataUrl);
            resolve(dataUrl);
          };
          reader.readAsDataURL(optimizedFile);
        });

        // Update loading text
        saveBtn.textContent = 'Uploading to cloud...';

        // Try to upload to Supabase Storage (optional, non-blocking)
        if (window.profileService) {
          try {
            const uploadResult = await window.profileService.uploadAvatar(this.user.id, optimizedFile);
            if (uploadResult.success) {
              avatarUrl = uploadResult.url; // Use cloud URL if available
              localStorage.setItem(`avatar_${this.user.email}`, avatarUrl);
            } else {
              console.log('Storage upload failed, using data URL:', uploadResult.error);
              // avatarUrl remains as data URL
            }
          } catch (uploadError) {
            console.log('Storage upload error, using data URL:', uploadError);
            // Continue with data URL
          }
        }
      }

      // Update profile in Supabase (with fallback to localStorage)
      if (window.profileService && this.user) {
        const profileUpdates = {
          avatar_url: avatarUrl || null,
          display_name: newName || null
        };

        console.log('Attempting to update profile in Supabase with:', profileUpdates);

        const updateResult = await window.profileService.updateProfile(this.user.id, profileUpdates);
        if (updateResult.success) {
          console.log('Profile updated successfully in Supabase:', updateResult.data);
        } else {
          console.log('Supabase update failed, using localStorage fallback:', updateResult.error);
          // Store in localStorage as fallback
          localStorage.setItem(`profile_${this.user.email}`, JSON.stringify({
            full_name: newName,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          }));
        }
      } else {
        // No profile service available, use localStorage
        localStorage.setItem(`profile_${this.user.email}`, JSON.stringify({
          full_name: newName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        }));
      }

      // Update user metadata in Supabase Auth
      const updates = {
        user_metadata: {
          full_name: newName
        }
      };

      if (avatarUrl) {
        updates.user_metadata.avatar_url = avatarUrl;
      }

      if (window.supabaseClient && this.user) {
        try {
          const { error } = await window.supabaseClient.auth.updateUser(updates);
          if (error) {
            console.error('Error updating user metadata:', error);
          } else {
            console.log('User metadata updated successfully');
            // Update local user object
            this.user = { ...this.user, ...updates };
          }
        } catch (error) {
          console.error('Error updating user metadata:', error);
        }
      }

      // Update the avatar in the UI
      if (avatarUrl) {
        this.updateAvatarDisplay(avatarUrl);
      }

      // Show success message
      saveBtn.textContent = 'Saved!';
      saveBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

      setTimeout(() => {
        modal.remove();
        // Refresh the dropdown to show updated info
        this.renderDropdown();
        // Also refresh the main avatar button
        this.refreshMainAvatar();
      }, 1000);

    } catch (error) {
      console.error('Error saving profile:', error);
      const saveBtn = modal.querySelector('.save-profile-btn');
      saveBtn.textContent = 'Error - Try Again';
      saveBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';

      setTimeout(() => {
        saveBtn.textContent = 'Save Changes';
        saveBtn.style.background = 'linear-gradient(135deg, #8b5cf6, #3b82f6)';
        saveBtn.disabled = false;
      }, 2000);
    }
  }

  updateAvatarDisplay(avatarUrl) {
    // Preload image for better mobile performance
    const preloadImage = new Image();
    preloadImage.onload = () => {
      // Update the main avatar button
      const avatarButton = document.querySelector('.avatar-button');
      if (avatarButton) {
        const userIcon = avatarButton.querySelector('div');
        if (userIcon) {
          userIcon.innerHTML = `<img src="${avatarUrl}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
      }

      // Update the dropdown header avatar
      const dropdownAvatar = document.querySelector('.dropdown-header .current-avatar');
      if (dropdownAvatar) {
        dropdownAvatar.innerHTML = `<img src="${avatarUrl}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      }
    };

    preloadImage.onerror = () => {
      console.warn('Failed to load avatar image:', avatarUrl);
      // Fallback to default icon
      this.showDefaultAvatar();
    };

    // Start loading the image
    preloadImage.src = avatarUrl;
  }

  showDefaultAvatar() {
    // Show default user icon if image fails to load
    const avatarButton = document.querySelector('.avatar-button');
    if (avatarButton) {
      const userIcon = avatarButton.querySelector('div');
      if (userIcon) {
        userIcon.innerHTML = '<i class="fas fa-user" style="font-size: 24px; color: white;"></i>';
      }
    }

    const dropdownAvatar = document.querySelector('.dropdown-header .current-avatar');
    if (dropdownAvatar) {
      dropdownAvatar.innerHTML = '<i class="fas fa-user" style="font-size: 24px; color: white;"></i>';
    }
  }

  updateStatusIndicator() {
    const statusIndicator = document.querySelector('.status-indicator');
    if (statusIndicator) {
      if (this.user) {
        statusIndicator.style.backgroundColor = '#4ade80'; // Green for logged in
      } else {
        statusIndicator.style.backgroundColor = '#fb923c'; // Orange for no user
      }
    }
  }

  refreshMainAvatar() {
    const avatarButton = document.querySelector('.avatar-button');
    if (avatarButton && this.user) {
      const userIcon = avatarButton.querySelector('div');
      if (userIcon) {
        // Check for saved avatar from multiple sources
        let savedAvatar = this.user.user_metadata?.avatar_url;
        if (!savedAvatar) {
          savedAvatar = localStorage.getItem(`avatar_${this.user.email}`);
        }

        if (savedAvatar) {
          // Use preloaded image for better mobile performance
          const preloadImage = new Image();
          preloadImage.onload = () => {
            userIcon.innerHTML = `<img src="${savedAvatar}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
          };
          preloadImage.onerror = () => {
            userIcon.innerHTML = '<i class="fas fa-user" style="font-size: 24px; color: white;"></i>';
          };
          preloadImage.src = savedAvatar;
        } else {
          userIcon.innerHTML = '<i class="fas fa-user" style="font-size: 24px; color: white;"></i>';
        }
      }
    }
  }

  getDisplayName() {
    if (!this.user) return 'User';

    // Check multiple sources for the best name
    let name = this.user.user_metadata?.full_name;
    if (!name) {
      const storedProfile = localStorage.getItem(`profile_${this.user.email}`);
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile);
          name = profile.full_name;
        } catch (error) {
          console.error('Error parsing stored profile:', error);
        }
      }
    }

    return name || 'User';
  }

  async loadUserProfile() {
    try {
      if (!this.user) {
        return;
      }

      let avatarFound = false;

      // For mobile devices, prioritize localStorage for faster loading
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        // On mobile, check localStorage first for instant loading
        const storedProfile = localStorage.getItem(`profile_${this.user.email}`);
        if (storedProfile) {
          try {
            const profile = JSON.parse(storedProfile);
            if (profile.avatar_url) {
              this.updateAvatarDisplay(profile.avatar_url);
              localStorage.setItem(`avatar_${this.user.email}`, profile.avatar_url);
              this.refreshMainAvatar();
              avatarFound = true;
            }
            if (profile.full_name) {
              this.user.user_metadata = {
                ...this.user.user_metadata,
                full_name: profile.full_name
              };
            }
            console.log('Profile loaded from localStorage (mobile):', profile);
          } catch (error) {
            console.error('Error parsing stored profile:', error);
          }
        }
      }

      // Then try to load from Supabase (background sync)
      if (window.profileService) {
        try {
          const profile = await window.profileService.getUserProfile(this.user.id);
          if (profile) {
            // Update avatar if profile has one and we don't have one yet
            if (profile.avatar_url && !avatarFound) {
              this.updateAvatarDisplay(profile.avatar_url);
              localStorage.setItem(`avatar_${this.user.email}`, profile.avatar_url);
              this.refreshMainAvatar();
              avatarFound = true;
            }

            // Update user metadata if profile has name
            if (profile.display_name && (!this.user.user_metadata?.full_name || this.user.user_metadata.full_name !== profile.display_name)) {
              this.user.user_metadata = {
                ...this.user.user_metadata,
                full_name: profile.display_name
              };
            }

            console.log('Profile loaded from Supabase:', profile);
          }
        } catch (error) {
          console.error('Error loading profile from Supabase:', error);
        }
      }

      // If still no avatar found and not mobile, check localStorage as fallback
      if (!avatarFound && !isMobile) {
        const storedProfile = localStorage.getItem(`profile_${this.user.email}`);
        if (storedProfile) {
          try {
            const profile = JSON.parse(storedProfile);
            if (profile.avatar_url) {
              this.updateAvatarDisplay(profile.avatar_url);
              localStorage.setItem(`avatar_${this.user.email}`, profile.avatar_url);
              this.refreshMainAvatar();
              avatarFound = true;
            }
            if (profile.full_name) {
              this.user.user_metadata = {
                ...this.user.user_metadata,
                full_name: profile.full_name
              };
            }
            console.log('Profile loaded from localStorage (fallback):', profile);
          } catch (error) {
            console.error('Error parsing stored profile:', error);
          }
        }
      }

      // If still no avatar, check user metadata
      if (!avatarFound && this.user.user_metadata?.avatar_url) {
        this.updateAvatarDisplay(this.user.user_metadata.avatar_url);
        localStorage.setItem(`avatar_${this.user.email}`, this.user.user_metadata.avatar_url);
        this.refreshMainAvatar();
        console.log('Avatar loaded from user metadata');
      }

      // Try to create profile in Supabase if service is available
      if (window.profileService && this.user.id && this.user.email) {
        const initResult = await window.profileService.initializeProfile(
          this.user.id,
          this.user.email,
          this.user.user_metadata?.full_name || ''
        );
        if (initResult.success) {
          console.log('Profile initialized in Supabase');
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
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
  if (!window.avatarSystem) {
    window.avatarSystem = new AvatarSystem();
  }
}

// Add CSS animations and styles
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
    border-color: #8b5cf6 !important;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1) !important;
  }
  
  .auth-submit:hover:not(:disabled) {
    background-color: #7c3aed !important;
  }
  
  .auth-submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .auth-mode-toggle:hover {
    color: #7c3aed !important;
  }
  
  .close-modal:hover {
    color: #374151 !important;
  }
  
  .carnival-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: #8b5cf6;
  }
  
  .carnival-item[data-carnival-id="1"]:hover {
    background: linear-gradient(135deg, #f8fafc, #f1f5f9) !important;
    border-color: #8b5cf6 !important;
    box-shadow: 0 10px 30px rgba(139, 92, 246, 0.2) !important;
  }
`;
document.head.appendChild(style);