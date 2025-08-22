// Mobile Authentication Module
// Dedicated mobile authentication functionality for TagYou2

class MobileAuth {
  constructor() {
    this.isInitialized = false;
    this.currentModal = null;
    this.init();
  }

  init() {
    console.log('📱 Mobile Auth Module initializing...');
    this.setupMobileProfileButton();
    this.setupMobileProfileDropdown();
    this.isInitialized = true;
    console.log('✅ Mobile Auth Module initialized');
  }

  // Setup mobile profile button
  setupMobileProfileButton() {
    // Create mobile profile button if it doesn't exist
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
    // Create mobile profile dropdown if it doesn't exist
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
        </div>
        <div class="mobile-profile-menu" id="mobileProfileMenu">
          <!-- Menu items will be populated dynamically -->
        </div>
      `;
      document.body.appendChild(mobileDropdown);
      this.populateMobileProfileMenu();
    }
  }

  // Toggle mobile profile dropdown
  toggleMobileProfileDropdown() {
    const dropdown = document.getElementById('mobileProfileDropdown');
    if (dropdown) {
      dropdown.classList.toggle('show');
      console.log('📱 Mobile dropdown toggled');
    }
  }

  // Populate mobile profile menu
  populateMobileProfileMenu() {
    const mobileProfileMenu = document.getElementById('mobileProfileMenu');
    if (!mobileProfileMenu) return;

    console.log('📱 Populating mobile profile menu...');

    // Clear existing menu items
    mobileProfileMenu.innerHTML = '';

    // Guest user menu items for mobile
    const menuItems = [
      {
        icon: 'fas fa-sign-in-alt',
        text: 'Sign In',
        action: () => this.showSignInModal(),
        className: 'mobile-auth-action'
      },
      {
        icon: 'fas fa-user-plus',
        text: 'Create Account',
        action: () => this.showSignUpModal(),
        className: 'mobile-auth-action'
      },
      {
        icon: 'fas fa-question-circle',
        text: 'Help',
        action: () => this.showHelp(),
        className: ''
      }
    ];

    menuItems.forEach(item => {
      const button = document.createElement('button');
      button.className = `mobile-profile-menu-item ${item.className}`;
      button.innerHTML = `
        <i class="${item.icon}"></i>
        <span>${item.text}</span>
      `;
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`📱 Mobile menu item clicked: ${item.text}`);

        // Close dropdown first
        const dropdown = document.getElementById('mobileProfileDropdown');
        if (dropdown) dropdown.classList.remove('show');

        // Then execute action
        item.action();
      });

      // Add touch event for better mobile response
      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        button.style.backgroundColor = '#e0e0e0';
      }, { passive: false });

      button.addEventListener('touchend', (e) => {
        button.style.backgroundColor = '';
      });

      mobileProfileMenu.appendChild(button);
    });

    console.log(`✅ Added ${menuItems.length} mobile menu items`);
  }

  // Show sign in modal
  showSignInModal() {
    console.log('📱 Mobile Sign In clicked');
    this.showAuthModal('signin');
  }

  // Show sign up modal
  showSignUpModal() {
    console.log('📱 Mobile Create Account clicked');
    this.showAuthModal('signup');
  }

  // Show help
  showHelp() {
    console.log('📱 Mobile Help clicked');
    alert('📱 Help: Welcome to TagYou2! This is a festival map application. Use the search bar to find locations and explore festival information.');
  }

  // Show authentication modal
  showAuthModal(mode) {
    const title = mode === 'signin' ? 'Sign In' : 'Create Account';
    const submitText = mode === 'signin' ? 'Sign In' : 'Create Account';

    // Enhanced mobile-optimized modal with proper form fields
    const modalHTML = `
      <div class="mobile-auth-modal" id="mobileAuthModal">
        <div class="mobile-auth-overlay"></div>
        <div class="mobile-auth-content">
          <div class="mobile-auth-header">
            <h2>📱 ${title}</h2>
            <button class="mobile-auth-close" onclick="mobileAuth.closeModal()">&times;</button>
          </div>
          <form class="mobile-auth-form" id="mobileAuthForm">
            ${mode === 'signup' ? `
              <div class="mobile-form-group">
                <label for="mobileDisplayName">Full Name</label>
                <input type="text" id="mobileDisplayName" name="displayName" required placeholder="Enter your full name" style="width: 100%; padding: 15px; margin: 5px 0; border: 1px solid #ddd; border-radius: 8px; font-size: 16px;">
              </div>
            ` : ''}
            
            <div class="mobile-form-group">
              <label for="mobileEmail">Email Address</label>
              <input type="email" id="mobileEmail" name="email" required placeholder="Enter your email" style="width: 100%; padding: 15px; margin: 5px 0; border: 1px solid #ddd; border-radius: 8px; font-size: 16px;">
            </div>
            
            <div class="mobile-form-group">
              <label for="mobilePassword">Password</label>
              <input type="password" id="mobilePassword" name="password" required placeholder="Enter your password" style="width: 100%; padding: 15px; margin: 5px 0; border: 1px solid #ddd; border-radius: 8px; font-size: 16px;">
              ${mode === 'signup' ? '<small style="color: #666; font-size: 12px;">Minimum 6 characters</small>' : ''}
            </div>
            
            ${mode === 'signup' ? `
              <div class="mobile-form-group">
                <label for="mobileConfirmPassword">Confirm Password</label>
                <input type="password" id="mobileConfirmPassword" name="confirmPassword" required placeholder="Confirm your password" style="width: 100%; padding: 15px; margin: 5px 0; border: 1px solid #ddd; border-radius: 8px; font-size: 16px;">
              </div>
            ` : ''}
            
            <button type="submit" style="width: 100%; padding: 15px; margin: 15px 0; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">${submitText}</button>
          </form>
          
          <div class="mobile-auth-footer" style="text-align: center; margin-top: 15px;">
            ${mode === 'signup' ? `
              <p style="font-size: 14px; color: #666;">Already have an account? <a href="#" onclick="mobileAuth.switchMode('signin')" style="color: #667eea; text-decoration: none;">Sign in</a></p>
            ` : `
              <p style="font-size: 14px; color: #666;"><a href="#" onclick="mobileAuth.showForgotPassword()" style="color: #667eea; text-decoration: none;">Forgot your password?</a></p>
              <p style="font-size: 14px; color: #666;">Don't have an account? <a href="#" onclick="mobileAuth.switchMode('signup')" style="color: #667eea; text-decoration: none;">Sign up</a></p>
            `}
          </div>
          
          <div id="mobileAuthError" style="display: none; background: #ffebee; color: #c62828; padding: 10px; border-radius: 5px; margin: 10px 0; font-size: 14px;"></div>
          <div id="mobileAuthSuccess" style="display: none; background: #e8f5e8; color: #2e7d32; padding: 10px; border-radius: 5px; margin: 10px 0; font-size: 14px;"></div>
        </div>
      </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.currentModal = document.getElementById('mobileAuthModal');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Handle form submission with actual auth functionality
    document.getElementById('mobileAuthForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleAuthSubmission(mode, e.target);
    });

    // Add outside click handler
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  // Handle authentication form submission
  async handleAuthSubmission(mode, form) {
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    const displayName = formData.get('displayName');
    const confirmPassword = formData.get('confirmPassword');

    // Validation
    if (mode === 'signup') {
      if (!displayName || displayName.trim().length < 2) {
        this.showError('Please enter your full name (minimum 2 characters)');
        return;
      }

      if (password.length < 6) {
        this.showError('Password must be at least 6 characters long');
        return;
      }

      if (password !== confirmPassword) {
        this.showError('Passwords do not match');
        return;
      }
    }

    try {
      this.showLoading(true);

      if (window.authService) {
        // Use the auth service if available
        let result;
        if (mode === 'signup') {
          result = await window.authService.signUp(email, password, displayName);
        } else {
          result = await window.authService.signIn(email, password);
        }

        if (result.success) {
          this.showSuccess(mode === 'signup' ? 'Account created successfully!' : 'Signed in successfully!');
          setTimeout(() => {
            this.closeModal();
            // Refresh the page to update UI
            window.location.reload();
          }, 1500);
        } else {
          this.showError(result.error || 'Authentication failed');
        }
      } else {
        // Fallback if auth service is not available
        this.showError('Authentication service not available. Please try again later.');
      }
    } catch (error) {
      this.showError(error.message || 'An error occurred. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  // Show error message
  showError(message) {
    const errorDiv = document.getElementById('mobileAuthError');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    }
  }

  // Show success message
  showSuccess(message) {
    const successDiv = document.getElementById('mobileAuthSuccess');
    if (successDiv) {
      successDiv.textContent = message;
      successDiv.style.display = 'block';
    }
  }

  // Show/hide loading state
  showLoading(show) {
    const submitBtn = document.querySelector('#mobileAuthForm button[type="submit"]');
    if (submitBtn) {
      if (show) {
        submitBtn.textContent = 'Loading...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
      } else {
        submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Submit';
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
      }
    }
  }

  // Switch between sign in and sign up modes
  switchMode(mode) {
    this.closeModal();
    setTimeout(() => {
      this.showAuthModal(mode);
    }, 300);
  }

  // Show forgot password
  showForgotPassword() {
    const email = prompt('Enter your email address to reset your password:');
    if (email && window.authService) {
      window.authService.resetPassword(email).then(result => {
        if (result.success) {
          alert('Password reset email sent! Check your inbox.');
        } else {
          alert('Error: ' + result.error);
        }
      });
    }
  }

  // Handle outside click to close modal
  handleOutsideClick(e) {
    if (this.currentModal && !this.currentModal.contains(e.target)) {
      this.closeModal();
    }
  }

  // Close modal
  closeModal() {
    if (this.currentModal) {
      this.currentModal.remove();
      this.currentModal = null;
      document.body.style.overflow = '';
      console.log('📱 Mobile auth modal closed');
    }
  }

  // Public method to test mobile auth
  testMobileSignUp() {
    console.log('🧪 Testing mobile sign up...');
    this.showSignUpModal();
  }
}

// Initialize mobile auth when DOM is loaded
let mobileAuth;
document.addEventListener('DOMContentLoaded', () => {
  mobileAuth = new MobileAuth();
  window.mobileAuth = mobileAuth; // Make it globally accessible
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileAuth;
}
