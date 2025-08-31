class CarnivalTracker {
  constructor() {
    this.people = [];

    this.isVisible = false;
    this.activeTab = "tracker";
    this.searchTerm = "";
    this.showAddForm = false;
    this.notifications = [];

    this.newPerson = {
      name: "",
      phone: "",
      relationship: "",
      attending: true,
      notes: ""
    };

    // Premium features and user tiers
    this.isPremium = false;
    this.maxFreeMembers = 1; // Reduced to 1 for non-premium
    this.userTier = 'Basic'; // 'Basic' or 'Premium'
    this.premiumFeatures = {
      unlimitedMembers: true,
      realTimeGPS: true,
      locationHistory: true,
      customThemes: true,
      voiceMessages: true,
      emergencyAlerts: true,
      analytics: true,
      prioritySupport: true,
      messaging: true,
      calling: true
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
    this.checkPremiumStatus();
  }

  async checkPremiumStatus() {
    try {
      // Get current user email
      const currentUser = window.avatarSystem?.user;
      const email = currentUser?.email || '';

      if (!email) {
        console.log('🔍 No user email found, defaulting to Basic tier');
        this.setUserTier('Basic');
        return;
      }

      // First check localStorage for premium status (for immediate updates after payment)
      const premiumStatus = localStorage.getItem(`premium_${email}`);
      if (premiumStatus === 'true') {
        console.log('💎 Premium user detected from localStorage:', email);
        this.setUserTier('Premium');
        return;
      }

      // Check Supabase for premium status
      if (window.PremiumUsersService) {
        try {
          const isPremium = await window.PremiumUsersService.isPremiumUser(email);
          if (isPremium) {
            console.log('💎 Premium user detected from Supabase:', email);
            this.setUserTier('Premium');
            // Cache in localStorage for faster future checks
            localStorage.setItem(`premium_${email}`, 'true');
            return;
          }
        } catch (error) {
          console.log('⚠️ Supabase check failed, falling back to local list:', error);
        }
      } else {
        // Wait for PremiumUsersService to be loaded
        console.log('⏳ PremiumUsersService not loaded yet, waiting...');
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts && !window.PremiumUsersService) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (window.PremiumUsersService) {
          try {
            const isPremium = await window.PremiumUsersService.isPremiumUser(email);
            if (isPremium) {
              console.log('💎 Premium user detected from Supabase (after waiting):', email);
              this.setUserTier('Premium');
              localStorage.setItem(`premium_${email}`, 'true');
              return;
            }
          } catch (error) {
            console.log('⚠️ Supabase check failed after waiting, falling back to local list:', error);
          }
        }
      }

      // Fallback to local premium emails list
      const premiumEmails = [
        'kaycheckmate@gmail.com',
        'truesliks@gmail.com',
        // Add payment emails here - these users have paid for premium
        // Add your payment email below:
        // 'your-payment-email@example.com',
        // Add more premium emails here
      ];

      if (premiumEmails.includes(email.toLowerCase())) {
        console.log('💎 Premium user detected from local list:', email);
        this.setUserTier('Premium');
        // Store in localStorage for future checks
        localStorage.setItem(`premium_${email}`, 'true');
      } else {
        console.log('📱 Basic user detected:', email);
        this.setUserTier('Basic');
      }
    } catch (error) {
      console.error('❌ Error checking premium status:', error);
      this.setUserTier('Basic');
    }
  }

  async setPremiumStatus(email, isPremium, paymentData = {}) {
    if (email) {
      // Update localStorage for immediate UI updates
      localStorage.setItem(`premium_${email}`, isPremium ? 'true' : 'false');
      console.log(`💎 Premium status set for ${email}: ${isPremium ? 'Premium' : 'Basic'}`);

      // Update Supabase if service is available
      if (window.PremiumUsersService) {
        try {
          if (isPremium) {
            await window.PremiumUsersService.addPremiumUser(email, paymentData);
            console.log('✅ Premium user added to Supabase:', email);
          } else {
            await window.PremiumUsersService.removePremiumUser(email);
            console.log('✅ Premium user removed from Supabase:', email);
          }
        } catch (error) {
          console.error('❌ Error updating Supabase:', error);
        }
      }

      // Update current user tier if email matches
      const currentUser = window.avatarSystem?.user;
      if (currentUser?.email === email) {
        this.setUserTier(isPremium ? 'Premium' : 'Basic');
      }
    }
  }

  // Global method to manually set premium status (for testing)
  static setUserPremium(email, isPremium = true) {
    console.log(`🎯 Manually setting premium status for ${email}: ${isPremium ? 'Premium' : 'Basic'}`);

    // Set in localStorage
    localStorage.setItem(`premium_${email}`, isPremium ? 'true' : 'false');

    // Update carnival tracker if available
    if (window.carnivalTracker) {
      window.carnivalTracker.setPremiumStatus(email, isPremium);
    }

    // Update avatar system if available
    if (window.avatarSystem) {
      window.avatarSystem.setPremiumStatus(email, isPremium);
    }

    console.log('✅ Premium status updated manually');
  }

  setUserTier(tier) {
    this.userTier = tier;
    this.isPremium = tier === 'Premium';

    // Update UI to reflect tier
    this.updateTierDisplay();
    this.render();

    console.log(`🎯 Carnival tracker user tier set to: ${tier}`);
    console.log(`🎯 Phone/Messaging enabled: ${this.isPremium}`);
  }

  // Sync premium status with avatar system
  syncPremiumStatus() {
    if (window.avatarSystem && window.avatarSystem.user) {
      const avatarTier = window.avatarSystem.userTier;
      const avatarIsPremium = window.avatarSystem.isPremium;

      if (avatarTier !== this.userTier || avatarIsPremium !== this.isPremium) {
        console.log(`🔄 Syncing carnival tracker with avatar system: ${avatarTier} (${avatarIsPremium})`);
        this.setUserTier(avatarTier);
      }
    }
  }

  // Force refresh premium status and update UI
  async refreshPremiumStatus() {
    console.log('🔄 Forcing carnival tracker premium status refresh...');
    await this.checkPremiumStatus();
    this.syncPremiumStatus();
    this.render();
  }

  updateTierDisplay() {
    // Update any tier indicators in the UI
    const tierIndicator = document.querySelector('.user-tier-indicator');
    if (tierIndicator) {
      tierIndicator.textContent = this.userTier;
      tierIndicator.className = `user-tier-indicator ${this.userTier.toLowerCase()}-tier`;
    }
  }

  canAddPerson() {
    if (this.isPremium) return true;
    return this.people.length < this.maxFreeMembers;
  }

  canUseMessaging() {
    return this.isPremium;
  }

  canUseCalling() {
    return this.isPremium;
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

      // Phone button - show call/WhatsApp options (only for premium users)
      if (e.target.closest('.phone-btn') && !e.target.closest('.phone-btn').classList.contains('disabled')) {
        const button = e.target.closest('.phone-btn');
        const phoneNumber = button.dataset.phone;
        const personName = button.dataset.name;
        this.showPhoneOptions(phoneNumber, personName);
      }

      // WhatsApp button (only for premium users)
      if (e.target.closest('.whatsapp-btn') && !e.target.closest('.whatsapp-btn').classList.contains('disabled')) {
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
      if (!this.canAddPerson()) {
        this.showPremiumUpgrade(`You've reached the limit of ${this.maxFreeMembers} person for Basic users. Upgrade to Pro for unlimited squad members!`);
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

  showPremiumUpgrade(customMessage = null) {
    const modal = document.createElement('div');
    modal.className = 'premium-upgrade-modal';
    modal.innerHTML = `
      <div class="premium-upgrade-overlay">
        <div class="premium-upgrade-content">
          <div class="premium-upgrade-header">
            <div class="premium-badge">💎</div>
            <h2>Upgrade to Premium</h2>
            <p>${customMessage || 'Unlock unlimited squad members and advanced features'}</p>
          </div>
          
          <div class="premium-features">
            <div class="feature-item">
              <i class="fas fa-users"></i>
              <span>Unlimited squad members</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-phone"></i>
              <span>Phone calling & messaging</span>
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
              <i class="fas fa-exclamation-triangle"></i>
              <span>Emergency alerts</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-headset"></i>
              <span>Priority support</span>
            </div>
          </div>
          
          <div class="premium-pricing">
            <div class="promotional-badge">🎉 LIMITED TIME OFFER</div>
            <div class="original-price">~~£29.97~~</div>
            <div class="price">£9.99</div>
            <div class="period">for 3 months</div>
            <div class="then-price">Then £9.99/month</div>
            <div class="savings">Save £19.98 • Cancel anytime</div>
          </div>
          
          <div class="premium-actions">
            <button class="upgrade-btn" onclick="window.carnivalTracker.upgradeToPremium()">
              <i class="fas fa-crown"></i>
              Get 3-Month Deal
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

  handleUpgradeClick() {
    // Close any existing modals first
    const existingModal = document.querySelector('.premium-upgrade-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Show the premium upgrade modal
    this.showPremiumUpgrade();
  }

  upgradeToPremium() {
    // For static site deployment, use Stripe Checkout directly
    console.log('💎 Upgrading to Pro...');

    // Create Stripe checkout session using Stripe's hosted checkout
    this.createStripeCheckoutSession();
  }

  async createStripeCheckoutSession() {
    try {
      // Show loading state
      this.showPaymentLoading();

      // Get current user info from avatar system with debugging
      console.log('🔍 Debug: window.avatarSystem exists?', !!window.avatarSystem);
      console.log('🔍 Debug: window.avatarSystem.user exists?', !!window.avatarSystem?.user);

      const currentUser = window.avatarSystem?.user;
      console.log('🔍 Debug: currentUser from avatar system:', currentUser);

      // Try multiple ways to get user email
      let email = '';
      let userId = 'anonymous';

      if (currentUser?.email) {
        email = currentUser.email;
        userId = currentUser.id || 'anonymous';
        console.log('✅ Got email from avatar system:', email);
      } else if (window.supabaseClient?.auth?.getSession) {
        try {
          const { data: { session } } = await window.supabaseClient.auth.getSession();
          if (session?.user?.email) {
            email = session.user.email;
            userId = session.user.id || 'anonymous';
            console.log('✅ Got email from Supabase session:', email);
          }
        } catch (e) {
          console.log('❌ Failed to get Supabase session:', e);
        }
      } else {
        // Try to get from localStorage or sessionStorage
        const storedUser = localStorage.getItem('tagyou_remembered_user') || sessionStorage.getItem('supabase_user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            email = parsedUser.user?.email || parsedUser.email || '';
            userId = parsedUser.user?.id || parsedUser.id || 'anonymous';
            console.log('✅ Got email from storage:', email);
          } catch (e) {
            console.log('❌ Failed to parse stored user:', e);
          }
        }
      }

      // Validate email before proceeding
      if (!email || !email.includes('@')) {
        console.error('❌ No valid email found for user after all attempts');
        console.log('🔍 Debug: Available auth data:', {
          authService: !!window.authService,
          currentUser: !!window.currentUser,
          supabase: !!window.supabase,
          localStorage: !!localStorage.getItem('currentUser'),
          sessionStorage: !!sessionStorage.getItem('currentUser')
        });
        // Show a modal asking for email manually
        this.showEmailInputModal();
        return;
      }

      // Create checkout session via API
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          email: email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      this.showPaymentError();
    }
  }

  showDemoPaymentMessage() {
    // Remove existing modal
    const modal = document.querySelector('.premium-upgrade-modal');
    if (modal) {
      modal.remove();
    }

    // Show demo message
    const demoDiv = document.createElement('div');
    demoDiv.className = 'premium-upgrade-modal';
    demoDiv.innerHTML = `
      <div class="premium-upgrade-overlay">
        <div class="premium-upgrade-content">
          <div class="premium-upgrade-header">
            <h3>💳 Payment Demo</h3>
            <div class="close-premium-upgrade">×</div>
          </div>
          <div class="premium-upgrade-body">
            <div class="payment-demo">
              <p>🎉 <strong>Premium feature demo!</strong></p>
              <p>This is a demonstration of the premium upgrade flow.</p>
              <p>In production, this would redirect to Stripe for secure payment processing.</p>
              <div class="demo-features">
                <h4>Premium Features:</h4>
                <ul>
                  <li>✅ Unlimited squad members</li>
                  <li>✅ Advanced analytics</li>
                  <li>✅ Priority support</li>
                  <li>✅ Custom themes</li>
                </ul>
              </div>
              <button class="demo-activate-btn">🎭 Activate Premium Demo</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(demoDiv);

    // Add event listeners
    demoDiv.querySelector('.close-premium-upgrade').addEventListener('click', () => {
      demoDiv.remove();
    });

    demoDiv.querySelector('.demo-activate-btn').addEventListener('click', () => {
      // Simulate premium activation
      this.isPremium = true;
      demoDiv.remove();
      this.showPremiumSuccess();
      this.render();
    });
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

  showPaymentError(customMessage = null) {
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
              <p>${customMessage || 'Sorry, we couldn\'t process your payment right now.'}</p>
              <p>${customMessage ? 'Please try again or contact support.' : 'Please try again or contact support.'}</p>
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
    // Get current user ID from avatar system
    const currentUser = window.avatarSystem?.user;
    return currentUser?.id || 'anonymous';
  }

  showEmailInputModal() {
    // Remove any existing modals
    const modal = document.querySelector('.premium-upgrade-modal');
    if (modal) {
      modal.remove();
    }

    // Show email input modal
    const emailModal = document.createElement('div');
    emailModal.className = 'premium-upgrade-modal';
    emailModal.innerHTML = `
      <div class="premium-upgrade-overlay">
        <div class="premium-upgrade-content">
          <div class="premium-upgrade-header">
            <h3>📧 Enter Your Email</h3>
            <div class="close-premium-upgrade">×</div>
          </div>
          <div class="premium-upgrade-body">
            <div class="email-input-section">
              <p>We need your email address to process the payment.</p>
              <div class="email-input-group">
                <input type="email" id="paymentEmailInput" placeholder="Enter your email address" class="email-input">
                <button id="continuePaymentBtn" class="continue-payment-btn">💳 Continue to Payment</button>
              </div>
              <p class="email-note">This email will be used for payment confirmation and account updates.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(emailModal);

    // Add event listeners
    emailModal.querySelector('.close-premium-upgrade').addEventListener('click', () => {
      emailModal.remove();
    });

    emailModal.querySelector('#continuePaymentBtn').addEventListener('click', () => {
      const email = emailModal.querySelector('#paymentEmailInput').value.trim();
      if (email && email.includes('@')) {
        emailModal.remove();
        this.createStripeCheckoutSessionWithEmail(email);
      } else {
        alert('Please enter a valid email address.');
      }
    });

    // Allow Enter key to submit
    emailModal.querySelector('#paymentEmailInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        emailModal.querySelector('#continuePaymentBtn').click();
      }
    });

    // Focus on input
    setTimeout(() => {
      emailModal.querySelector('#paymentEmailInput').focus();
    }, 100);
  }

  async createStripeCheckoutSessionWithEmail(email) {
    try {
      // Show loading state
      this.showPaymentLoading();

      // Get current user ID
      const currentUser = window.avatarSystem?.user;
      const userId = currentUser?.id || 'anonymous';

      // Create checkout session via API
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          email: email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      this.showPaymentError();
    }
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

    // Sync premium status with avatar system when rendering
    this.syncPremiumStatus();

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
              <p>${this.people.filter(p => p.isSharing).length} sharing location</p>
              <div class="squad-limits">
                ${this.isPremium ? `
                  <span class="limit-text premium">Unlimited Squad Members</span>
                ` : `
                  <span class="limit-text basic">Squad Sharing (${this.people.length}/${this.maxFreeMembers})</span>
                `}
              </div>
              <div class="user-tier-badge ${this.userTier.toLowerCase()}-tier">
                <span class="tier-icon">${this.isPremium ? '💎' : '📱'}</span>
                <span class="tier-text">${this.userTier} User</span>
              </div>
            </div>
          </div>
          
          <div class="tracker-actions">
            <button class="invite-friends-btn" title="Invite Friends" onclick="window.inviteSystem.showInviteModal()">
              <i class="fas fa-user-plus"></i>
            </button>
            ${!this.isPremium ? `
                          <button class="premium-upgrade-btn" title="Upgrade to Pro" onclick="window.carnivalTracker.handleUpgradeClick()">
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
            Track ${this.isPremium ? `(${this.people.length})` : `(${this.people.length}/${this.maxFreeMembers})`}
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
          
          ${this.canUseCalling() ? `
            <button class="action-btn phone-btn" title="Call ${person.name}" data-phone="${person.phone}" data-name="${person.name}">
              <i class="fas fa-phone"></i>
            </button>
          ` : `
            <button class="action-btn phone-btn disabled" title="Calling requires Premium" onclick="window.carnivalTracker.showPremiumUpgrade('Phone calling is a Premium feature. Upgrade to connect with your squad!')">
              <i class="fas fa-phone"></i>
            </button>
          `}
          
          ${this.canUseMessaging() ? `
            <button class="action-btn whatsapp-btn" title="Message ${person.name} on WhatsApp" data-phone="${person.phone}" data-name="${person.name}">
              <i class="fab fa-whatsapp"></i>
            </button>
          ` : `
            <button class="action-btn whatsapp-btn disabled" title="Messaging requires Premium" onclick="window.carnivalTracker.showPremiumUpgrade('WhatsApp messaging is a Premium feature. Upgrade to connect with your squad!')">
              <i class="fab fa-whatsapp"></i>
            </button>
          `}
          
          <button class="action-btn invite-btn" title="Invite ${person.name}" onclick="window.inviteSystem.showInviteModal()">
            <i class="fas fa-user-plus"></i>
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

  // Update user location in carnival tracker
  updateUserLocation(position) {
    console.log('🎭 Updating user location in carnival tracker:', position);

    // Find current user in people list or add them
    const currentUser = window.avatarSystem?.user;
    if (!currentUser) {
      console.log('⚠️ No current user found');
      return;
    }

    let userPerson = this.people.find(p => p.email === currentUser.email);

    if (!userPerson) {
      // Add current user to people list
      userPerson = {
        id: Date.now(),
        name: currentUser.user_metadata?.full_name || currentUser.email.split('@')[0],
        email: currentUser.email,
        phone: currentUser.phone || '',
        relationship: 'You',
        isSharing: true,
        location: {
          latitude: position.latitude,
          longitude: position.longitude,
          area: this.getAreaFromCoordinates(position.latitude, position.longitude),
          accuracy: position.accuracy
        },
        lastUpdate: new Date(position.timestamp),
        avatar: this.generateAvatar(currentUser.user_metadata?.full_name || currentUser.email.split('@')[0])
      };

      this.people.push(userPerson);
      console.log('✅ Added current user to carnival tracker');
    } else {
      // Update existing user location
      userPerson.isSharing = true;
      userPerson.location = {
        latitude: position.latitude,
        longitude: position.longitude,
        area: this.getAreaFromCoordinates(position.latitude, position.longitude),
        accuracy: position.accuracy
      };
      userPerson.lastUpdate = new Date(position.timestamp);
      console.log('✅ Updated current user location in carnival tracker');
    }

    // Re-render if visible
    if (this.isVisible) {
      this.render();
    }
  }

  // Remove user location from carnival tracker
  removeUserLocation() {
    console.log('🎭 Removing user location from carnival tracker');

    const currentUser = window.avatarSystem?.user;
    if (!currentUser) {
      console.log('⚠️ No current user found');
      return;
    }

    const userPerson = this.people.find(p => p.email === currentUser.email);
    if (userPerson) {
      userPerson.isSharing = false;
      userPerson.location = null;
      console.log('✅ Removed current user location from carnival tracker');

      // Re-render if visible
      if (this.isVisible) {
        this.render();
      }
    }
  }

  // Get area name from coordinates (simplified)
  getAreaFromCoordinates(lat, lng) {
    // This is a simplified version - in a real app you'd use a geocoding service
    const areas = [
      { name: 'Ladbroke Grove', lat: 51.5194, lng: -0.2107, radius: 0.01 },
      { name: 'Portobello Road', lat: 51.5189, lng: -0.2047, radius: 0.01 },
      { name: 'Westbourne Park', lat: 51.5219, lng: -0.2019, radius: 0.01 },
      { name: 'Notting Hill', lat: 51.5167, lng: -0.2000, radius: 0.01 },
      { name: 'Kensal Rise', lat: 51.5269, lng: -0.2219, radius: 0.01 }
    ];

    for (const area of areas) {
      const distance = Math.sqrt(
        Math.pow(lat - area.lat, 2) + Math.pow(lng - area.lng, 2)
      );
      if (distance <= area.radius) {
        return area.name;
      }
    }

    return 'Nearby Area';
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
