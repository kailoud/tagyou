// 🧭 TagYou Compass Component
// Shows north direction and compass orientation

class Compass {
  constructor() {
    this.rotation = 0;
    this.isVisible = false;
    this.init();
  }

  init() {
    this.createCompass();
    this.setupEventListeners();
    this.startCompassUpdates();
  }

  // Create compass element
  createCompass() {
    console.log('🧭 Creating compass...');

    const compassContainer = document.createElement('div');
    compassContainer.className = 'compass-container';
    compassContainer.innerHTML = this.getCompassHTML();

    // Insert into body
    document.body.appendChild(compassContainer);

    // Start hidden by default
    compassContainer.style.display = 'none';

    // Initialize to point north
    this.resetToNorth();

    console.log('🧭 Compass created successfully and pointing north');
  }

  // Get compass HTML
  getCompassHTML() {
    return `
      <div class="compass-wrapper">
        <div class="compass-rose" id="compassRose">
          <div class="compass-needle">
            <div class="needle-north"></div>
            <div class="needle-south"></div>
          </div>
          <div class="compass-markings">
            <div class="marking-north">N</div>
            <div class="marking-east">E</div>
            <div class="marking-south">S</div>
            <div class="marking-west">W</div>
          </div>
        </div>
        <div class="compass-label">North</div>
      </div>
    `;
  }

  // Setup event listeners
  setupEventListeners() {
    // Toggle compass visibility
    document.addEventListener('click', (e) => {
      if (e.target.closest('.compass-container')) {
        this.toggleCompass();
      }
    });

    // Listen for compass toggle from other components
    document.addEventListener('toggleCompass', () => {
      this.toggleCompass();
    });
  }

  // Start compass updates
  startCompassUpdates() {
    // Fixed scale compass - no device orientation updates
    console.log('🧭 Using fixed scale compass');
    this.resetToNorth();
  }

  // Update compass rotation
  updateCompass(alpha) {
    if (alpha !== null) {
      this.rotation = alpha;
      this.rotateCompass();
    }
  }

  // Rotate compass needle
  rotateCompass() {
    const compassRose = document.getElementById('compassRose');
    if (compassRose) {
      compassRose.style.transform = `rotate(${this.rotation}deg)`;
      console.log('🧭 Rotating compass to:', this.rotation + '°');
    } else {
      console.log('🧭 Warning: Compass rose element not found');
    }
  }

  // Fixed scale compass - no rotation updates
  // The compass maintains a fixed north orientation

  // Toggle compass visibility
  toggleCompass() {
    this.isVisible = !this.isVisible;
    const compassContainer = document.querySelector('.compass-container');
    if (compassContainer) {
      compassContainer.style.display = this.isVisible ? 'block' : 'none';

      // Reset to north when opening
      if (this.isVisible) {
        this.resetToNorth();
      }
    }
    console.log('🧭 Compass visibility:', this.isVisible ? 'visible' : 'hidden');
  }

  // Show compass
  show() {
    this.isVisible = true;
    const compassContainer = document.querySelector('.compass-container');
    if (compassContainer) {
      compassContainer.style.display = 'block';
      // Reset to north when showing
      this.resetToNorth();
    }
  }

  // Hide compass
  hide() {
    this.isVisible = false;
    const compassContainer = document.querySelector('.compass-container');
    if (compassContainer) {
      compassContainer.style.display = 'none';
    }
  }

  // Get current rotation
  getRotation() {
    return this.rotation;
  }

  // Reset compass to point north (fixed scale)
  resetToNorth() {
    this.rotation = 0;
    this.rotateCompass();
    console.log('🧭 Fixed scale compass pointing north (0°)');

    // Verify the rotation was applied
    const compassRose = document.getElementById('compassRose');
    if (compassRose) {
      console.log('🧭 Compass rotation applied:', compassRose.style.transform);
    }
  }

  // Get cardinal direction
  getCardinalDirection() {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(this.rotation / 45) % 8;
    return directions[index];
  }
}

// Initialize compass
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.compass = new Compass();
    console.log('🧭 Compass initialized');
  }, 100);
});
