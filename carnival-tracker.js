class CarnivalTracker {
  constructor() {
    this.people = [
      {
        id: 1,
        name: "Sarah Johnson",
        phone: "(020) 7123-4567",
        relationship: "Friend",
        attending: true,
        location: { area: "Ladbroke Grove Station", street: "Ladbroke Grove", postcodeArea: "W10" },
        lastUpdate: new Date(Date.now() - 120000),
        isSharing: true,
        notes: "Near sound system truck",
        avatar: {
          bgColor: "bg-pink-500",
          initials: "SJ",
          imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face"
        }
      },
      {
        id: 2,
        name: "Mike Davis",
        phone: "(020) 8987-6543",
        relationship: "Family",
        attending: true,
        location: { area: "Westbourne Park", street: "Westbourne Park Road", postcodeArea: "W2" },
        lastUpdate: new Date(Date.now() - 300000),
        isSharing: true,
        notes: "Food stalls area",
        avatar: {
          bgColor: "bg-blue-500",
          initials: "MD",
          imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
        }
      },
      {
        id: 3,
        name: "Emma Wilson",
        phone: "(020) 7456-7890",
        relationship: "Family",
        attending: true,
        location: { area: "Portobello Road", street: "Portobello Road", postcodeArea: "W11" },
        lastUpdate: new Date(Date.now() - 60000),
        isSharing: true,
        notes: "Main parade route",
        avatar: {
          bgColor: "bg-purple-500",
          initials: "EW",
          imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
        }
      }
    ];

    this.isVisible = false;
    this.activeTab = "tracker";
    this.searchTerm = "";
    this.showAddForm = false;
    this.notifications = [
      { id: 1, text: "Sarah is near Ladbroke Grove Station", time: "2 min ago", type: "location" },
      { id: 2, text: "Mike shared their location", time: "5 min ago", type: "sharing" }
    ];

    this.newPerson = {
      name: "",
      phone: "",
      relationship: "",
      attending: true,
      notes: ""
    };

    // Premium features
    this.isPremium = false; // Back to free mode
    this.maxFreeMembers = 5;
    this.premiumFeatures = {
      unlimitedMembers: true,
      realTimeGPS: true,
      locationHistory: true,
      customThemes: true,
      voiceMessages: true,
      emergencyAlerts: true,
      analytics: true,
      prioritySupport: true
    };

    // Notting Hill Carnival specific areas
    this.carnivalAreas = [
      "Ladbroke Grove Station", "Westbourne Park", "Portobello Road",
      "All Saints Road", "Golborne Road", "Kensal Road",
      "Oxford Gardens", "Blenheim Crescent", "Elgin Avenue"
    ];

    this.relationships = ["Family", "Friend", "Partner", "Child", "Colleague"];

    this.init();
  }

  init() {
    this.createTrackerElement();
    this.setupEventListeners();
    this.updateToolbarCount();
  }

  createTrackerElement() {
    // Create the main tracker container
    this.trackerElement = document.createElement('div');
    this.trackerElement.id = 'carnival-tracker';
    this.trackerElement.className = 'carnival-tracker';

    // Add to the page
    document.body.appendChild(this.trackerElement);

    // Start hidden by default
    this.trackerElement.style.display = 'none';
  }

  setupEventListeners() {
    // Event delegation for dynamic elements
    this.trackerElement.addEventListener('click', (e) => {
      // Close button
      if (e.target.closest('.close-btn')) {
        this.hide();
      }

      // Add person button
      if (e.target.closest('.add-person-btn')) {
        this.showAddForm = true;
        this.render();
      }

      // Close add form
      if (e.target.closest('.close-add-form')) {
        this.showAddForm = false;
        this.render();
      }

      // Tab buttons
      if (e.target.closest('.tab-btn')) {
        const tab = e.target.closest('.tab-btn').dataset.tab;
        this.activeTab = tab;
        this.render();
      }

      // Request location sharing
      if (e.target.closest('.request-location-btn')) {
        const personId = parseInt(e.target.closest('.request-location-btn').dataset.personId);
        this.requestLocationSharing(personId);
      }

      // Phone button - show call/WhatsApp options
      if (e.target.closest('.phone-btn')) {
        const button = e.target.closest('.phone-btn');
        const phoneNumber = button.dataset.phone;
        const personName = button.dataset.name;
        this.showPhoneOptions(phoneNumber, personName);
      }

      // WhatsApp button
      if (e.target.closest('.whatsapp-btn')) {
        const button = e.target.closest('.whatsapp-btn');
        const phoneNumber = button.dataset.phone;
        const personName = button.dataset.name;
        this.openWhatsApp(phoneNumber, personName);
      }

      // Add person form submit
      if (e.target.closest('.add-person-submit')) {
        e.preventDefault();
        this.addPerson();
      }
    });

    // Search input
    this.trackerElement.addEventListener('input', (e) => {
      if (e.target.matches('.search-input')) {
        this.searchTerm = e.target.value;
        this.render();
      }
    });

    // Add person form inputs
    this.trackerElement.addEventListener('input', (e) => {
      if (e.target.matches('.add-person-input')) {
        const field = e.target.dataset.field;
        this.newPerson[field] = e.target.value;
      }
    });
  }

  generateAvatar(name) {
    const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500"];
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    const colorIndex = name.length % colors.length;

    return {
      bgColor: colors[colorIndex],
      initials: initials.slice(0, 2)
    };
  }

  getLocationStatus(person) {
    if (!person.isSharing) return { status: "offline", color: "text-gray-400", bgColor: "bg-gray-400" };
    const minutesSinceUpdate = Math.floor((new Date() - person.lastUpdate) / 60000);
    if (minutesSinceUpdate < 3) return { status: "live", color: "text-green-500", bgColor: "bg-green-500" };
    if (minutesSinceUpdate < 10) return { status: "recent", color: "text-yellow-500", bgColor: "bg-yellow-500" };
    return { status: "outdated", color: "text-red-500", bgColor: "bg-red-500" };
  }

  getTimeSince(timestamp) {
    const minutes = Math.floor((new Date() - timestamp) / 60000);
    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  }

  addPerson() {
    if (this.newPerson.name && this.newPerson.phone && this.newPerson.relationship) {
      // Check if user can add more people
      if (!this.isPremium && this.people.length >= this.maxFreeMembers) {
        this.showPremiumUpgrade();
        return;
      }

      const avatar = this.generateAvatar(this.newPerson.name);
      this.people.push({
        ...this.newPerson,
        id: Date.now(),
        lastUpdate: new Date(),
        isSharing: false,
        location: null,
        avatar
      });
      this.newPerson = { name: "", phone: "", relationship: "", attending: true, notes: "" };
      this.showAddForm = false;
      this.render();
      this.updateToolbarCount();
    }
  }

  showPremiumUpgrade() {
    const modal = document.createElement('div');
    modal.className = 'premium-upgrade-modal';
    modal.innerHTML = `
      <div class="premium-upgrade-overlay">
        <div class="premium-upgrade-content">
          <div class="premium-upgrade-header">
            <div class="premium-badge">💎</div>
            <h2>Upgrade to Premium</h2>
            <p>Unlock unlimited squad members and advanced features</p>
          </div>
          
          <div class="premium-features">
            <div class="feature-item">
              <i class="fas fa-users"></i>
              <span>Unlimited squad members</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>Real-time GPS tracking</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-history"></i>
              <span>30-day location history</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-palette"></i>
              <span>Custom themes & badges</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-microphone"></i>
              <span>Voice messages</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-exclamation-triangle"></i>
              <span>Emergency alerts</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-chart-line"></i>
              <span>Advanced analytics</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-headset"></i>
              <span>Priority support</span>
            </div>
          </div>
          
          <div class="premium-pricing">
            <div class="price">£9.99</div>
            <div class="period">per month</div>
            <div class="trial">7-day free trial • Cancel anytime</div>
          </div>
          
          <div class="premium-actions">
            <button class="upgrade-btn" onclick="window.carnivalTracker.upgradeToPremium()">
              <i class="fas fa-crown"></i>
              Start Free Trial
            </button>
            <button class="close-premium-btn" onclick="this.closest('.premium-upgrade-modal').remove()">
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  upgradeToPremium() {
    // Here you would integrate with your payment processor (Stripe, PayPal, etc.)
    console.log('💎 Upgrading to Premium...');

    // Create Stripe checkout session
    this.createStripeCheckoutSession();
  }

  async createStripeCheckoutSession() {
    try {
      // Show loading state
      this.showPaymentLoading();

      // Create checkout session with your backend
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'price_premium_monthly', // Your Stripe price ID
          successUrl: window.location.origin + '/success',
          cancelUrl: window.location.origin + '/cancel',
          metadata: {
            userId: this.getCurrentUserId(),
            feature: 'carnival-tracker-premium'
          }
        })
      });

      const session = await response.json();

      if (session.url) {
        // Redirect to Stripe Checkout
        window.location.href = session.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      this.showPaymentError();
    }
  }

  showPaymentLoading() {
    // Remove existing modal
    const modal = document.querySelector('.premium-upgrade-modal');
    if (modal) {
      modal.remove();
    }

    // Show loading modal
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'premium-upgrade-modal';
    loadingDiv.innerHTML = `
      <div class="premium-upgrade-overlay">
        <div class="premium-upgrade-content">
          <div class="premium-upgrade-header">
            <h3>💳 Processing Payment</h3>
            <div class="close-premium-upgrade">×</div>
          </div>
          <div class="premium-upgrade-body">
            <div class="payment-loading">
              <div class="spinner"></div>
              <p>Redirecting to secure payment...</p>
              <p class="payment-note">You'll be redirected to Stripe for secure payment processing</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(loadingDiv);

    // Auto-close after 3 seconds if something goes wrong
    setTimeout(() => {
      if (document.querySelector('.premium-upgrade-modal')) {
        loadingDiv.remove();
        this.showPaymentError();
      }
    }, 3000);
  }

  showPaymentError() {
    // Remove loading modal
    const modal = document.querySelector('.premium-upgrade-modal');
    if (modal) {
      modal.remove();
    }

    // Show error modal
    const errorDiv = document.createElement('div');
    errorDiv.className = 'premium-upgrade-modal';
    errorDiv.innerHTML = `
      <div class="premium-upgrade-overlay">
        <div class="premium-upgrade-content">
          <div class="premium-upgrade-header">
            <h3>❌ Payment Error</h3>
            <div class="close-premium-upgrade">×</div>
          </div>
          <div class="premium-upgrade-body">
            <div class="payment-error">
              <p>Sorry, we couldn't process your payment right now.</p>
              <p>Please try again or contact support.</p>
              <div class="payment-error-actions">
                <button class="retry-payment-btn">🔄 Try Again</button>
                <button class="contact-support-btn">📧 Contact Support</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(errorDiv);

    // Add event listeners
    errorDiv.querySelector('.close-premium-upgrade').addEventListener('click', () => {
      errorDiv.remove();
    });

    errorDiv.querySelector('.retry-payment-btn').addEventListener('click', () => {
      errorDiv.remove();
      this.upgradeToPremium();
    });

    errorDiv.querySelector('.contact-support-btn').addEventListener('click', () => {
      window.open('mailto:support@tagyou.app?subject=Premium Payment Issue', '_blank');
      errorDiv.remove();
    });
  }

  getCurrentUserId() {
    // Get current user ID from your auth system
    return window.currentUser?.id || 'anonymous';
  }

  showPremiumSuccess() {
    const successDiv = document.createElement('div');
    successDiv.className = 'premium-success';
    successDiv.innerHTML = `
      <div class="success-content">
        <i class="fas fa-crown"></i>
        <h3>Welcome to Premium!</h3>
        <p>All premium features are now unlocked</p>
      </div>
    `;

    document.body.appendChild(successDiv);

    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }

  requestLocationSharing(personId) {
    this.people = this.people.map(person =>
      person.id === personId
        ? {
          ...person,
          isSharing: true,
          lastUpdate: new Date(),
          location: {
            area: this.carnivalAreas[Math.floor(Math.random() * this.carnivalAreas.length)],
            street: "Unknown Street",
            postcodeArea: "W10"
          }
        }
        : person
    );
    this.render();
    this.updateToolbarCount();
  }

  getFilteredPeople() {
    return this.people.filter(person =>
      person.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      person.phone.includes(this.searchTerm) ||
      (person.location?.area && person.location.area.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  updateToolbarCount() {
    const trackerCount = document.getElementById('trackerCount');
    if (trackerCount) {
      const sharingCount = this.people.filter(p => p.isSharing).length;
      trackerCount.textContent = sharingCount;
    }
  }

  render() {
    if (!this.isVisible) {
      this.trackerElement.style.display = 'none';
      return;
    }

    this.trackerElement.style.display = 'block';
    this.renderFull();

    if (this.showAddForm) {
      this.renderAddForm();
    }
  }

  renderFull() {
    const filteredPeople = this.getFilteredPeople();

    this.trackerElement.innerHTML = `
      <div class="carnival-tracker-full">
        <!-- Header -->
        <div class="tracker-header">
          <div class="tracker-title">
            <i class="fas fa-users"></i>
            <div>
              <h3>Carnival Squad ${this.isPremium ? '<span class="premium-indicator">💎</span>' : ''}</h3>
              <p>${this.people.filter(p => p.isSharing).length} sharing location ${!this.isPremium ? `(${this.people.length}/${this.maxFreeMembers})` : ''}</p>
            </div>
          </div>
          
          <div class="tracker-actions">
            ${!this.isPremium ? `
              <button class="premium-upgrade-btn" title="Upgrade to Premium" onclick="window.carnivalTracker.showPremiumUpgrade()">
                <i class="fas fa-crown"></i>
              </button>
            ` : ''}
            <button class="add-person-btn" title="Add Person">
              <i class="fas fa-plus"></i>
            </button>
            <button class="close-btn" title="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="tracker-tabs">
          <button class="tab-btn ${this.activeTab === 'tracker' ? 'active' : ''}" data-tab="tracker">
            Track (${this.people.length})${!this.isPremium ? `/${this.maxFreeMembers}` : ''}
          </button>
          <button class="tab-btn ${this.activeTab === 'notifications' ? 'active' : ''}" data-tab="notifications">
            Updates
            ${this.notifications.length > 0 ? `<span class="notification-badge">${this.notifications.length}</span>` : ''}
          </button>
          ${this.isPremium ? `
            <button class="tab-btn ${this.activeTab === 'analytics' ? 'active' : ''}" data-tab="analytics">
              <i class="fas fa-chart-line"></i> Analytics
            </button>
          ` : ''}
        </div>

        <!-- Content -->
        <div class="tracker-content">
          ${this.activeTab === 'tracker' ? this.renderTrackerTab(filteredPeople) :
        this.activeTab === 'notifications' ? this.renderNotificationsTab() :
          this.activeTab === 'analytics' ? this.renderAnalyticsTab() : ''}
        </div>
      </div>
    `;
  }

  renderTrackerTab(filteredPeople) {
    return `
      <div class="tracker-tab-content">
        <!-- Search -->
        <div class="tracker-search">
          <i class="fas fa-search"></i>
          <input type="text" class="search-input" placeholder="Search by name or location..." value="${this.searchTerm}">
        </div>

        <!-- People List -->
        <div class="people-list">
          ${filteredPeople.map(person => this.renderPersonCard(person)).join('')}
        </div>

        ${filteredPeople.length === 0 ? `
          <div class="empty-state">
            <i class="fas fa-users"></i>
            <p>No people found</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderPersonCard(person) {
    const locationStatus = this.getLocationStatus(person);

    return `
      <div class="person-card">
        <div class="person-avatar">
          ${person.avatar.imageUrl ? `
            <img src="${person.avatar.imageUrl}" alt="${person.name}" class="avatar-image">
          ` : `
            <div class="avatar-initials ${person.avatar.bgColor}">${person.avatar.initials}</div>
          `}
          <div class="status-indicator ${locationStatus.bgColor} ${locationStatus.status === 'live' ? 'pulse' : ''}"></div>
        </div>
        
        <div class="person-info">
          <div class="person-header">
            <h4>${person.name}</h4>
            <span class="relationship-badge">${person.relationship}</span>
          </div>
          
          ${person.isSharing && person.location ? `
            <div class="person-location">
              <i class="fas fa-map-marker-alt"></i>
              <span>${person.location.area}</span>
              <span class="time-ago ${locationStatus.color}">${this.getTimeSince(person.lastUpdate)}</span>
            </div>
          ` : `
            <p class="not-sharing">Not sharing location</p>
          `}
        </div>

        <div class="person-actions">
          ${!person.isSharing ? `
            <button class="request-location-btn" data-person-id="${person.id}" title="Request location">
              <i class="fas fa-location-arrow"></i>
            </button>
          ` : `
            <div class="location-status ${locationStatus.bgColor} ${locationStatus.status === 'live' ? 'pulse' : ''}"></div>
          `}
          
          <button class="action-btn phone-btn" title="Call or WhatsApp" data-phone="${person.phone}" data-name="${person.name}">
            <i class="fas fa-phone"></i>
          </button>
          
          <button class="action-btn whatsapp-btn" title="Message on WhatsApp" data-phone="${person.phone}" data-name="${person.name}">
            <i class="fab fa-whatsapp"></i>
          </button>
        </div>
      </div>
    `;
  }

  renderNotificationsTab() {
    return `
      <div class="notifications-tab-content">
        ${this.notifications.map(notification => `
          <div class="notification-item">
            <div class="notification-indicator ${notification.type === 'location' ? 'bg-green-500' : 'bg-blue-500'}"></div>
            <div class="notification-content">
              <p>${notification.text}</p>
              <span>${notification.time}</span>
            </div>
          </div>
        `).join('')}
        
        ${this.notifications.length === 0 ? `
          <div class="empty-state">
            <i class="fas fa-bell"></i>
            <p>No new updates</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderAnalyticsTab() {
    const totalMembers = this.people.length;
    const activeMembers = this.people.filter(p => p.isSharing).length;
    const avgResponseTime = "2.3 min";
    const popularArea = "Ladbroke Grove Station";

    return `
      <div class="analytics-tab-content">
        <div class="analytics-header">
          <h3>Squad Analytics</h3>
          <p>Premium insights for your carnival squad</p>
        </div>
        
        <div class="analytics-grid">
          <div class="analytics-card">
            <div class="analytics-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="analytics-content">
              <div class="analytics-value">${totalMembers}</div>
              <div class="analytics-label">Total Members</div>
            </div>
          </div>
          
          <div class="analytics-card">
            <div class="analytics-icon">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <div class="analytics-content">
              <div class="analytics-value">${activeMembers}</div>
              <div class="analytics-label">Active Now</div>
            </div>
          </div>
          
          <div class="analytics-card">
            <div class="analytics-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="analytics-content">
              <div class="analytics-value">${avgResponseTime}</div>
              <div class="analytics-label">Avg Response</div>
            </div>
          </div>
          
          <div class="analytics-card">
            <div class="analytics-icon">
              <i class="fas fa-star"></i>
            </div>
            <div class="analytics-content">
              <div class="analytics-value">${popularArea}</div>
              <div class="analytics-label">Popular Area</div>
            </div>
          </div>
        </div>
        
        <div class="analytics-chart">
          <h4>Activity Timeline</h4>
          <div class="timeline-chart">
            <div class="timeline-bar" style="width: 75%; background: linear-gradient(90deg, #8b5cf6, #ec4899);"></div>
            <div class="timeline-labels">
              <span>9 AM</span>
              <span>12 PM</span>
              <span>3 PM</span>
              <span>6 PM</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderAddForm() {
    const modal = document.createElement('div');
    modal.className = 'add-person-modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Add to Squad</h3>
            <button class="close-add-form">×</button>
          </div>
          
          <form class="add-person-form">
            <input type="text" class="add-person-input" data-field="name" placeholder="Name" value="${this.newPerson.name}" required>
            <input type="tel" class="add-person-input" data-field="phone" placeholder="Phone Number" value="${this.newPerson.phone}" required>
            <select class="add-person-input" data-field="relationship" required>
              <option value="">Relationship</option>
              ${this.relationships.map(rel => `
                <option value="${rel}" ${this.newPerson.relationship === rel ? 'selected' : ''}>${rel}</option>
              `).join('')}
            </select>
            <button type="submit" class="add-person-submit">Add to Squad</button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Remove modal when clicking overlay or close button
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('.close-add-form')) {
        document.body.removeChild(modal);
        this.showAddForm = false;
      }
    });
  }

  openWhatsApp(phoneNumber, personName) {
    // Clean phone number (remove spaces, dashes, parentheses)
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

    // Create WhatsApp message
    let message = `Hi ${personName}! 👋`;

    // Add location if available
    const person = this.people.find(p => p.phone === phoneNumber);
    if (person && person.isSharing && person.location) {
      message += `\n\n📍 I can see you're at ${person.location.area}`;
      message += `\n🎭 How's the carnival going?`;
    } else {
      message += `\n\n🎭 How's the carnival going?`;
      message += `\n📍 Where are you at the moment?`;
    }

    message += `\n\n#NottingHillCarnival #CarnivalSquad`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    console.log(`📱 Opening WhatsApp for ${personName} (${cleanPhone})`);
  }

  showPhoneOptions(phoneNumber, personName) {
    // Remove any existing phone options modal
    const existingModal = document.querySelector('.phone-options-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'phone-options-modal';
    modal.innerHTML = `
      <div class="phone-options-overlay">
        <div class="phone-options-content">
          <div class="phone-options-header">
            <h3>Contact ${personName}</h3>
            <button class="close-phone-options">×</button>
          </div>
          
          <div class="phone-options-buttons">
            <button class="phone-option-btn call-option" data-phone="${phoneNumber}">
              <i class="fas fa-phone"></i>
              <span>Call ${personName}</span>
            </button>
            
            <button class="phone-option-btn whatsapp-option" data-phone="${phoneNumber}" data-name="${personName}">
              <i class="fab fa-whatsapp"></i>
              <span>WhatsApp ${personName}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('.close-phone-options')) {
        modal.remove();
      }

      if (e.target.closest('.call-option')) {
        const phone = e.target.closest('.call-option').dataset.phone;
        window.location.href = `tel:${phone}`;
        modal.remove();
      }

      if (e.target.closest('.whatsapp-option')) {
        const phone = e.target.closest('.whatsapp-option').dataset.phone;
        const name = e.target.closest('.whatsapp-option').dataset.name;
        this.openWhatsApp(phone, name);
        modal.remove();
      }
    });
  }

  // Public methods to show/hide the tracker
  show() {
    this.isVisible = true;
    this.render();
    console.log('🎭 Carnival tracker shown');
  }

  hide() {
    this.isVisible = false;
    this.render();
    console.log('🎭 Carnival tracker hidden');
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
}

// Initialize the carnival tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure other components are loaded
  setTimeout(() => {
    window.carnivalTracker = new CarnivalTracker();

    // Make it globally accessible
    window.toggleCarnivalTracker = () => {
      if (window.carnivalTracker) {
        window.carnivalTracker.toggle();
      }
    };

    console.log('🎭 Carnival tracker initialized');
  }, 50); // Reduced delay for faster loading
});
