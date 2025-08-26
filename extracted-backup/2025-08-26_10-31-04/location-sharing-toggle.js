// 📍 TagYou Location Sharing Toggle
// Handles location sharing with groups via toggle switch

class LocationSharingToggle {
  constructor() {
    this.isSharing = false;
    this.currentUser = null;
    this.init();
  }

  init() {
    this.createToggle();
    this.setupEventListeners();
    this.syncWithAvatarSystem();
    this.loadSharingState();
  }

  // Create location sharing toggle
  createToggle() {
    console.log('📍 Creating location sharing toggle...');

    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'location-sharing-toggle';
    toggleContainer.innerHTML = this.getToggleHTML();

    // Insert after avatar container
    const avatarContainer = document.querySelector('.avatar-container');
    if (avatarContainer) {
      console.log('✅ Found avatar container, inserting toggle after it');
      avatarContainer.parentNode.insertBefore(toggleContainer, avatarContainer.nextSibling);
    } else {
      console.log('⚠️ Avatar container not found, appending to body');
      document.body.appendChild(toggleContainer);
    }

    console.log('📍 Location sharing toggle created successfully');
  }

  // Get toggle HTML
  getToggleHTML() {
    return `
      <button class="toggle-switch ${this.isSharing ? 'enabled' : 'disabled'}" 
              role="switch" 
              aria-checked="${this.isSharing}" 
              title="${this.isSharing ? 'Turn off location sharing' : 'Turn on location sharing'}">
        <span class="toggle-thumb"></span>
      </button>
    `;
  }

  // Setup event listeners
  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.toggle-switch')) {
        this.toggleSharing();
      }
    });

    // Listen for user authentication changes
    document.addEventListener('userAuthenticated', (e) => {
      this.onUserAuthenticated(e.detail.user);
    });

    // Listen for user sign out
    document.addEventListener('userSignedOut', () => {
      this.onUserSignedOut();
    });
  }

  // Toggle location sharing
  async toggleSharing() {
    console.log('📍 Toggle sharing clicked');
    console.log('📍 Current user:', this.currentUser);
    console.log('📍 Avatar system user:', window.avatarSystem?.user);

    // Check if user is authenticated
    if (!this.currentUser) {
      // Try to get user from avatar system
      const avatarUser = window.avatarSystem?.user;
      if (avatarUser) {
        console.log('📍 Found user in avatar system, updating current user');
        this.currentUser = avatarUser;
      } else {
        console.log('📍 No user found, showing auth required message');
        this.showAuthRequiredMessage();
        return;
      }
    }

    try {
      if (this.isSharing) {
        await this.stopSharing();
      } else {
        await this.startSharing();
      }
    } catch (error) {
      console.error('Error toggling location sharing:', error);
      this.showErrorMessage('Failed to update location sharing');
    }
  }

  // Start sharing location
  async startSharing() {
    console.log('📍 Starting location sharing...');

    // Request location permission
    const permission = await this.requestLocationPermission();
    if (!permission) {
      this.showErrorMessage('Location permission denied');
      return;
    }

    // Get current location
    const position = await this.getCurrentPosition();
    if (!position) {
      this.showErrorMessage('Unable to get your location');
      return;
    }

    // Update sharing state
    this.isSharing = true;
    this.updateToggleUI();
    this.saveSharingState();

    // Send location to server/update carnival tracker
    this.updateLocationInTracker(position);

    // Show success message
    this.showSuccessMessage('Location sharing enabled');

    console.log('📍 Location sharing started successfully');
  }

  // Stop sharing location
  async stopSharing() {
    console.log('📍 Stopping location sharing...');

    // Update sharing state
    this.isSharing = false;
    this.updateToggleUI();
    this.saveSharingState();

    // Update carnival tracker
    this.updateLocationInTracker(null);

    // Show success message
    this.showSuccessMessage('Location sharing disabled');

    console.log('📍 Location sharing stopped successfully');
  }

  // Request location permission
  async requestLocationPermission() {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return false;
    }

    try {
      // Check if permission is already granted
      const permission = await navigator.permissions.query({ name: 'geolocation' });

      if (permission.state === 'granted') {
        return true;
      } else if (permission.state === 'denied') {
        return false;
      } else {
        // Request permission by trying to get location
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            () => resolve(false),
            { timeout: 5000 }
          );
        });
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  // Get current position
  async getCurrentPosition() {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          console.error('Error getting position:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Update toggle UI
  updateToggleUI() {
    const toggleContainer = document.querySelector('.location-sharing-toggle');
    if (toggleContainer) {
      toggleContainer.innerHTML = this.getToggleHTML();
    }
  }

  // Update location in carnival tracker
  updateLocationInTracker(position) {
    if (window.carnivalTracker) {
      if (position) {
        // Add or update user location in carnival tracker
        window.carnivalTracker.updateUserLocation(position);
      } else {
        // Remove user location from carnival tracker
        window.carnivalTracker.removeUserLocation();
      }
    }
  }

  // Save sharing state
  saveSharingState() {
    if (this.currentUser) {
      localStorage.setItem(`location_sharing_${this.currentUser.email}`, this.isSharing.toString());
    }
  }

  // Load sharing state
  loadSharingState() {
    if (this.currentUser) {
      const savedState = localStorage.getItem(`location_sharing_${this.currentUser.email}`);
      if (savedState !== null) {
        this.isSharing = savedState === 'true';
        this.updateToggleUI();
      }
    }
  }

  // Handle user authentication
  onUserAuthenticated(user) {
    console.log('📍 User authenticated, updating location sharing toggle');
    this.currentUser = user;
    this.loadSharingState();
    this.updateToggleUI();
  }

  // Handle user sign out
  onUserSignedOut() {
    console.log('📍 User signed out, resetting location sharing toggle');
    this.currentUser = null;
    this.isSharing = false;
    this.updateToggleUI();
  }

  // Show authentication required message
  showAuthRequiredMessage() {
    this.showErrorMessage('Please sign in to share your location');
  }

  // Show success message
  showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'location-toggle-success';
    successDiv.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(successDiv);

    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }

  // Show error message
  showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'location-toggle-error';
    errorDiv.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }

  // Get current sharing state
  getSharingState() {
    return {
      isSharing: this.isSharing,
      user: this.currentUser
    };
  }

  // Force update UI
  forceUpdate() {
    this.updateToggleUI();
  }

  // Sync with avatar system
  syncWithAvatarSystem() {
    console.log('📍 Syncing with avatar system...');
    const avatarUser = window.avatarSystem?.user;
    if (avatarUser) {
      console.log('📍 Found user in avatar system:', avatarUser.email);
      this.currentUser = avatarUser;
      this.loadSharingState();
      this.updateToggleUI();
    } else {
      console.log('📍 No user found in avatar system');
    }
  }
}

// Initialize location sharing toggle
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.locationSharingToggle = new LocationSharingToggle();
    console.log('📍 Location sharing toggle initialized');

    // Additional sync after initialization
    setTimeout(() => {
      if (window.locationSharingToggle) {
        window.locationSharingToggle.syncWithAvatarSystem();
      }
    }, 500);
  }, 100);
});
