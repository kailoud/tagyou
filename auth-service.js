// Authentication Service
// Handles user authentication using Firebase Auth

class AuthService {
  constructor() {
    this.auth = null;
    this.currentUser = null;
    this.authStateCallbacks = [];
    this.init();
  }

  async init() {
    // Wait for Firebase to be initialized
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
        this.auth = firebase.auth();
        this.setupAuthStateListener();
        console.log('✅ AuthService initialized');

        // Trigger initial UI update
        setTimeout(() => {
          this.updateAuthUI(this.currentUser);
          console.log('🎨 Initial auth UI update triggered for:', this.currentUser ? 'authenticated user' : 'guest user');
        }, 500);

        break;
      }
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (attempts >= maxAttempts) {
      console.error('❌ AuthService failed to initialize - Firebase not ready');
    }
  }

  setupAuthStateListener() {
    this.auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      console.log('Auth state changed:', user ? `Logged in as ${user.email}` : 'Logged out');

      // Notify all listeners
      this.authStateCallbacks.forEach(callback => callback(user));

      // Update UI
      this.updateAuthUI(user);
    });
  }

  onAuthStateChanged(callback) {
    this.authStateCallbacks.push(callback);
    // Call immediately with current state
    if (this.currentUser !== null) {
      callback(this.currentUser);
    }
  }

  async signUp(email, password, displayName) {
    try {
      console.log('🔐 Creating new user account...');

      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Update profile with display name
      await user.updateProfile({
        displayName: displayName
      });

      // Create user document in Firestore
      await this.createUserDocument(user, { displayName });

      console.log('✅ User account created successfully');
      return { success: true, user };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      return { success: false, error: error.message };
    }
  }

  async signIn(email, password) {
    try {
      console.log('🔐 Signing in user...');

      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      console.log('✅ User signed in successfully');
      return { success: true, user };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      console.log('🔐 Signing out user...');

      // Close the profile dropdown
      const profileDropdown = document.getElementById('profileDropdown');
      if (profileDropdown) {
        profileDropdown.classList.remove('show');
      }

      await this.auth.signOut();
      console.log('✅ User signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  async resetPassword(email) {
    try {
      console.log('🔐 Sending password reset email...');
      await this.auth.sendPasswordResetEmail(email);
      console.log('✅ Password reset email sent');
      return { success: true };
    } catch (error) {
      console.error('❌ Password reset error:', error);
      return { success: false, error: error.message };
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

      // Update Firestore user document
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
        preferences: {
          notifications: true,
          theme: 'light',
          language: 'en'
        },
        favorites: {
          foodStalls: [],
          artists: [],
          floatTrucks: []
        },
        ...additionalData
      };

      await userRef.set(userData);
      console.log('✅ User document created in Firestore');
    } catch (error) {
      console.error('❌ Error creating user document:', error);
    }
  }

  async updateUserDocument(uid, updates) {
    try {
      const userRef = firebase.firestore().collection('users').doc(uid);
      const updateData = {
        ...updates,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      await userRef.update(updateData);
      console.log('✅ User document updated in Firestore');
    } catch (error) {
      console.error('❌ Error updating user document:', error);
    }
  }

  async getUserDocument(uid) {
    try {
      const userRef = firebase.firestore().collection('users').doc(uid);
      const doc = await userRef.get();

      if (doc.exists) {
        return { success: true, data: doc.data() };
      } else {
        return { success: false, error: 'User document not found' };
      }
    } catch (error) {
      console.error('❌ Error getting user document:', error);
      return { success: false, error: error.message };
    }
  }

  updateAuthUI(user) {
    // Update profile button and menu
    const profileButton = document.querySelector('.profile-button');
    const profileMenu = document.querySelector('.profile-menu');
    const profileHeader = document.querySelector('.profile-header .profile-info');

    if (user) {
      // User is logged in
      if (profileButton) {
        profileButton.innerHTML = `
          <i class="fas fa-user-circle profile-icon"></i>
        `;
      }

      // Update profile header
      if (profileHeader) {
        profileHeader.innerHTML = `
          <h4>${user.displayName || user.email}</h4>
          <p>Signed in to TagYou2</p>
        `;
      }

      // Update menu items without breaking existing event listeners
      this.updateMenuItemsForAuthenticatedUser();

    } else {
      // User is not logged in
      if (profileButton) {
        profileButton.innerHTML = `
          <i class="fas fa-user profile-icon"></i>
        `;
      }

      // Update profile header
      if (profileHeader) {
        profileHeader.innerHTML = `
          <h4>Festival Goer</h4>
          <p>Welcome to TagYou2!</p>
        `;
      }

      // Update menu items without breaking existing event listeners
      this.updateMenuItemsForGuestUser();
    }
  }

  updateMenuItemsForAuthenticatedUser() {
    const profileMenu = document.querySelector('.profile-menu');
    if (!profileMenu) return;

    // Clear existing content
    profileMenu.innerHTML = '';

    // Add authenticated user menu items
    const menuItems = [
      { id: 'profileMenuItem', icon: 'fas fa-user-circle', text: 'My Profile', action: () => this.showProfile() },
      { id: 'favoritesMenuItem', icon: 'fas fa-heart', text: 'My Favorites', badge: '0', action: () => this.showFavorites() },
      { id: 'settingsMenuItem', icon: 'fas fa-cog', text: 'Settings', action: () => this.showSettings() },
      { id: 'logoutMenuItem', icon: 'fas fa-sign-out-alt', text: 'Sign Out', action: () => this.signOut(), className: 'logout' }
    ];

    // Create menu items
    menuItems.forEach((item, index) => {
      if (index === 3) { // Add divider before logout
        const divider = document.createElement('div');
        divider.className = 'profile-divider';
        profileMenu.appendChild(divider);
      }

      const button = document.createElement('button');
      button.className = `profile-menu-item ${item.className || ''}`;
      button.id = item.id;
      button.innerHTML = `
        <i class="${item.icon}"></i>
        <span>${item.text}</span>
        ${item.badge ? `<span class="badge">${item.badge}</span>` : ''}
      `;

      // Add click event listener
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        item.action();
      });

      profileMenu.appendChild(button);
    });
  }

  updateMenuItemsForGuestUser() {
    const profileMenu = document.querySelector('.profile-menu');
    if (!profileMenu) {
      console.warn('⚠️ Profile menu not found - cannot update guest menu');
      return;
    }

    console.log('👤 Updating menu for guest user...');

    // Clear existing content
    profileMenu.innerHTML = '';

    // Add guest user menu items
    const menuItems = [
      { id: 'loginMenuItem', icon: 'fas fa-sign-in-alt', text: 'Sign In', action: () => this.showLogin(), highlight: true },
      { id: 'registerMenuItem', icon: 'fas fa-user-plus', text: 'Create Account', action: () => this.showRegister(), highlight: true },
      { id: 'helpMenuItem', icon: 'fas fa-question-circle', text: 'Help & Support', action: () => this.showHelp() }
    ];

    // Create menu items
    menuItems.forEach((item, index) => {
      if (index === 2) { // Add divider before help
        const divider = document.createElement('div');
        divider.className = 'profile-divider';
        profileMenu.appendChild(divider);
      }

      const button = document.createElement('button');
      button.className = `profile-menu-item ${item.highlight ? 'auth-action' : ''}`;
      button.id = item.id;
      button.innerHTML = `
        <i class="${item.icon}"></i>
        <span>${item.text}</span>
      `;

      // Add click event listener
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log(`🔘 Guest menu item clicked: ${item.text}`);
        item.action();
      });

      profileMenu.appendChild(button);
    });

    console.log('✅ Guest menu updated with', menuItems.length, 'items');
  }

  showLogin() {
    this.showAuthModal('login');
  }

  showRegister() {
    this.showAuthModal('register');
  }

  showProfile() {
    console.log('Show profile modal');
    // Implementation will be added
  }

  showFavorites() {
    console.log('Show favorites');
    // Implementation will be added
  }

  showSettings() {
    console.log('Show settings');
    // Implementation will be added
  }

  showHelp() {
    console.log('Show help');
    // Implementation will be added
  }

  // Force update to guest UI (useful for debugging)
  forceGuestUI() {
    console.log('🔄 Forcing guest UI update...');
    this.updateAuthUI(null);
  }

  showAuthModal(mode = 'login') {
    // Remove existing modal if any
    const existingModal = document.querySelector('.auth-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = this.getAuthModalHTML(mode);

    document.body.appendChild(modal);

    // Add event listeners
    this.setupAuthModalEvents(modal, mode);

    // Show modal with animation
    setTimeout(() => modal.classList.add('show'), 10);
  }

  getAuthModalHTML(mode) {
    const isLogin = mode === 'login';

    return `
      <div class="auth-modal-overlay" onclick="authService.closeAuthModal()">
        <div class="auth-modal-content" onclick="event.stopPropagation()">
          <button class="auth-modal-close" onclick="authService.closeAuthModal()">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="auth-modal-header">
            <h2>${isLogin ? 'Welcome Back!' : 'Join TagYou'}</h2>
            <p>${isLogin ? 'Sign in to access your personalized festival experience' : 'Create an account to save favorites and get personalized recommendations'}</p>
          </div>
          
          <form class="auth-form" id="authForm">
            ${!isLogin ? `
              <div class="form-group">
                <label for="displayName">Full Name</label>
                <input type="text" id="displayName" name="displayName" required>
              </div>
            ` : ''}
            
            <div class="form-group">
              <label for="email">Email Address</label>
              <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required>
              ${!isLogin ? '<small>Minimum 6 characters</small>' : ''}
            </div>
            
            ${!isLogin ? `
              <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required>
              </div>
            ` : ''}
            
            <button type="submit" class="auth-submit-btn">
              ${isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          
          <div class="auth-modal-footer">
            ${isLogin ? `
              <p><a href="#" onclick="authService.showForgotPassword()" class="auth-link">Forgot your password?</a></p>
              <p>Don't have an account? <a href="#" onclick="authService.showAuthModal('register')" class="auth-link">Sign up</a></p>
            ` : `
              <p>Already have an account? <a href="#" onclick="authService.showAuthModal('login')" class="auth-link">Sign in</a></p>
            `}
          </div>
          
          <div class="auth-error" id="authError" style="display: none;"></div>
          <div class="auth-success" id="authSuccess" style="display: none;"></div>
        </div>
      </div>
    `;
  }

  setupAuthModalEvents(modal, mode) {
    const form = modal.querySelector('#authForm');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('.auth-submit-btn');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Processing...';
      submitBtn.disabled = true;

      const formData = new FormData(form);
      const email = formData.get('email');
      const password = formData.get('password');

      let result;

      if (mode === 'login') {
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
        this.showAuthSuccess(mode === 'login' ? 'Signed in successfully!' : 'Account created successfully!');
        setTimeout(() => this.closeAuthModal(), 1500);
      } else {
        this.showAuthError(result.error);
      }

      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  }

  showAuthError(message) {
    const errorDiv = document.querySelector('#authError');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      setTimeout(() => errorDiv.style.display = 'none', 5000);
    }
  }

  showAuthSuccess(message) {
    const successDiv = document.querySelector('#authSuccess');
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

  showForgotPassword() {
    const email = document.querySelector('#email')?.value;
    if (email) {
      this.resetPassword(email).then(result => {
        if (result.success) {
          this.showAuthSuccess('Password reset email sent!');
        } else {
          this.showAuthError(result.error);
        }
      });
    } else {
      this.showAuthError('Please enter your email address first');
    }
  }

  // Utility methods
  isAuthenticated() {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getUserId() {
    return this.currentUser ? this.currentUser.uid : null;
  }

  getUserEmail() {
    return this.currentUser ? this.currentUser.email : null;
  }

  getUserDisplayName() {
    return this.currentUser ? (this.currentUser.displayName || this.currentUser.email) : null;
  }
}

// Create global instance
const authService = new AuthService();

// Export for module use
export default authService;
