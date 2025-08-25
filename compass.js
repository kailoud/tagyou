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

    console.log('🧭 Compass created successfully');
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
    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', (event) => {
        this.updateCompass(event.alpha);
      });
    } else {
      console.log('🧭 Device orientation not supported, using mock compass');
      this.startMockCompass();
    }
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
    }
  }

  // Mock compass for testing (when device orientation not available)
  startMockCompass() {
    let mockRotation = 0;
    setInterval(() => {
      mockRotation += 1;
      if (mockRotation >= 360) mockRotation = 0;
      this.rotation = mockRotation;
      this.rotateCompass();
    }, 100);
  }

  // Toggle compass visibility
  toggleCompass() {
    this.isVisible = !this.isVisible;
    const compassContainer = document.querySelector('.compass-container');
    if (compassContainer) {
      compassContainer.style.display = this.isVisible ? 'block' : 'none';
    }
    console.log('🧭 Compass visibility:', this.isVisible ? 'visible' : 'hidden');
  }

  // Show compass
  show() {
    this.isVisible = true;
    const compassContainer = document.querySelector('.compass-container');
    if (compassContainer) {
      compassContainer.style.display = 'block';
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
