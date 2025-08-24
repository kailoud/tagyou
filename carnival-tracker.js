class CarnivalTracker {
  constructor() {
    this.isMinimized = true; // Start minimized
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

    this.isMinimized = false;
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
    this.render();
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
    
    // Update the toolbar count
    this.updateToolbarCount();
    
    console.log('🎭 Carnival tracker element created and added to page');
  }

  setupEventListeners() {
    // Event delegation for dynamic elements
    this.trackerElement.addEventListener('click', (e) => {
      // Minimize button
      if (e.target.closest('.minimize-btn')) {
        this.isMinimized = true;
        this.render();
      }

      // Expand button (from minimized state)
      if (e.target.closest('.expand-btn')) {
        this.isMinimized = false;
        this.render();
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

  render() {
    if (this.isMinimized) {
      this.renderMinimized();
    } else {
      this.renderFull();
    }

    if (this.showAddForm) {
      this.renderAddForm();
    }
    
    // Always update the toolbar count
    this.updateToolbarCount();
  }

  updateToolbarCount() {
    const trackerCount = document.getElementById('trackerCount');
    if (trackerCount) {
      const sharingCount = this.people.filter(p => p.isSharing).length;
      trackerCount.textContent = sharingCount;
      
      // Update button state
      const trackerBtn = document.getElementById('carnivalTrackerBtn');
      if (trackerBtn) {
        if (this.trackerElement.style.display === 'none') {
          trackerBtn.classList.remove('active');
        } else {
          trackerBtn.classList.add('active');
        }
      }
    }
  }

  renderMinimized() {
    // No longer needed since we're using the toolbar button
    this.trackerElement.style.display = 'none';
    this.updateToolbarCount();
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
              <h3>Carnival Squad</h3>
              <p>${this.people.filter(p => p.isSharing).length} sharing location</p>
            </div>
          </div>
          
          <div class="tracker-actions">
            <button class="add-person-btn" title="Add Person">
              <i class="fas fa-plus"></i>
            </button>
            <button class="minimize-btn" title="Minimize">
              <i class="fas fa-minus"></i>
            </button>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="tracker-tabs">
          <button class="tab-btn ${this.activeTab === 'tracker' ? 'active' : ''}" data-tab="tracker">
            Track (${this.people.length})
          </button>
          <button class="tab-btn ${this.activeTab === 'notifications' ? 'active' : ''}" data-tab="notifications">
            Updates
            ${this.notifications.length > 0 ? `<span class="notification-badge">${this.notifications.length}</span>` : ''}
          </button>
        </div>

        <!-- Content -->
        <div class="tracker-content">
          ${this.activeTab === 'tracker' ? this.renderTrackerTab(filteredPeople) : this.renderNotificationsTab()}
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
          
          <a href="tel:${person.phone}" class="action-btn call-btn" title="Call">
            <i class="fas fa-phone"></i>
          </a>
          
          <button class="action-btn message-btn" title="Message">
            <i class="fas fa-comment"></i>
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

  // Public methods to show/hide the tracker
  show() {
    this.trackerElement.style.display = 'block';
    console.log('🎭 Carnival tracker shown');
  }

  hide() {
    this.trackerElement.style.display = 'none';
    console.log('🎭 Carnival tracker hidden');
  }

  toggle() {
    if (this.trackerElement.style.display === 'none') {
      this.show();
    } else {
      this.hide();
    }
  }
}

// Initialize the carnival tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎭 Initializing carnival tracker...');
  window.carnivalTracker = new CarnivalTracker();

  // Make it globally accessible
  window.toggleCarnivalTracker = () => {
    if (window.carnivalTracker) {
      window.carnivalTracker.toggle();
    } else {
      console.log('❌ Carnival tracker not initialized');
    }
  };

  console.log('🎭 Carnival tracker initialized and ready!');
  console.log('🎭 Click the users icon (👥) in the toolbar to show/hide the tracker');
});
