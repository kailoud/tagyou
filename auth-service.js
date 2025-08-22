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

    if (!profileButton || !profileMenu) {
      console.warn('⚠️ Profile elements not found');
      return;
    }

    if (user) {
      // User is logged in
      profileButton.innerHTML = `
        <i class="fas fa-user profile-icon"></i>
      `;
      this.updateMenuItemsForAuthenticatedUser();
    } else {
      // User is not logged in (guest)
      profileButton.innerHTML = `
        <i class="fas fa-user profile-icon"></i>
      `;
      this.updateMenuItemsForGuestUser();
    }
  }

  updateMenuItemsForAuthenticatedUser() {
    const profileMenu = document.getElementById('profileMenu');
    if (!profileMenu) return;

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
      button.addEventListener('click', item.action);
      profileMenu.appendChild(button);
    });
  }

  updateMenuItemsForGuestUser() {
    const profileMenu = document.getElementById('profileMenu');
    if (!profileMenu) return;

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

  // Modal and UI methods (placeholder implementations)
  showSignInModal() {
    console.log('🔐 Show sign in modal');
    // Implement sign in modal
  }

  showSignUpModal() {
    console.log('🔐 Show sign up modal');
    // Implement sign up modal
  }

  showProfile() {
    console.log('👤 Show profile');
    // Implement profile view
  }

  showFavorites() {
    console.log('❤️ Show favorites');
    // Implement favorites view
  }

  showSettings() {
    console.log('⚙️ Show settings');
    // Implement settings view
  }

  showHelp() {
    console.log('❓ Show help');
    // Implement help view
  }
}

// Create and export the auth service instance
const authService = new AuthService();

// Make it globally accessible
window.authService = authService;

export default authService;
