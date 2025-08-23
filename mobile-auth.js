// Mobile Authentication Module
// Dedicated mobile authentication functionality for TagYou2

class MobileAuth {
  constructor() {
    console.log('🔨 MobileAuth constructor called');
    this.isInitialized = false;
    this.currentModal = null;
    this.modalJustOpened = false;
    this.init();
  }

  init() {
    console.log('📱 Mobile Auth Module initializing...');
    try {
      console.log('📱 Setting up mobile profile button...');
      this.setupMobileProfileButton();
      console.log('📱 Setting up mobile profile dropdown...');
      this.setupMobileProfileDropdown();
      this.isInitialized = true;
      console.log('✅ Mobile Auth Module initialized');
    } catch (error) {
      console.error('❌ Error in MobileAuth init():', error);
      throw error;
    }

    // Debug: Check if elements were created
    setTimeout(() => {
      const mobileButton = document.getElementById('mobileProfileButton');
      const mobileDropdown = document.getElementById('mobileProfileDropdown');
      console.log('🔍 Debug - Mobile button exists:', !!mobileButton);
      console.log('🔍 Debug - Mobile dropdown exists:', !!mobileDropdown);
      if (mobileButton) {
        console.log('🔍 Debug - Mobile button display:', window.getComputedStyle(mobileButton).display);
      }
      if (mobileDropdown) {
        console.log('🔍 Debug - Mobile dropdown display:', window.getComputedStyle(mobileDropdown).display);
        console.log('🔍 Debug - Mobile dropdown has show class:', mobileDropdown.classList.contains('show'));
        // Ensure dropdown is closed on initialization
        if (mobileDropdown.classList.contains('show')) {
          console.log('🔍 Debug - Removing show class from dropdown on init');
          mobileDropdown.classList.remove('show');
        }
      }
    }, 1000);
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

      // Ensure dropdown starts closed
      mobileDropdown.classList.remove('show');
      console.log('📱 Mobile dropdown created - ensuring it starts closed');
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
          <!-- Menu items will be populated dynamically -->
        </div>
      `;
      document.body.appendChild(mobileDropdown);
      this.populateMobileProfileMenu();

      // Add outside click handler to close dropdown
      this.setupDropdownOutsideClick();

      // Add direct click handler to close button
      setTimeout(() => {
        const closeButton = mobileDropdown.querySelector('.mobile-dropdown-close');
        if (closeButton) {
          // Remove the onclick attribute and add proper event listener
          closeButton.removeAttribute('onclick');
          closeButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('📱 Close button clicked');
            this.closeDropdown();
          });
          console.log('📱 Close button handler added');
        }
      }, 100);

      // REMOVED DUPLICATE EVENT LISTENERS - They're handled in setupDropdownOutsideClick()
    }
  }

  // Setup outside click handler for dropdown
  setupDropdownOutsideClick() {
    // Use a simpler, more direct approach
    const handleClick = (e) => {
      const mobileButton = document.getElementById('mobileProfileButton');
      const mobileDropdown = document.getElementById('mobileProfileDropdown');

      // If dropdown is not open, do nothing
      if (!mobileDropdown || !mobileDropdown.classList.contains('show')) {
        return;
      }

      // If click is on the button itself, do nothing (let toggle handle it)
      if (mobileButton && mobileButton.contains(e.target)) {
        return;
      }

      // If click is inside dropdown, do nothing
      if (mobileDropdown.contains(e.target)) {
        return;
      }

      // Otherwise, close the dropdown
      console.log('📱 Outside click detected, closing dropdown');
      this.closeDropdown();
    };

    // Remove old handlers
    if (this.outsideClickHandler) {
      document.removeEventListener('click', this.outsideClickHandler);
      document.removeEventListener('touchend', this.outsideClickHandler);
    }

    // Add new handlers with capture phase
    document.addEventListener('click', handleClick, true);
    document.addEventListener('touchend', handleClick, true);

    this.outsideClickHandler = handleClick;
    console.log('📱 Outside click handler setup complete');
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
        // Check initialization when dropdown opens
        this.checkInitialization();
      }
    }
  }

  // Check if mobile auth is properly initialized
  checkInitialization() {
    console.log('📱 Checking mobile auth initialization...');
    console.log('📱 Mobile auth instance:', !!this);
    console.log('📱 Auth service available:', !!window.authService);
    console.log('📱 showSignInModal method:', typeof this.showSignInModal);
    console.log('📱 showSignUpModal method:', typeof this.showSignUpModal);
    console.log('📱 showAuthModal method:', typeof this.showAuthModal);

    if (!window.authService) {
      console.warn('⚠️ Auth service not available');
    }

    if (typeof this.showSignInModal !== 'function') {
      console.error('❌ showSignInModal method not found');
    }

    if (typeof this.showSignUpModal !== 'function') {
      console.error('❌ showSignUpModal method not found');
    }

    if (typeof this.showAuthModal !== 'function') {
      console.error('❌ showAuthModal method not found');
    }
  }

  // Open mobile profile dropdown
  openDropdown() {
    const dropdown = document.getElementById('mobileProfileDropdown');
    if (dropdown) {
      dropdown.classList.add('show');
      console.log('📱 Mobile dropdown opened');
      console.log('📱 Stack trace:', new Error().stack);
    }
  }

  // Close mobile profile dropdown - FIXED VERSION
  closeDropdown() {
    console.log('🔨 CLOSING DROPDOWN NOW');

    // Method 1: Get dropdown and remove show class
    const dropdown = document.getElementById('mobileProfileDropdown');
    if (dropdown) {
      dropdown.classList.remove('show');
      console.log('✅ Show class removed');
    }

    // Method 2: Remove any show classes from anywhere
    const allShowElements = document.querySelectorAll('.show');
    allShowElements.forEach(element => {
      if (element.classList.contains('mobile-profile-dropdown')) {
        element.classList.remove('show');
        console.log('✅ Found and removed show class');
      }
    });

    console.log('🔨 DROPDOWN SHOULD BE CLOSED NOW');
  }

  // Populate mobile profile menu - EXACT SAME AS DESKTOP
  populateMobileProfileMenu() {
    const mobileProfileMenu = document.getElementById('mobileProfileMenu');
    if (!mobileProfileMenu) return;

    console.log('📱 Populating mobile profile menu...');
    console.log('📱 Auth service available:', !!window.authService);

    // Clear existing menu items
    mobileProfileMenu.innerHTML = '';

    // Create menu items EXACTLY like desktop dropdown
    const menuItems = [
      {
        icon: 'fas fa-sign-in-alt',
        text: 'Sign In',
        action: () => {
          console.log('📱 Mobile Sign In clicked - calling auth service');
          console.log('📱 Auth service:', window.authService);
          console.log('📱 showSignInModal method:', typeof window.authService?.showSignInModal);

          if (window.authService && typeof window.authService.showSignInModal === 'function') {
            console.log('📱 Calling showSignInModal...');
            window.authService.showSignInModal();
            console.log('✅ showSignInModal called successfully');
          } else {
            console.error('❌ Auth service or showSignInModal not available');
            alert('📱 Sign In: Authentication service not available. Please refresh the page.');
          }
        },
        className: 'auth-action'
      },
      {
        icon: 'fas fa-user-plus',
        text: 'Create Account',
        action: () => {
          console.log('📱 Mobile Create Account clicked - calling auth service');
          console.log('📱 Auth service:', window.authService);
          console.log('📱 showSignUpModal method:', typeof window.authService?.showSignUpModal);

          if (window.authService && typeof window.authService.showSignUpModal === 'function') {
            console.log('📱 Calling showSignUpModal...');
            window.authService.showSignUpModal();
            console.log('✅ showSignUpModal called successfully');
          } else {
            console.error('❌ Auth service or showSignUpModal not available');
            alert('📱 Create Account: Authentication service not available. Please refresh the page.');
          }
        },
        className: 'auth-action'
      },
      {
        icon: 'fas fa-question-circle',
        text: 'Help & Support',
        action: () => {
          console.log('📱 Mobile Help clicked');
          if (window.authService && typeof window.authService.showHelp === 'function') {
            window.authService.showHelp();
          } else {
            alert('📱 Help: Welcome to TagYou2! This is a festival map application.');
          }
        }
      }
    ];

    // Create menu items EXACTLY like desktop dropdown
    menuItems.forEach(item => {
      const button = document.createElement('button');
      button.className = `profile-menu-item ${item.className || ''}`;
      button.innerHTML = `
        <i class="${item.icon}"></i>
        <span>${item.text}</span>
      `;

      console.log(`📱 Creating mobile menu item: ${item.text}`);

      // Use EXACTLY the same event listener approach as desktop
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log(`📱 Mobile menu item clicked: ${item.text}`);

        // Close mobile dropdown first
        const dropdown = document.getElementById('mobileProfileDropdown');
        if (dropdown) {
          dropdown.classList.remove('show');
          console.log('📱 Mobile dropdown closed');
        }

        // Execute the action
        console.log(`📱 Executing action for: ${item.text}`);
        item.action();
      });

      mobileProfileMenu.appendChild(button);
    });

    console.log('✅ Mobile menu populated with exact same approach as desktop');
  }



  // Show sign in modal - SIMPLIFIED VERSION
  showSignInModal() {
    console.log('📱 Mobile Sign In clicked - SIMPLIFIED');

    // Create a simple modal directly
    const modalHTML = `
      <div id="simpleSignInModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 400px; width: 90%; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #333;">📱 Sign In</h2>
            <button onclick="document.getElementById('simpleSignInModal').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
          </div>
          
          <form id="simpleSignInForm">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">Email Address</label>
              <input type="email" id="simpleEmail" required placeholder="Enter your email" style="width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
            </div>
            
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">Password</label>
              <input type="password" id="simplePassword" required placeholder="Enter your password" style="width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
            </div>
            
            <button type="submit" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">Sign In</button>
          </form>
          
          <div style="text-align: center; margin-top: 15px;">
            <p style="font-size: 14px; color: #666;">Don't have an account? <a href="#" onclick="window.mobileAuth.showSignUpModal(); return false;" style="color: #667eea; text-decoration: none;">Sign up</a></p>
          </div>
          
          <div id="simpleSignInError" style="display: none; background: #ffebee; color: #c62828; padding: 10px; border-radius: 5px; margin-top: 10px; font-size: 14px;"></div>
        </div>
      </div>
    `;

    // Remove any existing modal
    const existingModal = document.getElementById('simpleSignInModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add the new modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add form submit handler
    const form = document.getElementById('simpleSignInForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('simpleEmail').value;
        const password = document.getElementById('simplePassword').value;

        console.log('📱 Simple sign in attempt:', { email });

        if (window.authService && typeof window.authService.signIn === 'function') {
          window.authService.signIn(email, password).then(result => {
            if (result.success) {
              alert('✅ Signed in successfully!');
              document.getElementById('simpleSignInModal').remove();
              window.location.reload();
            } else {
              const errorDiv = document.getElementById('simpleSignInError');
              errorDiv.textContent = result.error || 'Sign in failed';
              errorDiv.style.display = 'block';
            }
          });
        } else {
          alert('📱 Authentication service not available. Please try again later.');
        }
      });
    }

    console.log('✅ Simple sign in modal created');
  }

  // Show sign up modal - SIMPLIFIED VERSION
  showSignUpModal() {
    console.log('📱 Mobile Create Account clicked - SIMPLIFIED');

    // Create a simple modal directly
    const modalHTML = `
      <div id="simpleSignUpModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; padding: 30px; border-radius: 15px; max-width: 400px; width: 90%; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #333;">📱 Create Account</h2>
            <button onclick="document.getElementById('simpleSignUpModal').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
          </div>
          
          <form id="simpleSignUpForm">
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">Full Name</label>
              <input type="text" id="simpleDisplayName" required placeholder="Enter your full name" style="width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">Email Address</label>
              <input type="email" id="simpleSignUpEmail" required placeholder="Enter your email" style="width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">Password</label>
              <input type="password" id="simpleSignUpPassword" required placeholder="Enter your password (min 6 chars)" style="width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
            </div>
            
            <div style="margin-bottom: 20px;">
              <label style="display: block; margin-bottom: 5px; color: #333; font-weight: 500;">Confirm Password</label>
              <input type="password" id="simpleConfirmPassword" required placeholder="Confirm your password" style="width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
            </div>
            
            <button type="submit" style="width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer;">Create Account</button>
          </form>
          
          <div style="text-align: center; margin-top: 15px;">
            <p style="font-size: 14px; color: #666;">Already have an account? <a href="#" onclick="window.mobileAuth.showSignInModal(); return false;" style="color: #667eea; text-decoration: none;">Sign in</a></p>
          </div>
          
          <div id="simpleSignUpError" style="display: none; background: #ffebee; color: #c62828; padding: 10px; border-radius: 5px; margin-top: 10px; font-size: 14px;"></div>
        </div>
      </div>
    `;

    // Remove any existing modal
    const existingModal = document.getElementById('simpleSignUpModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add the new modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add form submit handler
    const form = document.getElementById('simpleSignUpForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const displayName = document.getElementById('simpleDisplayName').value;
        const email = document.getElementById('simpleSignUpEmail').value;
        const password = document.getElementById('simpleSignUpPassword').value;
        const confirmPassword = document.getElementById('simpleConfirmPassword').value;

        console.log('📱 Simple sign up attempt:', { displayName, email });

        // Validation
        if (password.length < 6) {
          const errorDiv = document.getElementById('simpleSignUpError');
          errorDiv.textContent = 'Password must be at least 6 characters long';
          errorDiv.style.display = 'block';
          return;
        }

        if (password !== confirmPassword) {
          const errorDiv = document.getElementById('simpleSignUpError');
          errorDiv.textContent = 'Passwords do not match';
          errorDiv.style.display = 'block';
          return;
        }

        if (window.authService && typeof window.authService.signUp === 'function') {
          window.authService.signUp(email, password, displayName).then(result => {
            if (result.success) {
              alert('✅ Account created successfully!');
              document.getElementById('simpleSignUpModal').remove();
              window.location.reload();
            } else {
              const errorDiv = document.getElementById('simpleSignUpError');
              errorDiv.textContent = result.error || 'Account creation failed';
              errorDiv.style.display = 'block';
            }
          });
        } else {
          alert('📱 Authentication service not available. Please try again later.');
        }
      });
    }

    console.log('✅ Simple sign up modal created');
  }

  // Fallback method for showing auth modal
  showAuthModalFallback(mode) {
    console.log('📱 Using fallback auth modal method for:', mode);
    const title = mode === 'signin' ? 'Sign In' : 'Create Account';
    alert(`📱 ${title} functionality is being loaded. Please try again in a moment.`);
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
            <button class="mobile-auth-close" type="button">&times;</button>
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
              <p style="font-size: 14px; color: #666;">Already have an account? <a href="#" class="switch-to-signin" style="color: #667eea; text-decoration: none;">Sign in</a></p>
            ` : `
              <p style="font-size: 14px; color: #666;"><a href="#" class="forgot-password" style="color: #667eea; text-decoration: none;">Forgot your password?</a></p>
              <p style="font-size: 14px; color: #666;">Don't have an account? <a href="#" class="switch-to-signup" style="color: #667eea; text-decoration: none;">Sign up</a></p>
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
    this.modalJustOpened = true;

    // Prevent immediate closing
    setTimeout(() => {
      this.modalJustOpened = false;
    }, 500);

    // Debug: Monitor dropdown for 'show' class changes
    const dropdown = document.getElementById('mobileProfileDropdown');
    if (dropdown) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (dropdown.classList.contains('show')) {
              console.log('🔍 DEBUG: Dropdown got "show" class via:', mutation.target.className);
              console.log('🔍 DEBUG: Stack trace:', new Error().stack);
            }
          }
        });
      });

      observer.observe(dropdown, {
        attributes: true,
        attributeFilter: ['class']
      });
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Add event listeners for modal elements
    const closeButton = this.currentModal.querySelector('.mobile-auth-close');
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeModal();
      });
    }

    // Add event listeners for footer links
    const switchToSignin = this.currentModal.querySelector('.switch-to-signin');
    if (switchToSignin) {
      switchToSignin.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchMode('signin');
      });
    }

    const switchToSignup = this.currentModal.querySelector('.switch-to-signup');
    if (switchToSignup) {
      switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchMode('signup');
      });
    }

    const forgotPassword = this.currentModal.querySelector('.forgot-password');
    if (forgotPassword) {
      forgotPassword.addEventListener('click', (e) => {
        e.preventDefault();
        this.showForgotPassword();
      });
    }

    // Handle form submission with actual auth functionality
    const form = document.getElementById('mobileAuthForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('📱 Form submitted, mode:', mode);
        console.log('📱 Form element:', form);
        await this.handleAuthSubmission(mode, form);
      });
      console.log('📱 Form submit handler added');
    } else {
      console.error('❌ Mobile auth form not found');
    }

    // Add outside click handler
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  // Handle authentication form submission
  async handleAuthSubmission(mode, form) {
    console.log(`📱 Mobile auth submission: ${mode}`);

    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    const displayName = formData.get('displayName');
    const confirmPassword = formData.get('confirmPassword');

    console.log('📱 Form data:', { email, displayName, hasPassword: !!password });

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
      console.log('📱 Checking for auth service...');

      if (window.authService && typeof window.authService.signUp === 'function' && typeof window.authService.signIn === 'function') {
        console.log('✅ Auth service found with required methods, proceeding with authentication');

        // Use the auth service if available
        let result;
        if (mode === 'signup') {
          console.log('📱 Calling signUp...');
          result = await window.authService.signUp(email, password, displayName);
        } else {
          console.log('📱 Calling signIn...');
          result = await window.authService.signIn(email, password);
        }

        console.log('📱 Auth result:', result);

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
        console.error('❌ Auth service not found');
        // Fallback if auth service is not available
        this.showError('Authentication service not available. Please try again later.');
      }
    } catch (error) {
      console.error('📱 Auth error:', error);
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
    // Don't close modal if it's just been opened
    if (this.currentModal && !this.currentModal.contains(e.target) && !this.modalJustOpened) {
      this.closeModal();
    }
  }

  // Close modal
  closeModal() {
    if (this.currentModal) {
      this.currentModal.remove();
      this.currentModal = null;
      this.modalJustOpened = false;
      document.body.style.overflow = '';
      console.log('📱 Mobile auth modal closed');
    }
  }

  // Public method to test mobile auth
  testMobileSignUp() {
    console.log('🧪 Testing mobile sign up...');
    this.showSignUpModal();
  }

  // Test mobile sign in
  testMobileSignIn() {
    console.log('🧪 Testing mobile sign in...');
    this.showSignInModal();
  }

  // Test both mobile auth functions
  testMobileAuth() {
    console.log('🧪 Testing mobile authentication...');
    console.log('📱 Mobile auth instance:', this);
    console.log('📱 Auth service available:', !!window.authService);
    if (window.authService) {
      console.log('📱 Auth service methods:', Object.keys(window.authService));
      console.log('📱 Current user:', window.authService.currentUser);
    }
    return {
      mobileAuth: !!this,
      authService: !!window.authService,
      currentUser: window.authService?.currentUser || null
    };
  }

  // Test auth service connection
  testAuthServiceConnection() {
    console.log('🧪 Testing auth service connection...');

    if (window.authService) {
      console.log('✅ Auth service is available');
      console.log('📱 Auth service methods:', Object.keys(window.authService));
      console.log('📱 Current user:', window.authService.currentUser);
      return true;
    } else {
      console.error('❌ Auth service not found');
      console.log('📱 Available window objects:', Object.keys(window).filter(key => key.includes('auth')));
      return false;
    }
  }

  // Quick test function - run this from console
  quickTest() {
    console.log('🧪 QUICK TEST - Mobile Auth Status');
    console.log('📱 Mobile auth object exists:', !!window.mobileAuth);
    console.log('📱 Auth service exists:', !!window.authService);
    console.log('📱 Mobile button exists:', !!document.getElementById('mobileProfileButton'));
    console.log('📱 Mobile dropdown exists:', !!document.getElementById('mobileProfileDropdown'));

    if (window.mobileAuth) {
      console.log('📱 Mobile auth methods:', {
        showSignInModal: typeof this.showSignInModal,
        showSignUpModal: typeof this.showSignUpModal,
        toggleDropdown: typeof this.toggleMobileProfileDropdown,
        closeDropdown: typeof this.closeDropdown
      });
    }

    // Test if we can call methods
    if (window.mobileAuth && typeof this.showSignUpModal === 'function') {
      console.log('✅ showSignUpModal method is available');
    } else {
      console.log('❌ showSignUpModal method is NOT available');
    }

    return {
      mobileAuth: !!window.mobileAuth,
      authService: !!window.authService,
      mobileButton: !!document.getElementById('mobileProfileButton'),
      mobileDropdown: !!document.getElementById('mobileProfileDropdown'),
      showSignUpModalAvailable: !!(window.mobileAuth && typeof this.showSignUpModal === 'function')
    };
  }

  // Public method to show mobile elements for testing
  showMobileElements() {
    console.log('🧪 Showing mobile elements for testing...');
    const mobileButton = document.getElementById('mobileProfileButton');
    const mobileDropdown = document.getElementById('mobileProfileDropdown');

    if (mobileButton) {
      mobileButton.style.display = 'flex';
      mobileButton.style.position = 'fixed';
      mobileButton.style.top = '15px';
      mobileButton.style.right = '15px';
      mobileButton.style.zIndex = '1000';
    }

    if (mobileDropdown) {
      mobileDropdown.style.display = 'block';
    }

    // Add test mode class to body
    document.body.classList.add('mobile-test-mode');

    console.log('✅ Mobile elements should now be visible');
  }

  // Public method to test dropdown functionality
  testDropdown() {
    console.log('🧪 Testing dropdown functionality...');
    const mobileButton = document.getElementById('mobileProfileButton');
    const mobileDropdown = document.getElementById('mobileProfileDropdown');

    if (mobileButton && mobileDropdown) {
      console.log('📱 Clicking mobile button to open dropdown...');
      mobileButton.click();

      setTimeout(() => {
        console.log('📱 Dropdown should now be open');
        console.log('📱 Dropdown classes:', mobileDropdown.className);
        console.log('📱 Dropdown display:', window.getComputedStyle(mobileDropdown).display);

        // Test closing after 2 seconds
        setTimeout(() => {
          console.log('📱 Testing dropdown close...');
          this.closeDropdown();
        }, 2000);
      }, 500);
    } else {
      console.error('❌ Mobile button or dropdown not found');
    }
  }

  // Public method to test dropdown close functionality
  testDropdownClose() {
    console.log('🧪 Testing dropdown close functionality...');
    const mobileDropdown = document.getElementById('mobileProfileDropdown');

    if (mobileDropdown) {
      console.log('📱 Current dropdown state:', mobileDropdown.classList.contains('show') ? 'OPEN' : 'CLOSED');

      if (mobileDropdown.classList.contains('show')) {
        console.log('📱 Closing dropdown...');
        this.closeDropdown();
      } else {
        console.log('📱 Opening dropdown...');
        this.openDropdown();
      }
    } else {
      console.error('❌ Mobile dropdown not found');
    }
  }

  // Force close dropdown (emergency method)
  forceCloseDropdown() {
    console.log('🚨 Force closing dropdown...');
    const dropdown = document.getElementById('mobileProfileDropdown');
    if (dropdown) {
      // Remove all possible show states
      dropdown.classList.remove('show');
      dropdown.style.display = 'none';
      dropdown.style.visibility = 'hidden';
      dropdown.style.opacity = '0';

      console.log('🚨 Dropdown force closed');
    } else {
      console.error('❌ Dropdown not found for force close');
    }
  }

  // Simple test function for console
  testClose() {
    console.log('🧪 Testing close function...');
    this.closeDropdown();
  }

  // EMERGENCY CLOSE - Run this from console
  emergencyClose() {
    console.log('🚨 EMERGENCY CLOSE ACTIVATED');

    // Find and destroy all dropdowns
    const dropdowns = document.querySelectorAll('.mobile-profile-dropdown, #mobileProfileDropdown');
    dropdowns.forEach(dropdown => {
      dropdown.style.display = 'none';
      dropdown.style.visibility = 'hidden';
      dropdown.style.opacity = '0';
      dropdown.classList.remove('show');
      dropdown.remove();
    });

    // Remove all show classes
    const showElements = document.querySelectorAll('.show');
    showElements.forEach(element => {
      if (element.classList.contains('mobile-profile-dropdown')) {
        element.classList.remove('show');
      }
    });

    console.log('🚨 ALL DROPDOWNS DESTROYED');
  }
}

// WAIT FOR AUTH SERVICE TO BE READY
console.log('🚀 MOBILE AUTH INITIALIZATION - WAITING FOR AUTH SERVICE');

function initializeMobileAuth() {
  console.log('📱 Initializing Mobile Auth...');
  try {
    let mobileAuth = new MobileAuth();
    window.mobileAuth = mobileAuth;
    console.log('✅ Mobile Auth created and assigned to window.mobileAuth');
  } catch (error) {
    console.error('❌ Error creating Mobile Auth:', error);
  }
}

// Wait for auth service to be available
function waitForAuthService() {
  console.log('🔍 Checking for auth service...');
  console.log('🔍 window.authService:', window.authService);
  console.log('🔍 window.mobileAuth:', window.mobileAuth);

  if (window.authService) {
    console.log('✅ Auth service found, initializing mobile auth');
    initializeMobileAuth();
  } else {
    console.log('⏳ Waiting for auth service...');
    setTimeout(waitForAuthService, 100);
  }
}

// Start waiting
console.log('🚀 Starting mobile auth initialization...');
waitForAuthService();

// Also try to initialize after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('📱 DOM Content Loaded - checking mobile auth...');
  if (!window.mobileAuth && window.authService) {
    console.log('📱 Initializing mobile auth on DOM ready...');
    initializeMobileAuth();
  }
});

// Also try to initialize after a longer delay as fallback
setTimeout(() => {
  console.log('📱 Fallback initialization check...');
  if (!window.mobileAuth) {
    console.log('📱 Force initializing mobile auth after timeout...');
    window.forceInitMobileAuth();
  }
}, 2000);

// Global test function
window.testMobileAuth = function () {
  console.log('🧪 GLOBAL TEST - Mobile Auth Status');

  if (window.mobileAuth) {
    return window.mobileAuth.quickTest();
  } else {
    console.error('❌ Mobile auth not initialized');
    return { error: 'Mobile auth not initialized' };
  }
};

// Global function to show mobile sign up
window.showMobileSignUp = function () {
  if (window.mobileAuth) {
    window.mobileAuth.showSignUpModal();
  } else {
    console.error('❌ Mobile auth not initialized');
  }
};

// Global function to show mobile sign in
window.showMobileSignIn = function () {
  if (window.mobileAuth) {
    window.mobileAuth.showSignInModal();
  } else {
    console.error('❌ Mobile auth not initialized');
  }
};

// Global function to test mobile auth
window.testMobileAuthFunctions = function () {
  console.log('🧪 Testing mobile auth functions...');
  if (window.mobileAuth) {
    const result = window.mobileAuth.testMobileAuth();
    console.log('📱 Test result:', result);
    return result;
  } else {
    console.error('❌ Mobile auth not initialized');
    return { error: 'Mobile auth not initialized' };
  }
};

// Global function to test mobile auth methods directly
window.testMobileAuthMethods = function () {
  console.log('🧪 Testing mobile auth methods directly...');
  if (window.mobileAuth) {
    console.log('📱 Testing showSignInModal...');
    try {
      window.mobileAuth.showSignInModal();
      return { success: true, message: 'showSignInModal called successfully' };
    } catch (error) {
      console.error('❌ Error calling showSignInModal:', error);
      return { success: false, error: error.message };
    }
  } else {
    console.error('❌ Mobile auth not initialized');
    return { error: 'Mobile auth not initialized' };
  }
};

// Direct modal test function
window.testMobileModal = function (mode = 'signin') {
  console.log('🧪 Testing mobile modal directly for:', mode);

  const title = mode === 'signin' ? 'Sign In' : 'Create Account';
  const modalHTML = `
    <div class="mobile-auth-modal" id="testMobileAuthModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
      <div style="background: white; padding: 20px; border-radius: 10px; max-width: 400px; width: 90%;">
        <h2>📱 ${title}</h2>
        <p>This is a test modal for ${mode}</p>
        <button onclick="this.parentElement.parentElement.remove()" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Close</button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  console.log('✅ Test modal created');
};

// Direct test for mobile auth methods
window.testMobileAuthDirect = function () {
  console.log('🧪 Testing mobile auth methods directly...');

  if (window.mobileAuth) {
    console.log('✅ Mobile auth found');
    console.log('📱 showSignInModal method:', typeof window.mobileAuth.showSignInModal);
    console.log('📱 showSignUpModal method:', typeof window.mobileAuth.showSignUpModal);

    // Test calling the methods directly
    try {
      console.log('📱 Calling showSignInModal directly...');
      window.mobileAuth.showSignInModal();
      return '✅ showSignInModal called successfully';
    } catch (error) {
      console.error('❌ Error calling showSignInModal:', error);
      return '❌ Error: ' + error.message;
    }
  } else {
    console.error('❌ Mobile auth not found');
    return '❌ Mobile auth not found';
  }
};

// Test mobile dropdown functionality
window.testMobileDropdown = function () {
  console.log('🧪 Testing mobile dropdown functionality...');

  // Check if mobile dropdown exists
  const mobileDropdown = document.getElementById('mobileProfileDropdown');
  const mobileMenu = document.getElementById('mobileProfileMenu');

  console.log('📱 Mobile dropdown exists:', !!mobileDropdown);
  console.log('📱 Mobile menu exists:', !!mobileMenu);

  if (mobileMenu) {
    console.log('📱 Mobile menu innerHTML:', mobileMenu.innerHTML);
    console.log('📱 Mobile menu children count:', mobileMenu.children.length);
  }

  // Check if auth service is available
  console.log('📱 Auth service available:', !!window.authService);
  if (window.authService) {
    console.log('📱 Auth service methods:', Object.keys(window.authService));
  }

  // Try to populate mobile menu
  if (window.mobileAuth) {
    console.log('📱 Calling populateMobileProfileMenu...');
    window.mobileAuth.populateMobileProfileMenu();

    // Check again after population
    setTimeout(() => {
      console.log('📱 Mobile menu after population:', mobileMenu?.innerHTML);
      console.log('📱 Mobile menu children after population:', mobileMenu?.children.length);
    }, 100);
  }

  return {
    mobileDropdown: !!mobileDropdown,
    mobileMenu: !!mobileMenu,
    authService: !!window.authService,
    mobileAuth: !!window.mobileAuth
  };
};

// Force initialize mobile auth
window.forceInitMobileAuth = function () {
  console.log('🔧 Force initializing mobile auth...');
  try {
    if (!window.mobileAuth) {
      console.log('📱 Creating new MobileAuth instance...');
      const newMobileAuth = new MobileAuth();
      window.mobileAuth = newMobileAuth;
      console.log('✅ Mobile auth force initialized:', window.mobileAuth);
      return true;
    } else {
      console.log('📱 Mobile auth already exists:', window.mobileAuth);
      return true;
    }
  } catch (error) {
    console.error('❌ Error force initializing mobile auth:', error);
    return false;
  }
};

// Force close mobile dropdown - can be called from console
window.forceCloseMobileDropdown = function () {
  console.log('🚨 Force closing mobile dropdown from global function...');
  const dropdown = document.getElementById('mobileProfileDropdown');
  if (dropdown) {
    dropdown.classList.remove('show');
    dropdown.style.display = 'none';
    dropdown.style.visibility = 'hidden';
    dropdown.style.opacity = '0';
    console.log('✅ Mobile dropdown force closed');
  } else {
    console.log('❌ Mobile dropdown not found');
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileAuth;
}


