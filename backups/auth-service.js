// Authentication Service with Separate Sessions
// Handles user authentication using Firebase Auth with site-specific session isolation

class AuthService {
  constructor() {
    this.auth = null;
    this.currentUser = null;
    this.authStateCallbacks = [];
    this.siteId = this.getSiteId(); // Unique identifier for this website
    this.sessionKey = `auth_session_${this.siteId}`; // Site-specific session key
    this.init();
  }

  // Generate unique site identifier based on domain/hostname
  getSiteId() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // Create a unique ID for this specific site/domain
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // For localhost, use port number to differentiate sites
      const port = window.location.port || '80';
      return `site_${hostname}_${port}_${pathname.replace(/\//g, '_')}`;
    } else {
      // For production, use domain and path
      return `site_${hostname}_${pathname.replace(/\//g, '_')}`;
    }
  }

  // Site-specific session storage
  getSessionStorage() {
    return {
      get: (key) => {
        try {
          const fullKey = `${this.sessionKey}_${key}`;
          const item = localStorage.getItem(fullKey);
          return item ? JSON.parse(item) : null;
        } catch (error) {
          console.warn('Session storage get error:', error);
          return null;
        }
      },
      set: (key, value) => {
        try {
          const fullKey = `${this.sessionKey}_${key}`;
          localStorage.setItem(fullKey, JSON.stringify(value));
        } catch (error) {
          console.warn('Session storage set error:', error);
        }
      },
      remove: (key) => {
        try {
          const fullKey = `${this.sessionKey}_${key}`;
          localStorage.removeItem(fullKey);
        } catch (error) {
          console.warn('Session storage remove error:', error);
        }
      },
      clear: () => {
        try {
          // Remove all keys for this site
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith(this.sessionKey)) {
              localStorage.removeItem(key);
            }
          });
        } catch (error) {
          console.warn('Session storage clear error:', error);
        }
      }
    };
  }

  async init() {
    // Wait for Firebase to be initialized
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
        this.auth = firebase.auth();

        // Configure Firebase Auth for site-specific sessions
        this.configureSiteSpecificAuth();

        this.setupAuthStateListener();
        console.log(`✅ AuthService initialized for site: ${this.siteId}`);

        // Trigger initial UI update
        setTimeout(() => {
          this.updateAuthUI(this.currentUser);
          console.log('🎨 Initial auth UI update triggered for:', this.currentUser ? 'authenticated user' : 'guest user');
        }, 500);

        // Check for password reset confirmation on page load
        this.handlePasswordResetConfirmation();

        break;
      }
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (attempts >= maxAttempts) {
      console.error('❌ AuthService failed to initialize - Firebase not ready');
    }
  }

  // Configure Firebase Auth for site-specific behavior
  configureSiteSpecificAuth() {
    // Set persistence to LOCAL (site-specific) instead of default
    this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        console.log('🔐 Auth persistence set to LOCAL for site-specific sessions');
      })
      .catch((error) => {
        console.warn('⚠️ Could not set auth persistence:', error);
      });

    // Store site info in session
    const session = this.getSessionStorage();
    session.set('site_info', {
      siteId: this.siteId,
      domain: window.location.hostname,
      path: window.location.pathname,
      timestamp: Date.now()
    });
  }

  setupAuthStateListener() {
    this.auth.onAuthStateChanged((user) => {
      this.currentUser = user;

      // Store user state in site-specific storage
      const session = this.getSessionStorage();
      if (user) {
        session.set('current_user', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          timestamp: Date.now()
        });
        console.log(`🔐 User logged in on site ${this.siteId}:`, user.email);
      } else {
        session.remove('current_user');
        console.log(`🔐 User logged out on site ${this.siteId}`);
      }

      // Notify all listeners
      this.authStateCallbacks.forEach(callback => callback(user));

      // Update UI
      this.updateAuthUI(user);

      // Check if this is a password reset completion
      this.handlePasswordResetCompletion(user);
    });
  }

  onAuthStateChanged(callback) {
    this.authStateCallbacks.push(callback);
    // Call immediately with current state
    if (this.currentUser !== null) {
      callback(this.currentUser);
    }
  }

  handlePasswordResetCompletion(user) {
    if (!user) return;

    // Check if user just completed password reset by looking at URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');

    if (mode === 'resetPassword' && oobCode) {
      console.log('🔄 Password reset completed, user automatically signed in');

      // Show success message
      this.showPasswordResetSuccess();

      // Clean up URL parameters
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      // Close any open modals
      this.closeAuthModal();
      this.closeForgotPasswordModal();
    }
  }

  // Handle password reset confirmation when user returns from reset link
  async handlePasswordResetConfirmation() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');

    if (mode === 'resetPassword' && oobCode) {
      console.log('🔄 Processing password reset confirmation...');

      try {
        // Show loading state
        this.showPasswordResetLoading();

        // Confirm the password reset
        await this.auth.confirmPasswordReset(oobCode, '');

        // The user should now be signed in automatically
        console.log('✅ Password reset confirmed successfully');

        // Clean up URL parameters
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);

        // Show success message
        this.showPasswordResetSuccess();

      } catch (error) {
        console.error('❌ Password reset confirmation error:', error);
        this.showPasswordResetError('Failed to complete password reset. Please try again.');
      }
    }
  }

  showPasswordResetLoading() {
    // Create a loading notification
    const notification = document.createElement('div');
    notification.className = 'password-reset-loading';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">⏳</div>
        <div class="notification-text">
          <h3>Completing Password Reset...</h3>
          <p>Please wait while we process your request.</p>
        </div>
      </div>
    `;

    // Add to page
    document.body.appendChild(notification);
  }

  showPasswordResetError(message) {
    // Create an error notification
    const notification = document.createElement('div');
    notification.className = 'password-reset-error';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">❌</div>
        <div class="notification-text">
          <h3>Password Reset Failed</h3>
          <p>${message}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
      </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 8000);
  }

  showPasswordResetSuccess() {
    // Create a temporary success notification
    const notification = document.createElement('div');
    notification.className = 'password-reset-success';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">✅</div>
        <div class="notification-text">
          <h3>Password Reset Successful!</h3>
          <p>Welcome back! You've been automatically signed in.</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
      </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  async signUp(email, password, displayName) {
    try {
      console.log(`🔐 Creating new user account on site ${this.siteId}...`);

      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Update profile with display name
      await user.updateProfile({
        displayName: displayName
      });

      // Create user document in Firestore with site-specific data
      await this.createUserDocument(user, {
        displayName,
        sites: {
          [this.siteId]: {
            firstLogin: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            preferences: {
              notifications: true,
              theme: 'light',
              language: 'en'
            }
          }
        }
      });

      console.log('✅ User account created successfully');
      return { success: true, user };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      return { success: false, error: error.message };
    }
  }

  async signIn(email, password) {
    try {
      console.log(`🔐 Signing in user on site ${this.siteId}...`);

      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Update site-specific login info
      await this.updateSiteLoginInfo(user.uid);

      console.log('✅ User signed in successfully');
      return { success: true, user };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      console.log(`🔐 Signing out user from site ${this.siteId}...`);

      // Close the profile dropdown
      const profileDropdown = document.getElementById('profileDropdown');
      if (profileDropdown) {
        profileDropdown.classList.remove('show');
      }

      // Clear site-specific session data
      const session = this.getSessionStorage();
      session.clear();

      await this.auth.signOut();
      console.log('✅ User signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update site-specific login information
  async updateSiteLoginInfo(userId) {
    try {
      const userRef = firebase.firestore().collection('users').doc(userId);
      await userRef.update({
        [`sites.${this.siteId}.lastLogin`]: firebase.firestore.FieldValue.serverTimestamp(),
        [`sites.${this.siteId}.loginCount`]: firebase.firestore.FieldValue.increment(1)
      });
    } catch (error) {
      console.warn('⚠️ Could not update site login info:', error);
    }
  }

  async resetPassword(email) {
    try {
      console.log('🔐 Sending password reset email to:', email);

      // Check if Firebase Auth is properly initialized
      if (!this.auth) {
        throw new Error('Firebase Auth not initialized');
      }

      // Check if email is valid
      if (!email || !this.isValidEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Send password reset email with custom redirect URL
      const actionCodeSettings = {
        url: window.location.origin + window.location.pathname,
        handleCodeInApp: true
      };

      await this.auth.sendPasswordResetEmail(email, actionCodeSettings);
      console.log('✅ Password reset email sent successfully with custom redirect');

      return { success: true };
    } catch (error) {
      console.error('❌ Password reset error:', error);

      // Provide more specific error messages
      let errorMessage = 'Failed to send password reset email';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address. Please check the email or create a new account.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many password reset attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    }
  }

  async updateProfile(updates) {
    try {
      if (!this.currentUser) {
        throw new Error('No user logged in');
      }

      console.log('🔐 Updating user profile...');

      // Update Firebase Auth profile
      await this.currentUser.updateProfile(updates);

      // Update Firestore user document with site-specific data
      await this.updateUserDocument(this.currentUser.uid, updates);

      console.log('✅ Profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Profile update error:', error);
      return { success: false, error: error.message };
    }
  }

  async createUserDocument(user, additionalData = {}) {
    try {
      const userRef = firebase.firestore().collection('users').doc(user.uid);
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || additionalData.displayName,
        photoURL: user.photoURL || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'active',
        // Site-specific preferences and data
        sites: {
          [this.siteId]: {
            firstLogin: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            loginCount: 1,
            preferences: {
              notifications: true,
              theme: 'light',
              language: 'en'
            },
            favorites: {
              foodStalls: [],
              artists: [],
              floatTrucks: []
            }
          }
        },
        // Global preferences (shared across sites)
        globalPreferences: {
          notifications: true,
          theme: 'light',
          language: 'en'
        },
        ...additionalData
      };

      await userRef.set(userData);
      console.log('✅ User document created in Firestore with site-specific data');
    } catch (error) {
      console.error('❌ Error creating user document:', error);
    }
  }

  async updateUserDocument(userId, updates) {
    try {
      const userRef = firebase.firestore().collection('users').doc(userId);

      // Update site-specific data
      const siteUpdates = {};
      Object.keys(updates).forEach(key => {
        if (key !== 'sites' && key !== 'globalPreferences') {
          siteUpdates[`sites.${this.siteId}.${key}`] = updates[key];
        }
      });

      await userRef.update({
        ...siteUpdates,
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      console.log('✅ User document updated with site-specific data');
    } catch (error) {
      console.error('❌ Error updating user document:', error);
    }
  }

  async getUserDocument(userId) {
    try {
      const userRef = firebase.firestore().collection('users').doc(userId);
      const doc = await userRef.get();

      if (doc.exists) {
        return doc.data();
      } else {
        console.log('No user document found');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting user document:', error);
      return null;
    }
  }

  // Get site-specific user data
  async getSiteSpecificUserData(userId) {
    try {
      const userData = await this.getUserDocument(userId);
      if (userData && userData.sites && userData.sites[this.siteId]) {
        return userData.sites[this.siteId];
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting site-specific user data:', error);
      return null;
    }
  }

  // Check if user is authenticated on this specific site
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get site information
  getSiteInfo() {
    return {
      siteId: this.siteId,
      domain: window.location.hostname,
      path: window.location.pathname
    };
  }

  // Force guest UI for testing
  forceGuestUI() {
    console.log(`🧪 Forcing guest UI for site ${this.siteId}`);
    this.updateAuthUI(null);
  }

  updateAuthUI(user) {
    const profileButton = document.getElementById('profileButton');
    const profileMenu = document.getElementById('profileMenu');
    const profileName = document.getElementById('profileName');
    const profileStatus = document.getElementById('profileStatus');

    console.log('🔄 updateAuthUI called with user:', user ? 'logged in' : 'guest');
    console.log('Profile elements found:', { profileButton: !!profileButton, profileMenu: !!profileMenu });

    if (!profileButton || !profileMenu) {
      console.warn('⚠️ Profile elements not found');
      return;
    }

    if (user) {
      // User is logged in - show user initials
      const displayName = user.displayName || user.email;
      const initials = this.getUserInitials(displayName);

      profileButton.innerHTML = `
        <div class="profile-initials">${initials}</div>
      `;

      // Update profile header
      if (profileName) {
        profileName.textContent = user.displayName || 'Festival Goer';
      }
      if (profileStatus) {
        profileStatus.textContent = `Signed in as ${user.email}`;
      }

      this.updateMenuItemsForAuthenticatedUser();
    } else {
      // User is not logged in (guest)
      profileButton.innerHTML = `
        <i class="fas fa-user profile-icon"></i>
      `;

      // Update profile header for guest
      if (profileName) {
        profileName.textContent = 'Festival Goer';
      }
      if (profileStatus) {
        profileStatus.textContent = 'Welcome to TagYou2!';
      }

      this.updateMenuItemsForGuestUser();
    }
  }

  // Helper function to get user initials
  getUserInitials(name) {
    if (!name) return 'U';

    // Split name by spaces and get first letter of each word
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      // Single word - take first 2 characters
      return words[0].substring(0, 2).toUpperCase();
    } else {
      // Multiple words - take first letter of first two words
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
  }

  updateMenuItemsForAuthenticatedUser() {
    const profileMenu = document.getElementById('profileMenu');
    if (!profileMenu) {
      console.warn('⚠️ Profile menu not found for authenticated user');
      return;
    }

    console.log('🔄 Updating menu items for authenticated user');

    // Clear existing menu items
    profileMenu.innerHTML = '';

    // Add authenticated user menu items
    const menuItems = [
      { icon: 'fas fa-user', text: 'My Profile', action: () => this.showProfile() },
      { icon: 'fas fa-heart', text: 'My Favorites', action: () => this.showFavorites() },
      { icon: 'fas fa-cog', text: 'Settings', action: () => this.showSettings() },
      { icon: 'fas fa-sign-out-alt', text: 'Sign Out', action: () => this.signOut(), className: 'logout' }
    ];

    menuItems.forEach(item => {
      const button = document.createElement('button');
      button.className = `profile-menu-item ${item.className || ''}`;
      button.innerHTML = `
        <i class="${item.icon}"></i>
        <span>${item.text}</span>
      `;
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`Menu item clicked: ${item.text}`);
        item.action();
      });
      profileMenu.appendChild(button);
    });

    console.log(`✅ Added ${menuItems.length} menu items for authenticated user`);
  }

  updateMenuItemsForGuestUser() {
    const profileMenu = document.getElementById('profileMenu');
    if (!profileMenu) {
      console.warn('⚠️ Profile menu not found for guest user');
      return;
    }

    console.log('🔄 Updating menu items for guest user');

    // Clear existing menu items
    profileMenu.innerHTML = '';

    // Add guest user menu items
    const menuItems = [
      { icon: 'fas fa-sign-in-alt', text: 'Sign In', action: () => this.showSignInModal(), className: 'auth-action' },
      { icon: 'fas fa-user-plus', text: 'Create Account', action: () => this.showSignUpModal(), className: 'auth-action' },
      { icon: 'fas fa-question-circle', text: 'Help & Support', action: () => this.showHelp() }
    ];

    menuItems.forEach(item => {
      const button = document.createElement('button');
      button.className = `profile-menu-item ${item.className || ''}`;
      button.innerHTML = `
        <i class="${item.icon}"></i>
        <span>${item.text}</span>
      `;
      button.addEventListener('click', item.action);
      profileMenu.appendChild(button);
    });
  }

  // Modal and UI methods
  showSignInModal() {
    console.log('🔐 Showing sign in modal');
    this.createAuthModal('signin');
  }

  showSignUpModal() {
    console.log('🔐 Showing sign up modal');
    this.createAuthModal('signup');
  }

  createAuthModal(mode) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.auth-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const isSignUp = mode === 'signup';
    const modalHTML = `
      <div class="auth-modal">
        <div class="auth-modal-overlay"></div>
        <div class="auth-modal-content">
          <button class="auth-modal-close" onclick="authService.closeAuthModal()">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="auth-modal-header">
            <h2>${isSignUp ? 'Create Account' : 'Welcome Back!'}</h2>
            <p>${isSignUp ? 'Join TagYou to save favorites and get personalized recommendations' : 'Sign in to access your festival experience'}</p>
          </div>
          
          <form class="auth-form" id="authForm">
            ${isSignUp ? `
              <div class="form-group">
                <label for="displayName">Full Name</label>
                <input type="text" id="displayName" name="displayName" required placeholder="Enter your full name">
              </div>
            ` : ''}
            
            <div class="form-group">
              <label for="email">Email Address</label>
              <input type="email" id="email" name="email" required placeholder="Enter your email">
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required placeholder="Enter your password">
              ${isSignUp ? '<small>Minimum 6 characters</small>' : ''}
            </div>
            
            ${isSignUp ? `
              <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required placeholder="Confirm your password">
              </div>
            ` : ''}
            
            <button type="submit" class="auth-submit-btn">
              ${isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>
          
          <div class="auth-modal-footer">
            ${isSignUp ? `
              <p>Already have an account? <a href="#" onclick="authService.switchAuthMode('signin')" class="auth-link">Sign in</a></p>
            ` : `
              <p><a href="#" onclick="authService.showForgotPassword()" class="auth-link">Forgot your password?</a></p>
              <p>Don't have an account? <a href="#" onclick="authService.switchAuthMode('signup')" class="auth-link">Sign up</a></p>
            `}
          </div>
          
          <div class="auth-error" id="authError" style="display: none;"></div>
          <div class="auth-success" id="authSuccess" style="display: none;"></div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add event listeners
    this.setupAuthModalEvents(mode);

    // Add real-time email validation
    this.setupEmailValidation();

    // Show modal with animation
    setTimeout(() => {
      const modal = document.querySelector('.auth-modal');
      modal.classList.add('show');
    }, 10);
  }

  setupAuthModalEvents(mode) {
    const form = document.getElementById('authForm');
    const modal = document.querySelector('.auth-modal');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('.auth-submit-btn');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Processing...';
      submitBtn.disabled = true;

      const formData = new FormData(form);
      const email = formData.get('email');
      const password = formData.get('password');

      // Validate email format
      if (!this.isValidEmail(email)) {
        this.showAuthError('Please enter a valid email address');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }

      let result;

      if (mode === 'signin') {
        result = await this.signIn(email, password);
      } else {
        const displayName = formData.get('displayName');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
          this.showAuthError('Passwords do not match');
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          return;
        }

        result = await this.signUp(email, password, displayName);
      }

      if (result.success) {
        this.showAuthSuccess(mode === 'signin' ? 'Signed in successfully!' : 'Account created successfully!');
        setTimeout(() => this.closeAuthModal(), 1500);
      } else {
        this.showAuthError(result.error);
      }

      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });

    // Close modal when clicking overlay
    const overlay = modal.querySelector('.auth-modal-overlay');
    overlay.addEventListener('click', () => this.closeAuthModal());
  }

  switchAuthMode(mode) {
    this.closeAuthModal();
    setTimeout(() => {
      this.createAuthModal(mode);
    }, 300);
  }

  setupEmailValidation() {
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.addEventListener('input', (e) => {
        const email = e.target.value.trim();
        const isValid = this.isValidEmail(email);

        // Remove existing validation classes
        emailInput.classList.remove('valid-email', 'invalid-email');

        // Add appropriate class based on validation
        if (email.length > 0) {
          emailInput.classList.add(isValid ? 'valid-email' : 'invalid-email');
        }
      });

      emailInput.addEventListener('blur', (e) => {
        const email = e.target.value.trim();
        if (email.length > 0 && !this.isValidEmail(email)) {
          // Show validation message
          const validationMessage = document.getElementById('emailValidationMessage');
          if (validationMessage) {
            validationMessage.textContent = 'Please enter a valid email address';
            validationMessage.style.display = 'block';
          }
        }
      });

      emailInput.addEventListener('focus', () => {
        // Hide validation message when user starts typing
        const validationMessage = document.getElementById('emailValidationMessage');
        if (validationMessage) {
          validationMessage.style.display = 'none';
        }
      });
    }
  }

  showForgotPassword() {
    // Create a dedicated forgot password modal
    const modalHTML = `
      <div class="auth-modal show" id="forgotPasswordModal">
        <div class="auth-modal-overlay"></div>
        <div class="auth-modal-content">
          <button class="auth-modal-close" onclick="authService.closeForgotPasswordModal()">&times;</button>
          <div class="auth-modal-header">
            <h2>🔐 Reset Password</h2>
            <p>Enter your email address and we'll send you a link to reset your password. After resetting, you'll be automatically redirected back to this app and signed in!</p>
          </div>
          
          <form class="auth-form" id="forgotPasswordForm">
            <div class="form-group">
              <input type="email" id="resetEmail" placeholder="Enter your email address" required>
            </div>
            
            <div class="auth-error" id="forgotPasswordError" style="display: none;"></div>
            <div class="auth-success" id="forgotPasswordSuccess" style="display: none;"></div>
            
            <button type="submit" class="auth-submit-btn" id="resetPasswordBtn">
              Send Reset Link
            </button>
          </form>
          
          <div class="auth-modal-footer">
            <a href="#" onclick="authService.closeForgotPasswordModal(); authService.showSignInModal()" class="auth-link">
              ← Back to Sign In
            </a>
          </div>
        </div>
      </div>
    `;

    // Remove any existing modal
    const existingModal = document.querySelector('.auth-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add the new modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Setup form submission
    const form = document.getElementById('forgotPasswordForm');
    const submitBtn = document.getElementById('resetPasswordBtn');
    const originalText = submitBtn.textContent;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('resetEmail').value.trim();
      if (!email) {
        this.showForgotPasswordError('Please enter your email address');
        return;
      }

      // Show loading state
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      try {
        const result = await this.resetPassword(email);
        if (result.success) {
          this.showForgotPasswordSuccess('Password reset email sent! Check your inbox. Check Your Spam if not found.');
          document.getElementById('resetEmail').value = '';

          // Show instructions for the user
          setTimeout(() => {
            this.showForgotPasswordSuccess(`
              📧 Email sent! Check your inbox.<br>
              <strong>Check Your Spam</strong> if not found.
            `);
          }, 1000);
        } else {
          this.showForgotPasswordError(result.error);
        }
      } catch (error) {
        this.showForgotPasswordError('An unexpected error occurred. Please try again.');
      }

      // Reset button state
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });

    // Close modal when clicking overlay
    const overlay = document.querySelector('#forgotPasswordModal .auth-modal-overlay');
    overlay.addEventListener('click', () => this.closeForgotPasswordModal());

    // Focus on email input
    setTimeout(() => {
      document.getElementById('resetEmail').focus();
    }, 100);
  }

  closeForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    }
  }

  showForgotPasswordError(message) {
    const errorDiv = document.getElementById('forgotPasswordError');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      setTimeout(() => errorDiv.style.display = 'none', 5000);
    }
  }

  showForgotPasswordSuccess(message) {
    const successDiv = document.getElementById('forgotPasswordSuccess');
    if (successDiv) {
      successDiv.innerHTML = message;
      successDiv.style.display = 'block';
    }
  }

  // Email validation function
  isValidEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }

    // Trim whitespace
    email = email.trim();

    // Basic email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Check if email matches the pattern
    if (!emailRegex.test(email)) {
      return false;
    }

    // Additional checks
    const parts = email.split('@');
    if (parts.length !== 2) {
      return false;
    }

    const [localPart, domain] = parts;

    // Check local part (before @)
    if (localPart.length === 0 || localPart.length > 64) {
      return false;
    }

    // Check domain (after @)
    if (domain.length === 0 || domain.length > 253) {
      return false;
    }

    // Check for valid domain format
    const domainParts = domain.split('.');
    if (domainParts.length < 2) {
      return false;
    }

    // Check each domain part
    for (const part of domainParts) {
      if (part.length === 0 || part.length > 63) {
        return false;
      }

      // Domain parts should only contain letters, numbers, and hyphens
      if (!/^[a-zA-Z0-9-]+$/.test(part)) {
        return false;
      }

      // Domain parts shouldn't start or end with hyphens
      if (part.startsWith('-') || part.endsWith('-')) {
        return false;
      }
    }

    // Top-level domain should be at least 2 characters
    const topLevelDomain = domainParts[domainParts.length - 1];
    if (topLevelDomain.length < 2) {
      return false;
    }

    return true;
  }

  showAuthError(message) {
    const errorDiv = document.getElementById('authError');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      setTimeout(() => errorDiv.style.display = 'none', 5000);
    }
  }

  showAuthSuccess(message) {
    const successDiv = document.getElementById('authSuccess');
    if (successDiv) {
      successDiv.textContent = message;
      successDiv.style.display = 'block';
    }
  }

  closeAuthModal() {
    const modal = document.querySelector('.auth-modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    }
  }

  showProfile() {
    if (!this.currentUser) {
      this.showSignInModal();
      return;
    }

    // Prevent body scroll on mobile when modal is open
    document.body.style.overflow = 'hidden';

    const modalHTML = `
      <div class="auth-modal show" id="profileModal">
        <div class="auth-modal-overlay"></div>
        <div class="auth-modal-content">
          <button class="auth-modal-close" onclick="authService.closeProfileModal()">&times;</button>
          <div class="auth-modal-header">
            <h2>👤 My Profile</h2>
            <p>Manage your account information and preferences</p>
          </div>
          
          <div class="profile-content">
            <div class="profile-section">
              <h3>Account Information</h3>
              <div class="profile-info-item">
                <label>Email:</label>
                <span>${this.currentUser.email}</span>
              </div>
              <div class="profile-info-item">
                <label>Display Name:</label>
                <input type="text" id="profileDisplayName" value="${this.currentUser.displayName || ''}" placeholder="Enter your name">
              </div>
            </div>
            
            <div class="profile-section">
              <h3>Site Activity</h3>
              <div class="profile-info-item">
                <label>First Login:</label>
                <span>${new Date().toLocaleDateString()}</span>
              </div>
              <div class="profile-info-item">
                <label>Login Count:</label>
                <span>Active user</span>
              </div>
            </div>
            
            <div class="profile-actions">
              <button class="auth-submit-btn" onclick="authService.updateProfileInfo()">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove any existing modal
    const existingModal = document.querySelector('.auth-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add the new modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close modal when clicking overlay
    const overlay = document.querySelector('#profileModal .auth-modal-overlay');
    overlay.addEventListener('click', () => this.closeProfileModal());
  }

  closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
        // Restore body scroll
        document.body.style.overflow = '';
      }, 300);
    }
  }

  async updateProfileInfo() {
    const displayName = document.getElementById('profileDisplayName').value.trim();

    if (!displayName) {
      this.showProfileError('Display name cannot be empty');
      return;
    }

    try {
      const result = await this.updateProfile({ displayName });
      if (result.success) {
        this.showProfileSuccess('Profile updated successfully!');
        setTimeout(() => this.closeProfileModal(), 1500);
      } else {
        this.showProfileError(result.error);
      }
    } catch (error) {
      this.showProfileError('Failed to update profile');
    }
  }

  showFavorites() {
    if (!this.currentUser) {
      this.showSignInModal();
      return;
    }

    // Prevent body scroll on mobile when modal is open
    document.body.style.overflow = 'hidden';

    const modalHTML = `
      <div class="auth-modal show" id="favoritesModal">
        <div class="auth-modal-overlay"></div>
        <div class="auth-modal-content">
          <button class="auth-modal-close" onclick="authService.closeFavoritesModal()">&times;</button>
          <div class="auth-modal-header">
            <h2>❤️ My Favorites</h2>
            <p>Your saved food stalls, artists, and float trucks</p>
          </div>
          
          <div class="favorites-content">
            <div class="favorites-section">
              <h3>🍕 Food Stalls</h3>
              <div class="favorites-list" id="foodStallsList">
                <div class="empty-state">No food stalls saved yet</div>
              </div>
            </div>
            
            <div class="favorites-section">
              <h3>🎵 Artists</h3>
              <div class="favorites-list" id="artistsList">
                <div class="empty-state">No artists saved yet</div>
              </div>
            </div>
            
            <div class="favorites-section">
              <h3>🚛 Float Trucks</h3>
              <div class="favorites-list" id="floatTrucksList">
                <div class="empty-state">No float trucks saved yet</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove any existing modal
    const existingModal = document.querySelector('.auth-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add the new modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close modal when clicking overlay
    const overlay = document.querySelector('#favoritesModal .auth-modal-overlay');
    overlay.addEventListener('click', () => this.closeFavoritesModal());

    // Load user favorites
    this.loadUserFavorites();
  }

  closeFavoritesModal() {
    const modal = document.getElementById('favoritesModal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
        // Restore body scroll
        document.body.style.overflow = '';
      }, 300);
    }
  }

  async loadUserFavorites() {
    try {
      const userData = await this.getUserDocument(this.currentUser.uid);
      const siteData = userData?.sites?.[this.siteId];
      const favorites = siteData?.favorites || { foodStalls: [], artists: [], floatTrucks: [] };

      this.displayFavorites('foodStallsList', favorites.foodStalls, 'food stall');
      this.displayFavorites('artistsList', favorites.artists, 'artist');
      this.displayFavorites('floatTrucksList', favorites.floatTrucks, 'float truck');
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }

  displayFavorites(containerId, items, itemType) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = `<div class="empty-state">No ${itemType}s saved yet</div>`;
    } else {
      container.innerHTML = items.map(item => `
        <div class="favorite-item">
          <span class="favorite-name">${item}</span>
          <button class="remove-favorite" onclick="authService.removeFavorite('${itemType}', '${item}')">
            ❌
          </button>
        </div>
      `).join('');
    }
  }

  showSettings() {
    if (!this.currentUser) {
      this.showSignInModal();
      return;
    }

    // Prevent body scroll on mobile when modal is open
    document.body.style.overflow = 'hidden';

    const modalHTML = `
      <div class="auth-modal show" id="settingsModal">
        <div class="auth-modal-overlay"></div>
        <div class="auth-modal-content">
          <button class="auth-modal-close" onclick="authService.closeSettingsModal()">&times;</button>
          <div class="auth-modal-header">
            <h2>⚙️ Settings</h2>
            <p>Customize your experience and preferences</p>
          </div>
          
          <div class="settings-content">
            <div class="settings-section">
              <h3>Notifications</h3>
              <div class="setting-item">
                <label class="toggle-label">
                  <input type="checkbox" id="notificationsToggle" checked>
                  <span class="toggle-slider"></span>
                  Email Notifications
                </label>
              </div>
            </div>
            
            <div class="settings-section">
              <h3>Theme</h3>
              <div class="setting-item">
                <label class="radio-label">
                  <input type="radio" name="theme" value="light" checked>
                  <span class="radio-custom"></span>
                  Light Theme
                </label>
                <label class="radio-label">
                  <input type="radio" name="theme" value="dark">
                  <span class="radio-custom"></span>
                  Dark Theme
                </label>
              </div>
            </div>
            
            <div class="settings-section">
              <h3>Account</h3>
              <div class="setting-item">
                <button class="auth-submit-btn" onclick="authService.changePassword()">
                  Change Password
                </button>
              </div>
              <div class="setting-item">
                <button class="danger-btn" onclick="authService.deleteAccount()">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove any existing modal
    const existingModal = document.querySelector('.auth-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add the new modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close modal when clicking overlay
    const overlay = document.querySelector('#settingsModal .auth-modal-overlay');
    overlay.addEventListener('click', () => this.closeSettingsModal());

    // Load current settings
    this.loadUserSettings();
  }

  closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
        // Restore body scroll
        document.body.style.overflow = '';
      }, 300);
    }
  }

  async loadUserSettings() {
    try {
      const userData = await this.getUserDocument(this.currentUser.uid);
      const siteData = userData?.sites?.[this.siteId];
      const preferences = siteData?.preferences || { notifications: true, theme: 'light' };

      // Set notification toggle
      const notificationsToggle = document.getElementById('notificationsToggle');
      if (notificationsToggle) {
        notificationsToggle.checked = preferences.notifications;
      }

      // Set theme radio buttons
      const themeRadios = document.querySelectorAll('input[name="theme"]');
      themeRadios.forEach(radio => {
        radio.checked = radio.value === preferences.theme;
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  showHelp() {
    // Prevent body scroll on mobile when modal is open
    document.body.style.overflow = 'hidden';

    const modalHTML = `
      <div class="auth-modal show" id="helpModal">
        <div class="auth-modal-overlay"></div>
        <div class="auth-modal-content">
          <button class="auth-modal-close" onclick="authService.closeHelpModal()">&times;</button>
          <div class="auth-modal-header">
            <h2>❓ Help & Support</h2>
            <p>Get help with using the app</p>
          </div>
          
          <div class="help-content">
            <div class="help-section">
              <h3>How to use the app</h3>
              <ul>
                <li>Use the search bar to find food stalls and attractions</li>
                <li>Click on the UK Festivals dropdown to explore events</li>
                <li>Use the toolbar icons to access different features</li>
                <li>Save your favorites by clicking the heart icon</li>
              </ul>
            </div>
            
            <div class="help-section">
              <h3>Need more help?</h3>
              <p>Contact us at: <a href="mailto:support@tagyou.app">support@tagyou.app</a></p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove any existing modal
    const existingModal = document.querySelector('.auth-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add the new modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close modal when clicking overlay
    const overlay = document.querySelector('#helpModal .auth-modal-overlay');
    overlay.addEventListener('click', () => this.closeHelpModal());
  }

  closeHelpModal() {
    const modal = document.getElementById('helpModal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
        // Restore body scroll
        document.body.style.overflow = '';
      }, 300);
    }
  }

  showProfileError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'auth-error';
    errorDiv.textContent = message;

    const profileContent = document.querySelector('.profile-content');
    if (profileContent) {
      profileContent.insertBefore(errorDiv, profileContent.firstChild);
      setTimeout(() => errorDiv.remove(), 5000);
    }
  }

  showProfileSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'auth-success';
    successDiv.textContent = message;

    const profileContent = document.querySelector('.profile-content');
    if (profileContent) {
      profileContent.insertBefore(successDiv, profileContent.firstChild);
      setTimeout(() => successDiv.remove(), 3000);
    }
  }
}

// Create and export the auth service instance
const authService = new AuthService();

// Make it globally accessible
window.authService = authService;

export default authService;
