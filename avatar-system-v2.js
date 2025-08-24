// Avatar System V2 - Simplified and Reliable
class AvatarSystemV2 {
  constructor() {
    this.user = null;
    this.authMode = 'signin';
    this.showAuthModal = false;
    this.formData = { email: '', password: '', confirmPassword: '' };
    this.authLoading = false;
    this.authError = '';
    this.authSuccess = '';
    this.isDropdownOpen = false;
    this.isCarnivalDropdownOpen = false;
    this.supabase = null;
    this.initialized = false;

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

  async init() {
    console.log('🚀 Avatar System V2: Starting initialization...');

    // Wait for Supabase SDK to be available
    await this.waitForSupabase();

    // Initialize Supabase client
    await this.initializeSupabase();

    // Check for existing user
    await this.checkCurrentUser();

    // Create UI
    this.createAvatarElement();
    this.setupEventListeners();

    console.log('✅ Avatar System V2: Initialization complete');
  }

  async waitForSupabase() {
    console.log('⏳ Avatar System V2: Waiting for Supabase SDK...');

    let attempts = 0;
    const maxAttempts = 100; // 10 seconds

    while (!window.supabase && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.supabase) {
      throw new Error('Supabase SDK not available after 10 seconds');
    }

    console.log('✅ Avatar System V2: Supabase SDK ready');
  }

  async initializeSupabase() {
    console.log('🔐 Avatar System V2: Initializing Supabase client...');

    try {
      // Import configuration
      const config = await import('./supabase-config-secret.js');

      // Create Supabase client
      this.supabase = window.supabase.createClient(
        config.default.supabaseUrl,
        config.default.supabaseAnonKey
      );

      // Set up auth state listener
      this.supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔐 Avatar System V2: Auth state changed:', event, session?.user?.email);
        this.user = session?.user || null;
        this.renderDropdown();
      });

      this.initialized = true;
      console.log('✅ Avatar System V2: Supabase client initialized');

    } catch (error) {
      console.error('❌ Avatar System V2: Failed to initialize Supabase:', error);
      throw error;
    }
  }

  async checkCurrentUser() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      this.user = user;
      console.log('🔐 Avatar System V2: Current user:', user?.email);
    } catch (error) {
      console.log('🔐 Avatar System V2: No current user');
      this.user = null;
    }
  }

  createAvatarElement() {
    console.log('🎨 Avatar System V2: Creating avatar element...');

    // Remove existing avatar if present
    const existingAvatar = document.querySelector('.avatar-container');
    if (existingAvatar) {
      existingAvatar.remove();
    }

    // Create avatar container
    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'avatar-container';
    avatarContainer.style.cssText = `
      position: fixed;
      top: 40px;
      right: 40px;
      z-index: 9999;
    `;

    console.log('🎨 Avatar System V2: Avatar container created');

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
      background: linear-gradient(135deg, #8b5cf6, #3b82f6);
      color: white;
      font-weight: bold;
      font-size: 18px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.2s ease;
    `;

    // Set initial avatar content
    this.updateAvatarContent(avatarButton);

    // Add click handler
    avatarButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    avatarContainer.appendChild(avatarButton);
    document.body.appendChild(avatarContainer);

    console.log('🎨 Avatar System V2: Avatar element added to DOM');
    console.log('🎨 Avatar System V2: Avatar container found:', !!document.querySelector('.avatar-container'));
    console.log('🎨 Avatar System V2: Avatar button found:', !!document.querySelector('.avatar-button'));
  }

  updateAvatarContent(button) {
    if (this.user) {
      // User is signed in
      const displayName = this.user.user_metadata?.full_name ||
        this.user.email?.split('@')[0] ||
        'U';
      button.textContent = displayName.charAt(0).toUpperCase();
      button.title = this.user.email;
    } else {
      // User is not signed in
      button.innerHTML = '<i class="fas fa-user"></i>';
      button.title = 'Sign In';
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.renderDropdown();
  }

  renderDropdown() {
    // Remove existing dropdown
    const existingDropdown = document.querySelector('.avatar-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
    }

    if (!this.isDropdownOpen) return;

    const avatarContainer = document.querySelector('.avatar-container');
    if (!avatarContainer) return;

    const dropdown = document.createElement('div');
    dropdown.className = 'avatar-dropdown';
    dropdown.style.cssText = `
      position: absolute;
      top: 60px;
      right: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      min-width: 280px;
      overflow: hidden;
      z-index: 10000;
    `;

    if (this.user) {
      // Authenticated user dropdown
      dropdown.innerHTML = `
        <div style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; padding: 20px;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">
            ${this.user.user_metadata?.full_name || this.user.email?.split('@')[0]}
          </div>
          <div style="font-size: 14px; opacity: 0.9;">${this.user.email}</div>
          <div style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 12px; font-size: 12px; margin-top: 8px; display: inline-block;">
            Premium User <i class="fas fa-star" style="margin-left: 4px;"></i>
          </div>
        </div>
        
        <div style="padding: 8px 0;">
          <div class="dropdown-item" data-action="carnivals" style="padding: 12px 20px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background 0.2s;">
            <i class="fas fa-map-marker-alt" style="color: #8b5cf6;"></i>
            <span>UK Carnivals</span>
            <i class="fas fa-chevron-right" style="margin-left: auto; font-size: 12px; opacity: 0.6;"></i>
          </div>
          
          <div class="dropdown-item" data-action="notifications" style="padding: 12px 20px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background 0.2s;">
            <i class="fas fa-bell" style="color: #8b5cf6;"></i>
            <span>Notifications</span>
            <div style="background: #ef4444; color: white; padding: 2px 6px; border-radius: 10px; font-size: 11px; margin-left: auto;">3</div>
          </div>
          
          <div class="dropdown-item" data-action="settings" style="padding: 12px 20px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background 0.2s;">
            <i class="fas fa-cog" style="color: #8b5cf6;"></i>
            <span>Settings</span>
          </div>
          
          <div class="dropdown-item" data-action="help" style="padding: 12px 20px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background 0.2s;">
            <i class="fas fa-question-circle" style="color: #8b5cf6;"></i>
            <span>Help & Support</span>
          </div>
          
          <div class="dropdown-item" data-action="signout" style="padding: 12px 20px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background 0.2s; border-top: 1px solid #f3f4f6; margin-top: 8px;">
            <i class="fas fa-sign-out-alt" style="color: #ef4444;"></i>
            <span style="color: #ef4444;">Sign Out</span>
          </div>
        </div>
        
        <div style="background: #f8fafc; padding: 16px 20px; border-top: 1px solid #f3f4f6;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 14px; color: #6b7280;">Joined Today</span>
            <span style="font-size: 14px; color: #6b7280;">Free Plan</span>
          </div>
          <button class="upgrade-btn" style="width: 100%; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 500; cursor: pointer; transition: transform 0.2s;">
            Upgrade to Pro
          </button>
        </div>
        
        <div style="padding: 12px 20px; text-align: center; color: #6b7280; font-size: 12px;">
          Pull up for more
        </div>
      `;
    } else {
      // Guest user dropdown
      dropdown.innerHTML = `
        <div style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; padding: 20px; text-align: center;">
          <div style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">Welcome to TagYou!</div>
          <div style="font-size: 14px; opacity: 0.9;">Sign in to track your favorite carnivals</div>
        </div>
        
        <div style="padding: 20px;">
          <button class="signin-btn" style="width: 100%; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 500; cursor: pointer; margin-bottom: 12px; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <i class="fas fa-sign-in-alt"></i>
            Sign In
          </button>
          
          <button class="signup-btn" style="width: 100%; background: white; color: #8b5cf6; border: 2px solid #8b5cf6; padding: 12px; border-radius: 8px; font-weight: 500; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <i class="fas fa-user-plus"></i>
            Create Account
          </button>
        </div>
      `;
    }

    // Add hover effects
    const dropdownItems = dropdown.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        item.style.background = '#f8fafc';
      });
      item.addEventListener('mouseleave', () => {
        item.style.background = 'transparent';
      });
    });

    avatarContainer.appendChild(dropdown);

    // Close dropdown when clicking outside
    setTimeout(() => {
      document.addEventListener('click', this.handleClickOutside.bind(this));
    }, 100);
  }

  handleClickOutside(event) {
    const avatarContainer = document.querySelector('.avatar-container');
    if (avatarContainer && !avatarContainer.contains(event.target)) {
      this.isDropdownOpen = false;
      this.renderDropdown();
      document.removeEventListener('click', this.handleClickOutside);
    }
  }

  setupEventListeners() {
    console.log('🎧 Avatar System V2: Setting up event listeners...');

    // Event delegation for dropdown actions
    document.addEventListener('click', (e) => {
      console.log('🎧 Avatar System V2: Click event detected on:', e.target);

      if (e.target.closest('.signin-btn')) {
        console.log('🎧 Avatar System V2: Sign in button clicked');
        this.showAuthModal = true;
        this.authMode = 'signin';
        this.isDropdownOpen = false;
        this.renderDropdown();
        this.renderAuthModal();
      } else if (e.target.closest('.signup-btn')) {
        console.log('🎧 Avatar System V2: Sign up button clicked');
        this.showAuthModal = true;
        this.authMode = 'signup';
        this.isDropdownOpen = false;
        this.renderDropdown();
        this.renderAuthModal();
      } else if (e.target.closest('[data-action="signout"]')) {
        console.log('🎧 Avatar System V2: Sign out clicked');
        this.handleSignOut();
      } else if (e.target.closest('[data-action="carnivals"]')) {
        console.log('🎧 Avatar System V2: Carnivals clicked');
        this.toggleCarnivalDropdown();
      }
    });

    // Form submission
    document.addEventListener('submit', (e) => {
      console.log('🎧 Avatar System V2: Form submit event detected on:', e.target);
      if (e.target.classList.contains('auth-form')) {
        console.log('🎧 Avatar System V2: Auth form submitted');
        e.preventDefault();
        this.handleAuth();
      }
    });

    // Input changes
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('auth-input')) {
        const field = e.target.id === 'auth-email' ? 'email' :
          e.target.id === 'auth-confirm-password' ? 'confirmPassword' : 'password';
        this.formData[field] = e.target.value;
      }
    });

    // Auth mode toggle
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('auth-mode-toggle')) {
        e.preventDefault();
        this.authMode = this.authMode === 'signin' ? 'signup' : 'signin';
        this.authError = '';
        this.authSuccess = '';
        this.renderAuthModal();
      }
    });
  }

  renderAuthModal() {
    console.log('🎨 Avatar System V2: Rendering auth modal, showAuthModal:', this.showAuthModal);

    // Remove existing modal
    const existingModal = document.querySelector('.auth-modal');
    if (existingModal) {
      existingModal.remove();
    }

    if (!this.showAuthModal) {
      console.log('🎨 Avatar System V2: Modal not shown, returning');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10001;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    modal.innerHTML = `
      <div style="background: white; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); max-width: 448px; width: 100%; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); padding: 24px; color: white; position: relative;">
          <button class="close-btn" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: white; font-size: 20px; cursor: pointer;">×</button>
          <h2 style="font-size: 24px; font-weight: bold; margin: 0;">
            ${this.authMode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0 0;">
            ${this.authMode === 'signin' ? 'Welcome back! Please sign in to your account.' : 'Join us to start tracking your favorite carnivals.'}
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
              <label for="auth-email" style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">
                Email Address
              </label>
              <div style="position: relative;">
                <i class="fas fa-envelope" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 16px;"></i>
                <input type="email" id="auth-email" name="email" required value="${this.formData.email}" class="auth-input" style="width: 100%; padding: 8px 12px 8px 40px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;" placeholder="Enter your email">
              </div>
            </div>

            <div>
              <label for="auth-password" style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">
                Password
              </label>
              <div style="position: relative;">
                <i class="fas fa-lock" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 16px;"></i>
                <input type="password" id="auth-password" name="password" required value="${this.formData.password}" class="auth-input" style="width: 100%; padding: 8px 12px 8px 40px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;" placeholder="Enter your password">
              </div>
            </div>

            ${this.authMode === 'signup' ? `
              <div>
                <label for="auth-confirm-password" style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">
                  Confirm Password
                </label>
                <div style="position: relative;">
                  <i class="fas fa-lock" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 16px;"></i>
                  <input type="password" id="auth-confirm-password" name="confirmPassword" required value="${this.formData.confirmPassword}" class="auth-input" style="width: 100%; padding: 8px 12px 8px 40px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;" placeholder="Confirm your password">
                </div>
              </div>
            ` : ''}

            <button type="submit" class="auth-submit-btn" ${this.authLoading ? 'disabled' : ''} style="width: 100%; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; ${this.authLoading ? 'opacity: 0.7; cursor: not-allowed;' : ''}">
              ${this.authLoading ? '<i class="fas fa-spinner fa-spin"></i>' : ''}
              <i class="fas ${this.authMode === 'signin' ? 'fa-sign-in-alt' : 'fa-user-plus'}"></i>
              <span>${this.authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            </button>
          </form>

          <div style="margin-top: 20px; text-align: center;">
            <p style="color: #6b7280; font-size: 14px;">
              ${this.authMode === 'signin' ? "Don't have an account?" : "Already have an account?"}
              <a href="#" class="auth-mode-toggle" style="color: #8b5cf6; text-decoration: none; font-weight: 500;">
                ${this.authMode === 'signin' ? 'Create Account' : 'Sign In'}
              </a>
            </p>
            ${this.authMode === 'signin' ? `
              <p style="margin-top: 8px;">
                <a href="#" class="forgot-password-link" style="color: #8b5cf6; text-decoration: none; font-size: 14px;">
                  Forgot Password?
                </a>
              </p>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add close button handler
    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeAuthModal();
      });
    }

    // Add modal backdrop click handler
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeAuthModal();
      }
    });

    // Animate in
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 10);
  }

  async handleAuth() {
    console.log('🔐 Avatar System V2: handleAuth called, mode:', this.authMode);

    this.authLoading = true;
    this.authError = '';
    this.authSuccess = '';
    this.renderAuthModal();

    try {
      if (this.authMode === 'signup') {
        // Validation
        if (!this.formData.email || !this.formData.password || !this.formData.confirmPassword) {
          this.authError = 'Please fill in all fields.';
          return;
        }

        if (this.formData.password !== this.formData.confirmPassword) {
          this.authError = 'Passwords do not match.';
          return;
        }

        if (this.formData.password.length < 6) {
          this.authError = 'Password must be at least 6 characters.';
          return;
        }

        // Sign up
        const { data, error } = await this.supabase.auth.signUp({
          email: this.formData.email,
          password: this.formData.password
        });

        if (error) {
          this.authError = error.message;
        } else {
          this.authSuccess = '🎉 Account created successfully! Please check your email to confirm your account.';
          this.closeAuthModal();
        }
      } else {
        // Validation
        if (!this.formData.email || !this.formData.password) {
          this.authError = 'Please enter your email and password.';
          return;
        }

        // Sign in
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email: this.formData.email,
          password: this.formData.password
        });

        if (error) {
          this.authError = error.message;
        } else {
          this.authSuccess = '🎉 Signed in successfully! Welcome back!';
          this.closeAuthModal();
        }
      }
    } catch (error) {
      console.error('🔐 Avatar System V2: Auth error:', error);
      this.authError = error.message || 'An unexpected error occurred.';
    } finally {
      this.authLoading = false;
      this.renderAuthModal();
    }
  }

  async handleSignOut() {
    try {
      await this.supabase.auth.signOut();
      this.isDropdownOpen = false;
      this.renderDropdown();
    } catch (error) {
      console.error('🔐 Avatar System V2: Sign out error:', error);
    }
  }

  closeAuthModal() {
    this.showAuthModal = false;
    const modal = document.querySelector('.auth-modal');
    if (modal) {
      modal.style.opacity = '0';
      setTimeout(() => {
        modal.remove();
      }, 300);
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

    const avatarContainer = document.querySelector('.avatar-container');
    if (!avatarContainer) return;

    const dropdown = document.createElement('div');
    dropdown.className = 'carnival-dropdown';
    dropdown.style.cssText = `
      position: absolute;
      top: 60px;
      right: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      min-width: 320px;
      max-height: 400px;
      overflow-y: auto;
      z-index: 10000;
    `;

    dropdown.innerHTML = `
      <div style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: white; padding: 16px;">
        <div style="font-weight: bold; font-size: 16px;">UK Carnivals</div>
        <div style="font-size: 12px; opacity: 0.9; margin-top: 4px;">Track your favorite events</div>
      </div>
      
      <div style="padding: 8px 0;">
        ${this.ukCarnivals.map(carnival => `
          <div class="carnival-item" data-carnival-name="${carnival.name}" style="padding: 12px 16px; cursor: pointer; transition: background 0.2s; border-bottom: 1px solid #f3f4f6;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
              <div style="font-weight: 500; color: #374151;">${carnival.name}</div>
              <div style="font-size: 12px; padding: 2px 8px; border-radius: 12px; background: ${carnival.status === 'active' ? '#dcfce7' :
        carnival.status === 'upcoming' ? '#fef3c7' : '#fee2e2'
      }; color: ${carnival.status === 'active' ? '#166534' :
        carnival.status === 'upcoming' ? '#92400e' : '#dc2626'
      };">
                ${carnival.status.charAt(0).toUpperCase() + carnival.status.slice(1)}
              </div>
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">${carnival.location} • ${carnival.date}</div>
            <div style="font-size: 11px; color: #9ca3af;">${carnival.expectedAttendance}</div>
          </div>
        `).join('')}
      </div>
    `;

    // Add click handlers for carnival items
    const carnivalItems = dropdown.querySelectorAll('.carnival-item');
    carnivalItems.forEach(item => {
      item.addEventListener('click', () => {
        const carnivalName = item.dataset.carnivalName;
        if (carnivalName === 'Notting Hill Carnival') {
          this.toggleCarnivalRoute();
        }
        this.isCarnivalDropdownOpen = false;
        this.renderCarnivalDropdown();
      });

      item.addEventListener('mouseenter', () => {
        item.style.background = '#f8fafc';
      });
      item.addEventListener('mouseleave', () => {
        item.style.background = 'transparent';
      });
    });

    avatarContainer.appendChild(dropdown);

    // Close carnival dropdown when clicking outside
    setTimeout(() => {
      document.addEventListener('click', this.handleCarnivalClickOutside.bind(this));
    }, 100);
  }

  handleCarnivalClickOutside(event) {
    const carnivalDropdown = document.querySelector('.carnival-dropdown');
    const avatarContainer = document.querySelector('.avatar-container');
    if (carnivalDropdown && !carnivalDropdown.contains(event.target) && !avatarContainer.contains(event.target)) {
      this.isCarnivalDropdownOpen = false;
      this.renderCarnivalDropdown();
      document.removeEventListener('click', this.handleCarnivalClickOutside);
    }
  }

  toggleCarnivalRoute() {
    if (typeof window.showCarnivalRoute === 'function') {
      if (window.carnivalRouteActive) {
        // Hide route
        if (window.carnivalRoute && window.map) {
          window.map.removeLayer(window.carnivalRoute);
          window.carnivalRoute = null;
        }
        window.carnivalRouteActive = false;

        const starButton = document.getElementById('festivalBtn');
        if (starButton) {
          starButton.classList.remove('active');
        }
      } else {
        // Show route
        window.showCarnivalRoute();
        window.carnivalRouteActive = true;

        const starButton = document.getElementById('festivalBtn');
        if (starButton) {
          starButton.classList.add('active');
        }
      }
    }
  }
}

// Initialize Avatar System V2 when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.avatarSystemV2 = new AvatarSystemV2();
  });
} else {
  window.avatarSystemV2 = new AvatarSystemV2();
}
