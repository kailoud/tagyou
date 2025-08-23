// Modern Profile UI Component
// Handles all visual aspects of the profile system

import { modernProfileService } from './modern-profile-service.js';
import { supabaseAuthService } from './supabase-auth-service.js';

class ModernProfileUI {
  constructor() {
    this.isInitialized = false;
    this.currentModal = null;
    this.dropdownOpen = false;

    // DOM elements cache
    this.elements = {
      // Profile system elements
      guest: null,
      authenticated: null,
      signInBtn: null,
      // avatarBtn removed - using modern profile system
      dropdown: null,
      profileName: null,
      displayName: null,
      email: null,
      settingsBtn: null,
      favoritesBtn: null,
      helpBtn: null,
      signOutBtn: null,

      // Modal elements
      authModal: null,
      profileModal: null,
      settingsModal: null,
      favoritesModal: null,
      helpModal: null,

      // Form elements
      profileForm: null,
      avatarUpload: null,
      avatarPreview: null
    };

    this.init();
  }

  init() {
    console.log('🎨 Initializing Modern Profile UI...');
    this.getDOMElements();
    this.setupEventListeners();
    this.setupProfileListeners();
    this.isInitialized = true;
    console.log('✅ Modern Profile UI initialized');
  }

  getDOMElements() {
    // Profile system elements
    this.elements.guest = document.getElementById('profileGuest');
    this.elements.authenticated = document.getElementById('profileAuthenticated');
    this.elements.signInBtn = document.getElementById('profileSignInBtn');
    // Profile elements removed - using modern profile system

    // Create modals if they don't exist
    this.createModals();
  }

  createModals() {
    // Create authentication modal
    if (!document.getElementById('authModal')) {
      this.createAuthModal();
    }

    // Create profile modal
    if (!document.getElementById('profileModal')) {
      this.createProfileModal();
    }

    // Create settings modal
    if (!document.getElementById('settingsModal')) {
      this.createSettingsModal();
    }

    // Create favorites modal
    if (!document.getElementById('favoritesModal')) {
      this.createFavoritesModal();
    }

    // Create help modal
    if (!document.getElementById('helpModal')) {
      this.createHelpModal();
    }
  }

  createAuthModal() {
    const modalHTML = `
      <div id="authModal" class="auth-modal">
        <div class="auth-modal-overlay">
          <div class="auth-modal-content">
            <button class="auth-modal-close" id="authModalClose">
              <i class="fas fa-times"></i>
            </button>
            
            <div class="auth-modal-header">
              <h2 id="authModalTitle">Sign In</h2>
              <p id="authModalSubtitle">Welcome to TagYou2</p>
            </div>

            <form id="authForm" class="auth-form">
              <div class="form-group">
                <label for="authEmail">Email</label>
                <input type="email" id="authEmail" required>
              </div>
              
              <div class="form-group">
                <label for="authPassword">Password</label>
                <input type="password" id="authPassword" required>
              </div>

              <button type="submit" class="auth-submit-btn" id="authSubmitBtn">
                <span id="authSubmitText">Sign In</span>
              </button>
            </form>

            <div class="auth-modal-footer">
              <p id="authToggleText">Don't have an account? <a href="#" id="authToggleBtn">Sign Up</a></p>
              <p><a href="#" id="forgotPasswordBtn">Forgot Password?</a></p>
            </div>

            <div id="authMessage"></div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.elements.authModal = document.getElementById('authModal');
  }

  createProfileModal() {
    const modalHTML = `
      <div id="profileModal" class="auth-modal">
        <div class="auth-modal-overlay">
          <div class="auth-modal-content">
            <button class="auth-modal-close" id="profileModalClose">
              <i class="fas fa-times"></i>
            </button>
            
            <div class="auth-modal-header">
              <h2>Profile</h2>
              <p>Manage your profile information</p>
            </div>

            <form id="profileForm" class="auth-form">
              <div class="avatar-section">
                <div class="avatar-preview" id="avatarPreview">
                  <i class="fas fa-user"></i>
                </div>
                <input type="file" id="avatarUpload" accept="image/*" style="display: none;">
                <button type="button" id="avatarUploadBtn" class="avatar-upload-btn">
                  <i class="fas fa-camera"></i> Change Photo
                </button>
              </div>

              <div class="form-group">
                <label for="profileDisplayName">Display Name</label>
                <input type="text" id="profileDisplayName" required>
              </div>

              <div class="form-group">
                <label for="profileBio">Bio</label>
                <textarea id="profileBio" rows="3"></textarea>
              </div>

              <div class="form-group">
                <label for="profileLocation">Location</label>
                <input type="text" id="profileLocation">
              </div>

              <div class="form-group">
                <label for="profileWebsite">Website</label>
                <input type="url" id="profileWebsite">
              </div>

              <div class="form-group">
                <label for="profilePhone">Phone</label>
                <input type="tel" id="profilePhone">
              </div>

              <button type="submit" class="auth-submit-btn">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.elements.profileModal = document.getElementById('profileModal');
  }

  createSettingsModal() {
    const modalHTML = `
      <div id="settingsModal" class="auth-modal">
        <div class="auth-modal-overlay">
          <div class="auth-modal-content">
            <button class="auth-modal-close" id="settingsModalClose">
              <i class="fas fa-times"></i>
            </button>
            
            <div class="auth-modal-header">
              <h2>Settings</h2>
              <p>Customize your experience</p>
            </div>

            <div class="settings-content">
              <div class="settings-section">
                <h3>Notifications</h3>
                <div class="setting-item">
                  <label class="toggle-label">
                    <input type="checkbox" id="emailNotifications">
                    <span class="toggle-slider"></span>
                    Email Notifications
                  </label>
                </div>
                <div class="setting-item">
                  <label class="toggle-label">
                    <input type="checkbox" id="pushNotifications">
                    <span class="toggle-slider"></span>
                    Push Notifications
                  </label>
                </div>
              </div>

              <div class="settings-section">
                <h3>Privacy</h3>
                <div class="setting-item">
                  <label class="toggle-label">
                    <input type="checkbox" id="profileVisible">
                    <span class="toggle-slider"></span>
                    Profile Visible
                  </label>
                </div>
                <div class="setting-item">
                  <label class="toggle-label">
                    <input type="checkbox" id="locationVisible">
                    <span class="toggle-slider"></span>
                    Location Visible
                  </label>
                </div>
              </div>

              <div class="settings-section">
                <h3>Appearance</h3>
                <div class="setting-item">
                  <label class="toggle-label">
                    <input type="checkbox" id="darkMode">
                    <span class="toggle-slider"></span>
                    Dark Mode
                  </label>
                </div>
              </div>

              <div class="settings-section">
                <h3>Data</h3>
                <button type="button" id="exportDataBtn" class="data-btn">
                  <i class="fas fa-download"></i> Export Data
                </button>
                <button type="button" id="importDataBtn" class="data-btn">
                  <i class="fas fa-upload"></i> Import Data
                </button>
                <input type="file" id="importDataFile" accept=".json" style="display: none;">
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.elements.settingsModal = document.getElementById('settingsModal');
  }

  createFavoritesModal() {
    const modalHTML = `
      <div id="favoritesModal" class="auth-modal">
        <div class="auth-modal-overlay">
          <div class="auth-modal-content">
            <button class="auth-modal-close" id="favoritesModalClose">
              <i class="fas fa-times"></i>
            </button>
            
            <div class="auth-modal-header">
              <h2>Favorites</h2>
              <p>Your saved locations and events</p>
            </div>

            <div class="favorites-content">
              <div class="favorites-list" id="favoritesList">
                <div class="empty-state">
                  <i class="fas fa-heart"></i>
                  <p>No favorites yet</p>
                  <p>Start exploring to save your favorite places!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.elements.favoritesModal = document.getElementById('favoritesModal');
  }

  createHelpModal() {
    const modalHTML = `
      <div id="helpModal" class="auth-modal">
        <div class="auth-modal-overlay">
          <div class="auth-modal-content">
            <button class="auth-modal-close" id="helpModalClose">
              <i class="fas fa-times"></i>
            </button>
            
            <div class="auth-modal-header">
              <h2>Help & Support</h2>
              <p>Get help with TagYou2</p>
            </div>

            <div class="help-content">
              <div class="help-section">
                <h3>Getting Started</h3>
                <ul>
                  <li>Sign up for an account to save your favorites</li>
                  <li>Use the search bar to find locations</li>
                  <li>Click on map markers for more information</li>
                  <li>Use the toolbar to filter different types of locations</li>
                </ul>
              </div>

              <div class="help-section">
                <h3>Features</h3>
                <ul>
                  <li><strong>Search:</strong> Find specific locations in London</li>
                  <li><strong>Festivals:</strong> Browse upcoming UK festivals</li>
                  <li><strong>Favorites:</strong> Save your favorite places</li>
                  <li><strong>Profile:</strong> Manage your account settings</li>
                </ul>
              </div>

              <div class="help-section">
                <h3>Contact</h3>
                <p>Need more help? Contact us at:</p>
                <ul>
                  <li><a href="mailto:support@tagyou2.com">support@tagyou2.com</a></li>
                  <li><a href="https://tagyou2.com/support">Support Website</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    this.elements.helpModal = document.getElementById('helpModal');
  }

  setupEventListeners() {
    // Profile system event listeners
    if (this.elements.signInBtn) {
      this.elements.signInBtn.addEventListener('click', () => {
        this.showAuthModal();
      });
    }

    // Avatar button event listener removed - using modern profile system

    if (this.elements.settingsBtn) {
      this.elements.settingsBtn.addEventListener('click', () => {
        this.showSettingsModal();
      });
    }

    if (this.elements.favoritesBtn) {
      this.elements.favoritesBtn.addEventListener('click', () => {
        this.showFavoritesModal();
      });
    }

    if (this.elements.helpBtn) {
      this.elements.helpBtn.addEventListener('click', () => {
        this.showHelpModal();
      });
    }

    if (this.elements.signOutBtn) {
      this.elements.signOutBtn.addEventListener('click', () => {
        this.handleSignOut();
      });
    }

    // Close dropdown when clicking outside - simplified
    document.addEventListener('click', (e) => {
      if (!this.elements.dropdown?.contains(e.target)) {
        this.closeDropdown();
      }
    });

    // Modal event listeners
    this.setupModalEventListeners();
  }

  setupModalEventListeners() {
    // Auth modal
    if (this.elements.authModal) {
      const closeBtn = this.elements.authModal.querySelector('#authModalClose');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hideModal('authModal'));
      }

      const form = this.elements.authModal.querySelector('#authForm');
      if (form) {
        form.addEventListener('submit', (e) => this.handleAuthSubmit(e));
      }

      const toggleBtn = this.elements.authModal.querySelector('#authToggleBtn');
      if (toggleBtn) {
        console.log('✅ Toggle button found and event listener added');
        toggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('🔄 Toggle button clicked');
          this.toggleAuthMode();
        });
      } else {
        console.error('❌ Toggle button not found');
      }

      const forgotBtn = this.elements.authModal.querySelector('#forgotPasswordBtn');
      if (forgotBtn) {
        console.log('✅ Forgot password button found and event listener added');
        forgotBtn.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('🔑 Forgot password button clicked');
          this.handleForgotPassword();
        });
      } else {
        console.error('❌ Forgot password button not found');
      }
    }

    // Profile modal
    if (this.elements.profileModal) {
      const closeBtn = this.elements.profileModal.querySelector('#profileModalClose');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hideModal('profileModal'));
      }

      const form = this.elements.profileModal.querySelector('#profileForm');
      if (form) {
        form.addEventListener('submit', (e) => this.handleProfileSubmit(e));
      }

      const avatarUploadBtn = this.elements.profileModal.querySelector('#avatarUploadBtn');
      const avatarUpload = this.elements.profileModal.querySelector('#avatarUpload');
      if (avatarUploadBtn && avatarUpload) {
        avatarUploadBtn.addEventListener('click', () => avatarUpload.click());
        avatarUpload.addEventListener('change', (e) => this.handleAvatarUpload(e));
      }
    }

    // Settings modal
    if (this.elements.settingsModal) {
      const closeBtn = this.elements.settingsModal.querySelector('#settingsModalClose');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hideModal('settingsModal'));
      }

      this.setupSettingsEventListeners();
    }

    // Favorites modal
    if (this.elements.favoritesModal) {
      const closeBtn = this.elements.favoritesModal.querySelector('#favoritesModalClose');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hideModal('favoritesModal'));
      }
    }

    // Help modal
    if (this.elements.helpModal) {
      const closeBtn = this.elements.helpModal.querySelector('#helpModalClose');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hideModal('helpModal'));
      }
    }
  }

  setupSettingsEventListeners() {
    const settingsModal = this.elements.settingsModal;
    if (!settingsModal) return;

    // Toggle switches
    const toggles = settingsModal.querySelectorAll('.toggle-label input');
    toggles.forEach(toggle => {
      toggle.addEventListener('change', (e) => this.handleSettingChange(e));
    });

    // Data export/import
    const exportBtn = settingsModal.querySelector('#exportDataBtn');
    const importBtn = settingsModal.querySelector('#importDataBtn');
    const importFile = settingsModal.querySelector('#importDataFile');

    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.handleExportData());
    }

    if (importBtn && importFile) {
      importBtn.addEventListener('click', () => importFile.click());
      importFile.addEventListener('change', (e) => this.handleImportData(e));
    }
  }

  setupProfileListeners() {
    // Listen for profile changes
    modernProfileService.onProfileChange((profile) => {
      this.updateProfileUI(profile);
    });
  }

  updateProfileUI(profile) {
    console.log('🎨 Updating profile UI:', profile ? 'authenticated' : 'guest');

    if (profile) {
      this.showAuthenticatedState(profile);
    } else {
      this.showGuestState();
    }
  }

  showGuestState() {
    if (this.elements.guest) {
      this.elements.guest.style.display = 'flex';
    }
    if (this.elements.authenticated) {
      this.elements.authenticated.style.display = 'none';
    }
    this.closeDropdown();
  }

  showAuthenticatedState(profile) {
    if (this.elements.guest) {
      this.elements.guest.style.display = 'none';
    }
    if (this.elements.authenticated) {
      this.elements.authenticated.style.display = 'flex';
    }

    this.updateUserInfo(profile);
  }

  updateUserInfo(profile) {
    const displayName = profile.display_name || profile.email.split('@')[0];
    const email = profile.email;

    if (this.elements.profileName) {
      this.elements.profileName.textContent = displayName;
    }
    if (this.elements.displayName) {
      this.elements.displayName.textContent = displayName;
    }
    if (this.elements.email) {
      this.elements.email.textContent = email;
    }

    // Update avatar
    this.updateAvatar(profile);

    console.log(`👤 Profile updated: ${displayName} (${email})`);
  }

  updateAvatar(profile) {
    // Avatar update removed - using modern profile system
  }

  toggleDropdown() {
    if (this.dropdownOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    // Dropdown functionality removed - using modern profile system
  }

  closeDropdown() {
    // Dropdown functionality removed - using modern profile system
  }

  // Modal management
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
      this.currentModal = modalId;
      document.body.style.overflow = 'hidden';
    }
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      if (this.currentModal === modalId) {
        this.currentModal = null;
      }
      document.body.style.overflow = '';
    }
  }

  showAuthModal() {
    this.showModal('authModal');
    this.setAuthMode('signin');
  }

  showProfileModal() {
    this.showModal('profileModal');
    this.populateProfileForm();
  }

  showSettingsModal() {
    this.showModal('settingsModal');
    this.populateSettingsForm();
  }

  showFavoritesModal() {
    this.showModal('favoritesModal');
    this.loadFavorites();
  }

  showHelpModal() {
    this.showModal('helpModal');
  }

  // Auth modal methods
  setAuthMode(mode) {
    const modal = this.elements.authModal;
    if (!modal) return;

    const title = modal.querySelector('#authModalTitle');
    const subtitle = modal.querySelector('#authModalSubtitle');
    const submitText = modal.querySelector('#authSubmitText');
    const toggleText = modal.querySelector('#authToggleText');
    const toggleBtn = modal.querySelector('#authToggleBtn');
    const form = modal.querySelector('#authForm');

    if (mode === 'signin') {
      title.textContent = 'Sign In';
      subtitle.textContent = 'Welcome to TagYou!';
      submitText.textContent = 'Sign In';
      toggleText.textContent = "Don't have an account? ";
      toggleBtn.textContent = 'Sign Up';
      form.dataset.mode = 'signin';
    } else {
      title.textContent = 'Sign Up';
      subtitle.textContent = 'Create your TagYou account';
      submitText.textContent = 'Sign Up';
      toggleText.textContent = 'Already have an account? ';
      toggleBtn.textContent = 'Sign In';
      form.dataset.mode = 'signup';
    }
  }

  toggleAuthMode() {
    console.log('🔄 Toggling auth mode...');
    const form = this.elements.authModal?.querySelector('#authForm');
    if (!form) {
      console.error('❌ Auth form not found');
      return;
    }

    const currentMode = form.dataset.mode;
    const newMode = currentMode === 'signin' ? 'signup' : 'signin';
    console.log(`🔄 Switching from ${currentMode} to ${newMode}`);
    this.setAuthMode(newMode);
  }

  async handleAuthSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const mode = form.dataset.mode;
    const email = form.querySelector('#authEmail').value;
    const password = form.querySelector('#authPassword').value;
    const submitBtn = form.querySelector('#authSubmitBtn');
    const submitText = submitBtn.querySelector('#authSubmitText');

    // Show loading state
    submitBtn.disabled = true;
    submitText.textContent = mode === 'signin' ? 'Signing In...' : 'Signing Up...';

    try {
      if (mode === 'signin') {
        await supabaseAuthService.signIn(email, password);
        this.hideModal('authModal');
        this.showSuccessMessage('Successfully signed in!');
      } else {
        await supabaseAuthService.signUp(email, password);
        this.showSuccessMessage('Account created! Please check your email to verify your account.');
      }
    } catch (error) {
      this.showErrorMessage(error.message);
    } finally {
      submitBtn.disabled = false;
      submitText.textContent = mode === 'signin' ? 'Sign In' : 'Sign Up';
    }
  }

  async handleForgotPassword() {
    console.log('🔑 Handling forgot password...');
    const email = this.elements.authModal?.querySelector('#authEmail').value;
    if (!email) {
      this.showErrorMessage('Please enter your email address first.');
      return;
    }

    try {
      console.log('🔑 Sending password reset email to:', email);
      await supabaseAuthService.resetPassword(email);
      this.showSuccessMessage('Password reset email sent! Please check your inbox.');
    } catch (error) {
      console.error('❌ Password reset error:', error);
      this.showErrorMessage(error.message);
    }
  }

  // Profile modal methods
  populateProfileForm() {
    const profile = modernProfileService.getCurrentProfile();
    if (!profile) return;

    const form = this.elements.profileModal?.querySelector('#profileForm');
    if (!form) return;

    form.querySelector('#profileDisplayName').value = profile.display_name || '';
    form.querySelector('#profileBio').value = profile.bio || '';
    form.querySelector('#profileLocation').value = profile.location || '';
    form.querySelector('#profileWebsite').value = profile.website || '';
    form.querySelector('#profilePhone').value = profile.phone || '';

    // Update avatar preview
    this.updateAvatarPreview(profile);
  }

  updateAvatarPreview(profile) {
    const preview = this.elements.profileModal?.querySelector('#avatarPreview');
    if (!preview) return;

    const avatar = modernProfileService.getUserAvatar(profile);
    const initials = modernProfileService.getUserInitials(profile);

    if (avatar && avatar.startsWith('http')) {
      preview.innerHTML = `<img src="${avatar}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    } else {
      preview.innerHTML = `<span>${initials}</span>`;
    }
  }

  async handleProfileSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
      const updates = {
        display_name: form.querySelector('#profileDisplayName').value,
        bio: form.querySelector('#profileBio').value,
        location: form.querySelector('#profileLocation').value,
        website: form.querySelector('#profileWebsite').value,
        phone: form.querySelector('#profilePhone').value
      };

      await modernProfileService.updateProfile(updates);
      this.hideModal('profileModal');
      this.showSuccessMessage('Profile updated successfully!');
    } catch (error) {
      this.showErrorMessage(error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  async handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await modernProfileService.uploadAvatar(file);
      const profile = modernProfileService.getCurrentProfile();
      this.updateAvatarPreview(profile);
      this.showSuccessMessage('Avatar updated successfully!');
    } catch (error) {
      this.showErrorMessage('Failed to upload avatar: ' + error.message);
    }
  }

  // Settings modal methods
  populateSettingsForm() {
    const profile = modernProfileService.getCurrentProfile();
    if (!profile) return;

    const modal = this.elements.settingsModal;
    if (!modal) return;

    // Set toggle states
    modal.querySelector('#emailNotifications').checked = profile.preferences?.notifications?.email ?? true;
    modal.querySelector('#pushNotifications').checked = profile.preferences?.notifications?.push ?? true;
    modal.querySelector('#profileVisible').checked = profile.preferences?.privacy?.profile_visible ?? true;
    modal.querySelector('#locationVisible').checked = profile.preferences?.privacy?.location_visible ?? true;
    modal.querySelector('#darkMode').checked = profile.settings?.dark_mode ?? false;
  }

  async handleSettingChange(e) {
    const setting = e.target.id;
    const value = e.target.checked;

    try {
      if (setting === 'emailNotifications' || setting === 'pushNotifications') {
        await modernProfileService.updatePreferences({
          notifications: {
            [setting.replace('Notifications', '').toLowerCase()]: value
          }
        });
      } else if (setting === 'profileVisible' || setting === 'locationVisible') {
        await modernProfileService.updatePreferences({
          privacy: {
            [setting.replace('Visible', '').toLowerCase() + '_visible']: value
          }
        });
      } else if (setting === 'darkMode') {
        await modernProfileService.updateSettings({
          dark_mode: value
        });
        this.applyTheme(value);
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      // Revert the toggle
      e.target.checked = !value;
    }
  }

  applyTheme(isDark) {
    document.body.classList.toggle('dark-theme', isDark);
  }

  async handleExportData() {
    try {
      modernProfileService.exportProfileData();
      this.showSuccessMessage('Profile data exported successfully!');
    } catch (error) {
      this.showErrorMessage('Failed to export data: ' + error.message);
    }
  }

  async handleImportData(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await modernProfileService.importProfileData(file);
      this.showSuccessMessage('Profile data imported successfully!');
      this.populateSettingsForm();
    } catch (error) {
      this.showErrorMessage('Failed to import data: ' + error.message);
    }
  }

  // Favorites modal methods
  loadFavorites() {
    // TODO: Implement favorites loading from Supabase
    console.log('Loading favorites...');
  }

  // Sign out
  async handleSignOut() {
    try {
      await supabaseAuthService.signOut();
      this.closeDropdown();
      this.showSuccessMessage('Successfully signed out!');
    } catch (error) {
      this.showErrorMessage('Sign out failed: ' + error.message);
    }
  }

  // Message display
  showSuccessMessage(message) {
    this.showMessage(message, 'success');
  }

  showErrorMessage(message) {
    this.showMessage(message, 'error');
  }

  showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.auth-message');
    existingMessages.forEach(msg => msg.remove());

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message auth-${type}`;
    messageDiv.textContent = message;

    // Add to current modal or body
    const target = this.currentModal ? document.getElementById(this.currentModal) : document.body;
    if (target) {
      target.appendChild(messageDiv);
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }
}

// Create and export singleton instance
export const modernProfileUI = new ModernProfileUI();

// Export the class for testing
export { ModernProfileUI };
