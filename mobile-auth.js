// Mobile Authentication Module
// Dedicated mobile authentication functionality for TagYou2

class MobileAuth {
  constructor() {
    console.log('🔨 MobileAuth constructor called');
    this.isInitialized = false;
    this.init();
  }

  init() {
    console.log('📱 Mobile Auth Module initializing...');
    try {
      this.setupMobileProfileButton();
      this.setupMobileProfileDropdown();
      this.isInitialized = true;
      console.log('✅ Mobile Auth Module initialized');
    } catch (error) {
      console.error('❌ Error in MobileAuth init():', error);
    }
  }

  // Setup mobile profile button
  setupMobileProfileButton() {
    if (!document.getElementById('mobileProfileButton')) {
      const mobileButton = document.createElement('button');
      mobileButton.id = 'mobileProfileButton';
      mobileButton.className = 'mobile-profile-button';
      mobileButton.innerHTML = '<i class="fas fa-user"></i>';
      mobileButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMobileProfileDropdown();
      });
      document.body.appendChild(mobileButton);
    }
  }

  // Setup mobile profile dropdown
  setupMobileProfileDropdown() {
    if (!document.getElementById('mobileProfileDropdown')) {
      const mobileDropdown = document.createElement('div');
      mobileDropdown.id = 'mobileProfileDropdown';
      mobileDropdown.className = 'mobile-profile-dropdown';
      mobileDropdown.innerHTML = `
        <div class="mobile-profile-header">
          <div class="mobile-profile-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="mobile-profile-info">
            <h4>Festival Goer</h4>
            <p>Welcome to TagYou2!</p>
          </div>
          <button class="mobile-dropdown-close" type="button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="mobile-profile-menu" id="mobileProfileMenu">
          <button class="mobile-profile-menu-item mobile-auth-action" onclick="window.mobileAuth.showSignInModal()">
            <i class="fas fa-sign-in-alt"></i>
            <span>Sign In</span>
          </button>
          <button class="mobile-profile-menu-item mobile-auth-action" onclick="window.mobileAuth.showSignUpModal()">
            <i class="fas fa-user-plus"></i>
            <span>Create Account</span>
          </button>
          <button class="mobile-profile-menu-item" onclick="alert('Help: Welcome to TagYou2!')">
            <i class="fas fa-question-circle"></i>
            <span>Help</span>
          </button>
        </div>
      `;
      document.body.appendChild(mobileDropdown);

      // Add close button handler
      const closeButton = mobileDropdown.querySelector('.mobile-dropdown-close');
      if (closeButton) {
        closeButton.addEventListener('click', () => this.closeDropdown());
      }

      // Add outside click handler
      document.addEventListener('click', (e) => {
        if (!mobileDropdown.contains(e.target) && !document.getElementById('mobileProfileButton').contains(e.target)) {
          this.closeDropdown();
        }
      });
    }
  }

  // Toggle mobile profile dropdown
  toggleMobileProfileDropdown() {
    const dropdown = document.getElementById('mobileProfileDropdown');
    if (dropdown) {
      const isVisible = dropdown.classList.contains('show');
      if (isVisible) {
        this.closeDropdown();
      } else {
        this.openDropdown();
      }
    }
  }

  // Open mobile profile dropdown
  openDropdown() {
    const dropdown = document.getElementById('mobileProfileDropdown');
    if (dropdown) {
      dropdown.classList.add('show');
      console.log('📱 Mobile dropdown opened');
    }
  }

  // Close mobile profile dropdown
  closeDropdown() {
    const dropdown = document.getElementById('mobileProfileDropdown');
    if (dropdown) {
      dropdown.classList.remove('show');
      console.log('📱 Mobile dropdown closed');
    }
  }

  // Show sign in modal - SIMPLE VERSION
  showSignInModal() {
    console.log('📱 Mobile Sign In clicked - SIMPLE VERSION');

    // Close dropdown first
    this.closeDropdown();

    // Create simple modal
    const modal = `
      <div id="mobileSignInModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 400px; width: 90%; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #333;">📱 Sign In</h2>
            <button onclick="document.getElementById('mobileSignInModal').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
          </div>
          
          <form id="mobileSignInForm">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">Email Address</label>
              <input type="email" id="mobileEmail" required placeholder="Enter your email" style="width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
            </div>
            
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">Password</label>
              <input type="password" id="mobilePassword" required placeholder="Enter your password" style="width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
            </div>
            
            <button type="submit" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">Sign In</button>
          </form>
          
          <div style="text-align: center; margin-top: 15px;">
            <p style="font-size: 14px; color: #666;">Don't have an account? <a href="#" onclick="window.mobileAuth.showSignUpModal(); return false;" style="color: #667eea; text-decoration: none;">Sign up</a></p>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('mobileSignInModal');
    if (existingModal) existingModal.remove();

    // Add new modal
    document.body.insertAdjacentHTML('beforeend', modal);

    // Add form handler
    const form = document.getElementById('mobileSignInForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('mobileEmail').value;
        const password = document.getElementById('mobilePassword').value;

        console.log('📱 Sign in attempt:', { email });
        alert('📱 Sign In functionality coming soon!');
        document.getElementById('mobileSignInModal').remove();
      });
    }
  }

  // Show sign up modal - SIMPLE VERSION
  showSignUpModal() {
    console.log('📱 Mobile Create Account clicked - SIMPLE VERSION');

    // Close dropdown first
    this.closeDropdown();

    // Create simple modal
    const modal = `
      <div id="mobileSignUpModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 400px; width: 90%; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #333;">📱 Create Account</h2>
            <button onclick="document.getElementById('mobileSignUpModal').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
          </div>
          
          <form id="mobileSignUpForm">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">Full Name</label>
              <input type="text" id="mobileDisplayName" required placeholder="Enter your full name" style="width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">Email Address</label>
              <input type="email" id="mobileSignUpEmail" required placeholder="Enter your email" style="width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">Password</label>
              <input type="password" id="mobileSignUpPassword" required placeholder="Enter your password (min 6 chars)" style="width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
            </div>
            
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">Confirm Password</label>
              <input type="password" id="mobileConfirmPassword" required placeholder="Confirm your password" style="width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
            </div>
            
            <button type="submit" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">Create Account</button>
          </form>
          
          <div style="text-align: center; margin-top: 15px;">
            <p style="font-size: 14px; color: #666;">Already have an account? <a href="#" onclick="window.mobileAuth.showSignInModal(); return false;" style="color: #667eea; text-decoration: none;">Sign in</a></p>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('mobileSignUpModal');
    if (existingModal) existingModal.remove();

    // Add new modal
    document.body.insertAdjacentHTML('beforeend', modal);

    // Add form handler
    const form = document.getElementById('mobileSignUpForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const displayName = document.getElementById('mobileDisplayName').value;
        const email = document.getElementById('mobileSignUpEmail').value;
        const password = document.getElementById('mobileSignUpPassword').value;
        const confirmPassword = document.getElementById('mobileConfirmPassword').value;

        console.log('📱 Sign up attempt:', { displayName, email });
        alert('📱 Create Account functionality coming soon!');
        document.getElementById('mobileSignUpModal').remove();
      });
    }
  }
}

// Initialize mobile auth globally when script loads
console.log('📱 Mobile auth script loaded, initializing...');
try {
  window.mobileAuth = new MobileAuth();
  console.log('✅ Mobile auth initialized globally:', window.mobileAuth);
} catch (error) {
  console.error('❌ Error initializing mobile auth:', error);
}


