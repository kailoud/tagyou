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

    // UK Carnival data
    this.ukCarnivals = [
      {
        id: 1,
        name: "Notting Hill Carnival",
        location: "London",
        date: "Aug 24-26, 2025",
        status: "upcoming",
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
        status: "upcoming",
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
        status: "active",
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

  init() {
    this.checkUser();
    this.createAvatarElement();
    this.setupEventListeners();
  }

  checkUser() {
    const storedUser = sessionStorage.getItem('supabase_user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }
    this.loading = false;
  }

  createAvatarElement() {
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
          <button class="signin-button" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: #8b5cf6; color: white; padding: 12px 16px; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; transition: background 0.2s;">
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

  toggleCarnivalDropdown() {
    this.isCarnivalDropdownOpen = !this.isCarnivalDropdownOpen;
    this.renderCarnivalDropdown();
  }

  renderCarnivalDropdown() {
    // Implementation for carnival dropdown
    console.log('Carnival dropdown toggled');
  }

  renderAuthModal() {
    if (!this.showAuthModal) return;

    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100000;
      padding: 16px;
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
    this.authLoading = true;
    this.authError = '';
    this.authSuccess = '';

    try {
      if (this.authMode === 'signup') {
        if (this.formData.password !== this.formData.confirmPassword) {
          this.authError = 'Passwords do not match';
          return;
        }

        // Simulate signup
        await new Promise(resolve => setTimeout(resolve, 1000));
        const user = {
          id: Math.random().toString(36).substr(2, 9),
          email: this.formData.email,
          user_metadata: {
            full_name: this.formData.email.split('@')[0].charAt(0).toUpperCase() + this.formData.email.split('@')[0].slice(1)
          }
        };

        this.authSuccess = 'Account created successfully!';
        sessionStorage.setItem('supabase_user', JSON.stringify(user));
        this.user = user;
        this.closeAuthModal();
        this.renderDropdown();

      } else {
        // Simulate signin
        if (!this.formData.email || !this.formData.password || !this.formData.email.includes('@') || this.formData.password.length < 6) {
          this.authError = 'Please enter a valid email and password (min 6 characters)';
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        const user = {
          id: Math.random().toString(36).substr(2, 9),
          email: this.formData.email,
          user_metadata: {
            full_name: this.formData.email.split('@')[0].charAt(0).toUpperCase() + this.formData.email.split('@')[0].slice(1)
          }
        };

        this.authSuccess = 'Signed in successfully!';
        sessionStorage.setItem('supabase_user', JSON.stringify(user));
        this.user = user;
        this.closeAuthModal();
        this.renderDropdown();
      }
    } catch (error) {
      this.authError = error.message;
    } finally {
      this.authLoading = false;
      this.renderAuthModal();
    }
  }

  async handleSignOut() {
    this.authLoading = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
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
      modal.remove();
    }
  }
}

// Initialize avatar system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.avatarSystem = new AvatarSystem();
});

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
`;
document.head.appendChild(style);
