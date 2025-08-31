// 🎉 TagYou Invite System
// Handles WhatsApp invites and contact selection

class InviteSystem {
  constructor() {
    this.contacts = [];
    this.selectedContacts = [];
    this.inviteMessage = "Join me at the carnival! 🎭 Download TagYou to track events together: https://tagyou.app";
    this.init();
  }

  init() {
    this.loadContacts();
    this.setupEventListeners();
  }

  // Load contacts from device or mock data
  async loadContacts() {
    try {
      // Try to get real contacts if available
      if ('contacts' in navigator && 'select' in navigator.contacts) {
        const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: true });
        this.contacts = contacts.map(contact => ({
          id: contact.tel?.[0] || Math.random().toString(36),
          name: contact.name?.[0] || 'Unknown',
          phone: contact.tel?.[0] || '',
          selected: false
        }));
      } else {
        // Fallback to mock contacts for demo
        this.contacts = this.getMockContacts();
      }
    } catch (error) {
      console.log('Using mock contacts:', error);
      this.contacts = this.getMockContacts();
    }
  }

  // Mock contacts for demo/testing
  getMockContacts() {
    return [
      { id: '1', name: 'Alex Johnson', phone: '+447700900123', selected: false },
      { id: '2', name: 'Sarah Williams', phone: '+447700900124', selected: false },
      { id: '3', name: 'Mike Davis', phone: '+447700900125', selected: false },
      { id: '4', name: 'Emma Wilson', phone: '+447700900126', selected: false },
      { id: '5', name: 'James Brown', phone: '+447700900127', selected: false },
      { id: '6', name: 'Lisa Garcia', phone: '+447700900128', selected: false },
      { id: '7', name: 'David Miller', phone: '+447700900129', selected: false },
      { id: '8', name: 'Anna Taylor', phone: '+447700900130', selected: false }
    ];
  }

  // Show invite modal
  showInviteModal() {
    const modal = document.createElement('div');
    modal.className = 'invite-modal';
    modal.innerHTML = this.getInviteModalHTML();
    document.body.appendChild(modal);

    this.setupModalEventListeners(modal);
    this.renderContactsList(modal);
  }

  // Get invite modal HTML
  getInviteModalHTML() {
    return `
      <div class="invite-overlay">
        <div class="invite-content">
          <div class="invite-header">
            <div class="invite-title">
              <i class="fab fa-whatsapp"></i>
              <h2>Invite Friends</h2>
            </div>
            <button class="close-invite-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="invite-search">
            <div class="search-input-wrapper">
              <i class="fas fa-search"></i>
              <input type="text" id="contactSearch" placeholder="Search contacts...">
            </div>
          </div>

          <div class="invite-stats">
            <span class="selected-count">0 selected</span>
            <button class="select-all-btn">Select All</button>
          </div>

          <div class="contacts-container">
            <div class="contacts-list" id="contactsList">
              <!-- Contacts will be rendered here -->
            </div>
          </div>

          <div class="invite-actions">
            <div class="invite-message">
              <label>Custom Message:</label>
              <textarea id="customMessage" placeholder="Add a personal message...">${this.inviteMessage}</textarea>
            </div>
            <div class="action-buttons">
              <button class="invite-btn whatsapp-invite-btn" disabled>
                <i class="fab fa-whatsapp"></i>
                Invite via WhatsApp
              </button>
              <button class="invite-btn copy-link-btn">
                <i class="fas fa-link"></i>
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Render contacts list
  renderContactsList(modal) {
    const contactsList = modal.querySelector('#contactsList');
    const searchInput = modal.querySelector('#contactSearch');

    const renderContacts = (contacts) => {
      contactsList.innerHTML = contacts.map(contact => `
        <div class="contact-item ${contact.selected ? 'selected' : ''}" data-id="${contact.id}">
          <div class="contact-checkbox">
            <input type="checkbox" id="contact-${contact.id}" ${contact.selected ? 'checked' : ''}>
            <label for="contact-${contact.id}"></label>
          </div>
          <div class="contact-info">
            <div class="contact-avatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="contact-details">
              <div class="contact-name">${contact.name}</div>
              <div class="contact-phone">${contact.phone}</div>
            </div>
          </div>
          <div class="contact-actions">
            <button class="contact-whatsapp-btn" title="Send WhatsApp">
              <i class="fab fa-whatsapp"></i>
            </button>
          </div>
        </div>
      `).join('');
    };

    // Initial render
    renderContacts(this.contacts);

    // Search functionality
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const filteredContacts = this.contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.phone.includes(searchTerm)
      );
      renderContacts(filteredContacts);
    });
  }

  // Setup modal event listeners
  setupModalEventListeners(modal) {
    // Close button
    modal.querySelector('.close-invite-btn').addEventListener('click', () => {
      modal.remove();
    });

    // Close on overlay click
    modal.querySelector('.invite-overlay').addEventListener('click', (e) => {
      if (e.target.classList.contains('invite-overlay')) {
        modal.remove();
      }
    });

    // Select all button
    modal.querySelector('.select-all-btn').addEventListener('click', () => {
      this.toggleSelectAll(modal);
    });

    // Contact checkboxes
    modal.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox' && e.target.id.startsWith('contact-')) {
        const contactId = e.target.id.replace('contact-', '');
        this.toggleContactSelection(contactId, e.target.checked);
        this.updateInviteButton(modal);
        this.updateSelectedCount(modal);
      }
    });

    // WhatsApp invite button
    modal.querySelector('.whatsapp-invite-btn').addEventListener('click', () => {
      this.sendWhatsAppInvites(modal);
    });

    // Copy link button
    modal.querySelector('.copy-link-btn').addEventListener('click', () => {
      this.copyInviteLink(modal);
    });

    // Individual WhatsApp buttons
    modal.addEventListener('click', (e) => {
      if (e.target.closest('.contact-whatsapp-btn')) {
        const contactItem = e.target.closest('.contact-item');
        const contactId = contactItem.dataset.id;
        const contact = this.contacts.find(c => c.id === contactId);
        this.sendIndividualWhatsApp(contact, modal);
      }
    });
  }

  // Toggle select all
  toggleSelectAll(modal) {
    const selectAllBtn = modal.querySelector('.select-all-btn');
    const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
    const allSelected = Array.from(checkboxes).every(cb => cb.checked);

    checkboxes.forEach(checkbox => {
      const contactId = checkbox.id.replace('contact-', '');
      checkbox.checked = !allSelected;
      this.toggleContactSelection(contactId, !allSelected);
    });

    selectAllBtn.textContent = allSelected ? 'Select All' : 'Deselect All';
    this.updateInviteButton(modal);
    this.updateSelectedCount(modal);
  }

  // Toggle contact selection
  toggleContactSelection(contactId, selected) {
    const contact = this.contacts.find(c => c.id === contactId);
    if (contact) {
      contact.selected = selected;
      if (selected) {
        this.selectedContacts.push(contact);
      } else {
        this.selectedContacts = this.selectedContacts.filter(c => c.id !== contactId);
      }
    }
  }

  // Update invite button state
  updateInviteButton(modal) {
    const inviteBtn = modal.querySelector('.whatsapp-invite-btn');
    inviteBtn.disabled = this.selectedContacts.length === 0;
  }

  // Update selected count
  updateSelectedCount(modal) {
    const countElement = modal.querySelector('.selected-count');
    countElement.textContent = `${this.selectedContacts.length} selected`;
  }

  // Send WhatsApp invites to selected contacts
  async sendWhatsAppInvites(modal) {
    const customMessage = modal.querySelector('#customMessage').value;

    for (const contact of this.selectedContacts) {
      await this.sendWhatsAppMessage(contact.phone, customMessage);
    }

    // Show success message
    this.showSuccessMessage(modal, `Invites sent to ${this.selectedContacts.length} contacts!`);
  }

  // Send individual WhatsApp message
  async sendIndividualWhatsApp(contact, modal) {
    const customMessage = modal.querySelector('#customMessage').value;
    await this.sendWhatsAppMessage(contact.phone, customMessage);

    // Show success message
    this.showSuccessMessage(modal, `Invite sent to ${contact.name}!`);
  }

  // Send WhatsApp message
  async sendWhatsAppMessage(phone, message) {
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

    // Try to open WhatsApp app or web
    try {
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(message);
      alert('WhatsApp link copied to clipboard!');
    }
  }

  // Copy invite link
  async copyInviteLink(modal) {
    const customMessage = modal.querySelector('#customMessage').value;
    const inviteLink = `https://tagyou.app?ref=invite&msg=${encodeURIComponent(customMessage)}`;

    try {
      await navigator.clipboard.writeText(inviteLink);
      this.showSuccessMessage(modal, 'Invite link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
      alert('Failed to copy link');
    }
  }

  // Show success message
  showSuccessMessage(modal, message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'invite-success';
    successDiv.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    `;

    modal.querySelector('.invite-content').appendChild(successDiv);

    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }

  // Setup global event listeners
  setupEventListeners() {
    // Listen for invite button clicks
    document.addEventListener('click', (e) => {
      if (e.target.closest('.invite-friends-btn')) {
        this.showInviteModal();
      }
    });
  }
}

// Initialize invite system
window.inviteSystem = new InviteSystem();
