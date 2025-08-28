// TagYou2 London Map - Clean Implementation
let map;
let supabaseClient = null;
let foodStallsData = [];
let artistsData = [];
let floatTrucksData = [];

document.addEventListener('DOMContentLoaded', async function () {
  console.log('🚀 Initializing TagYou2 London Map...');

  initMap();
  initPullUpPanel();
  initMapToolbar();
  await initializeSupabase();
  await loadInitialData();
});

async function initializeSupabase() {
  try {
    // Use centralized Supabase client if available
    if (window.getSupabaseClient) {
      supabaseClient = window.getSupabaseClient();
      console.log('✅ Using centralized Supabase client');
      return true;
    }

    // Fallback to creating our own client
    if (!window.supabase || !window.supabaseConfig) {
      throw new Error('Supabase SDK or config not available');
    }

    supabaseClient = window.supabase.createClient(
      window.supabaseConfig.supabaseUrl,
      window.supabaseConfig.supabaseAnonKey
    );

    console.log('✅ Supabase client initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
    return false;
  }
}

async function loadInitialData() {
  try {
    console.log('🔄 Loading initial data...');

    await Promise.all([
      getFoodStalls(),
      getArtists(),
      getFloatTrucks()
    ]);

    populatePullUpPanel();
    console.log('✅ Initial data loaded and displayed');
  } catch (error) {
    console.error('❌ Error loading initial data:', error);
  }
}

async function getFoodStalls() {
  try {
    const { data, error } = await supabaseClient
      .from('food_stalls')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    foodStallsData = data || [];
    console.log('✅ Loaded food stalls:', foodStallsData.length);
  } catch (error) {
    console.error('❌ Error loading food stalls:', error);
    foodStallsData = [];
  }
}

async function getArtists() {
  try {
    const { data, error } = await supabaseClient
      .from('artists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    artistsData = data || [];
    console.log('✅ Loaded artists:', artistsData.length);

    // Debug: Log the first artist data to see structure
    if (artistsData.length > 0) {
      console.log('🔍 First artist data:', artistsData[0]);
      console.log('🔍 Artist featured_image:', artistsData[0].featured_image);
      console.log('🔍 Artist all_images:', artistsData[0].all_images);
      console.log('🔍 Artist image_url:', artistsData[0].image_url);
      console.log('🔍 All artist columns:', Object.keys(artistsData[0]));
    }
  } catch (error) {
    console.error('❌ Error loading artists:', error);
    artistsData = [];
  }
}

async function getFloatTrucks() {
  try {
    const { data, error } = await supabaseClient
      .from('float_trucks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    floatTrucksData = data || [];
    console.log('✅ Loaded float trucks:', floatTrucksData.length);
  } catch (error) {
    console.error('❌ Error loading float trucks:', error);
    floatTrucksData = [];
  }
}

function populatePullUpPanel() {
  populateFoodStalls();
  populateArtists();
  populateFloatTrucks();
  setupFlipCardListeners();
}

function setupFlipCardListeners() {
  // Add click listeners to artist cards
  document.querySelectorAll('.artist-card').forEach(card => {
    card.addEventListener('click', function (e) {
      // Don't flip if clicking on the close button
      if (e.target.closest('.close-details-btn')) {
        e.stopPropagation();
        this.classList.remove('flipped');
        return;
      }

      // Toggle flip state
      this.classList.toggle('flipped');
    });
  });
}

function populateFoodStalls() {
  const container = document.getElementById('food-stalls-list');
  if (!container) return;

  if (foodStallsData.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No food stalls available.</p></div>';
    return;
  }

  container.innerHTML = foodStallsData.map((stall, index) => `
      <div class="flip-card" data-index="${index}">
        <div class="flip-card-inner">
          <!-- Front Side (Basic Info) -->
          <div class="flip-card-front">
            <div class="item-image">
              ${stall.image_url ?
      `<img src="${stall.image_url}" alt="${stall.name}" onerror="this.parentElement.innerHTML='<div class=\\"no-image\\">🍽️</div>'">` :
      '<div class="no-image">🍽️</div>'
    }
            </div>
            <div class="item-content">
              <div class="item-header">
                <h5>${stall.name || 'Unnamed Stall'}</h5>
                <div class="item-badge cuisine-badge">${stall.cuisine || 'Cuisine'}</div>
              </div>
              <p class="item-description">${stall.description || 'Delicious festival food and refreshments available at this stall.'}</p>
              <div class="item-details">
                <div class="detail-row">
                  <span class="item-location">📍 ${stall.location || 'Festival Grounds'}</span>
                  <span class="item-rating">⭐ ${stall.rating || '4.5'}</span>
                </div>
              </div>
              <div class="flip-hint">Click for more info</div>
            </div>
          </div>
          
          <!-- Back Side (Detailed Info) -->
          <div class="flip-card-back">
            <div class="back-header">
              <h5>${stall.name || 'Unnamed Stall'}</h5>
              <div class="item-badge cuisine-badge">${stall.cuisine || 'Cuisine'}</div>
            </div>
            <div class="back-content">
              <div class="info-section">
                <h6>📍 Location</h6>
                <p>${stall.location || 'Festival Grounds'}</p>
              </div>
              <div class="info-section">
                <h6>🕐 Opening Hours</h6>
                <p>${stall.opening_hours || 'All Day'}</p>
              </div>
              <div class="info-section">
                <h6>💰 Price Range</h6>
                <p>${stall.price_range || '£5-15'}</p>
              </div>
              <div class="info-section">
                <h6>⭐ Rating</h6>
                <p>${stall.rating || '4.5'} / 5.0</p>
              </div>
              <div class="info-section">
                <h6>🍽️ Specialties</h6>
                <p>${stall.specialties || 'Local Favorites'}</p>
              </div>
              <div class="info-section">
                <h6>📝 Description</h6>
                <p>${stall.description || 'Delicious festival food and refreshments available at this stall.'}</p>
              </div>
            </div>
            <div class="back-footer">
              <button class="flip-back-btn">← Back</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
}

function populateArtists() {
  const container = document.getElementById('artists-list');
  if (!container) return;

  console.log('🎵 Populating artists, data length:', artistsData.length);

  if (artistsData.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No artists available.</p></div>';
    return;
  }

  // Debug: Check first artist image
  if (artistsData.length > 0) {
    console.log('🔍 First artist in populate:', artistsData[0]);
    console.log('🔍 Featured image check:', artistsData[0].featured_image ? 'Has featured_image' : 'No featured_image');
    console.log('🔍 All images check:', artistsData[0].all_images ? 'Has all_images' : 'No all_images');
    console.log('🔍 Image URL check:', artistsData[0].image_url ? 'Has URL' : 'No URL');
  }

  container.innerHTML = artistsData.map((artist, index) => `
      <div class="artist-card" data-index="${index}">
        <div class="card-inner">
          <!-- Front Side (Professional Display) -->
          <div class="card-front">
            <div class="card-image-container">
              <div class="image-overlay">
                <div class="genre-badge">${artist.genre || 'Music'}</div>
                <div class="flip-indicator">
                  <span class="flip-icon">↻</span>
                  <span class="flip-text">View Details</span>
                </div>
              </div>
              ${(() => {
      // Priority: featured_image > all_images[0] > image_url > other fields
      const imageSource = artist.featured_image ||
        (artist.all_images && Array.isArray(artist.all_images) ? artist.all_images[0] : null) ||
        artist.image_url ||
        artist.image ||
        artist.img_url ||
        artist.img;

      if (!imageSource) return '<div class="no-image-placeholder"><div class="music-icon">🎵</div><div class="placeholder-text">No Image</div></div>';

      return `<img src="${imageSource}" alt="${artist.name}" class="artist-image" onerror="this.parentElement.innerHTML='<div class=\\"no-image-placeholder\\"><div class=\\"music-icon\\">🎵</div><div class=\\"placeholder-text\\">Image Error</div></div>'; console.warn('Failed to load image for ${artist.name}:', '${imageSource}')">`;
    })()}
            </div>
            <div class="card-content">
              <div class="artist-header">
                <h3 class="artist-name">${artist.name || 'Unnamed Artist'}</h3>
                <div class="rating-display">
                  <span class="stars">${'⭐'.repeat(Math.floor(parseFloat(artist.rating || 4.8)))}</span>
                  <span class="rating-text">${artist.rating || '4.8'}</span>
                </div>
              </div>
              <p class="artist-description">${artist.description || 'Amazing live performance and entertainment at the festival.'}</p>
              <div class="artist-meta">
                <div class="meta-item">
                  <span class="meta-icon">🎤</span>
                  <span class="meta-text">${artist.stage || 'Main Stage'}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">🕐</span>
                  <span class="meta-text">${artist.performance_time || 'TBA'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Back Side (Detailed Information) -->
          <div class="card-back">
            <div class="back-header">
              <div class="back-title">
                <h3 class="artist-name">${artist.name || 'Unnamed Artist'}</h3>
                <div class="genre-badge">${artist.genre || 'Music'}</div>
              </div>
              <button class="close-details-btn" aria-label="Close details">
                <span class="close-icon">×</span>
              </button>
            </div>
            <div class="back-content">
              <div class="detail-grid">
                <div class="detail-item">
                  <div class="detail-icon">🎤</div>
                  <div class="detail-info">
                    <h4>Stage</h4>
                    <p>${artist.stage || 'Main Stage'}</p>
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-icon">🕐</div>
                  <div class="detail-info">
                    <h4>Performance Time</h4>
                    <p>${artist.performance_time || 'TBA'}</p>
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-icon">⏱️</div>
                  <div class="detail-info">
                    <h4>Duration</h4>
                    <p>${artist.duration || '60 min'}</p>
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-icon">⭐</div>
                  <div class="detail-info">
                    <h4>Rating</h4>
                    <p>${artist.rating || '4.8'} / 5.0</p>
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-icon">🎵</div>
                  <div class="detail-info">
                    <h4>Specialties</h4>
                    <p>${artist.specialties || 'Live Performance'}</p>
                  </div>
                </div>
                <div class="detail-item">
                  <div class="detail-icon">📍</div>
                  <div class="detail-info">
                    <h4>Location</h4>
                    <p>${artist.location || 'Festival Grounds'}</p>
                  </div>
                </div>
              </div>
              <div class="description-section">
                <h4>About</h4>
                <p>${artist.description || 'Amazing live performance and entertainment at the festival.'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
}

function populateFloatTrucks() {
  const container = document.getElementById('float-trucks-list');
  if (!container) return;

  if (floatTrucksData.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No float trucks available.</p></div>';
    return;
  }

  container.innerHTML = floatTrucksData.map((truck, index) => `
      <div class="flip-card" data-index="${index}">
        <div class="flip-card-inner">
          <!-- Front Side (Basic Info) -->
          <div class="flip-card-front">
            <div class="item-image">
              ${truck.image_url ?
      `<img src="${truck.image_url}" alt="${truck.name}" onerror="this.parentElement.innerHTML='<div class=\\"no-image\\">🚛</div>'">` :
      '<div class="no-image">🚛</div>'
    }
            </div>
            <div class="item-content">
              <div class="item-header">
                <h5>${truck.name || 'Unnamed Float'}</h5>
                <div class="item-badge theme-badge">${truck.theme || 'Parade'}</div>
              </div>
              <p class="item-description">${truck.description || 'Spectacular parade float with amazing decorations and entertainment.'}</p>
              <div class="item-details">
                <div class="detail-row">
                  <span class="item-route">🛣️ ${truck.route || 'Main Route'}</span>
                  <span class="item-rating">⭐ ${truck.rating || '4.7'}</span>
                </div>
              </div>
              <div class="flip-hint">Click for more info</div>
            </div>
          </div>
          
          <!-- Back Side (Detailed Info) -->
          <div class="flip-card-back">
            <div class="back-header">
              <h5>${truck.name || 'Unnamed Float'}</h5>
              <div class="item-badge theme-badge">${truck.theme || 'Parade'}</div>
            </div>
            <div class="back-content">
              <div class="info-section">
                <h6>🛣️ Route</h6>
                <p>${truck.route || 'Main Route'}</p>
              </div>
              <div class="info-section">
                <h6>🕐 Parade Time</h6>
                <p>${truck.parade_time || 'TBA'}</p>
              </div>
              <div class="info-section">
                <h6>⏱️ Duration</h6>
                <p>${truck.duration || '30 min'}</p>
              </div>
              <div class="info-section">
                <h6>⭐ Rating</h6>
                <p>${truck.rating || '4.7'} / 5.0</p>
              </div>
              <div class="info-section">
                <h6>🚛 Specialties</h6>
                <p>${truck.specialties || 'Parade Float'}</p>
              </div>
              <div class="info-section">
                <h6>📝 Description</h6>
                <p>${truck.description || 'Spectacular parade float with amazing decorations and entertainment.'}</p>
              </div>
            </div>
            <div class="back-footer">
              <button class="flip-back-btn">← Back</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
}

function initMap() {
  map = L.map('map').setView([51.505, -0.09], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  console.log('✅ Map initialized');
}

function initMapToolbar() {
  const foodStallBtn = document.getElementById('foodStallBtn');
  const floatTruckBtn = document.getElementById('floatTruckBtn');
  const artistBandBtn = document.getElementById('artistBandBtn');
  const locationCenterBtn = document.getElementById('locationCenterBtn');
  const carnivalTrackerBtn = document.getElementById('carnivalTrackerBtn');

  // Food Stalls button
  foodStallBtn.addEventListener('click', function () {
    toggleButtonActive(this);
    console.log('🍽️ Food Stalls button clicked');
  });

  // Float Trucks button
  floatTruckBtn.addEventListener('click', function () {
    toggleButtonActive(this);
    console.log('🚛 Float Trucks button clicked');
  });

  // Artists & Bands button
  artistBandBtn.addEventListener('click', function () {
    toggleButtonActive(this);
    console.log('🎵 Artists & Bands button clicked');
  });

  // Location Center button
  locationCenterBtn.addEventListener('click', function () {
    console.log('📍 Location Center button clicked');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Remove existing user location marker if it exists
        if (window.userLocationMarker) {
          map.removeLayer(window.userLocationMarker);
        }

        // Create pulsating blue dot for user location
        const userLocationIcon = L.divIcon({
          className: 'user-location-marker',
          html: '<div class="pulsating-dot"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        // Add user location marker to map
        window.userLocationMarker = L.marker([userLat, userLng], {
          icon: userLocationIcon,
          zIndexOffset: 1000
        }).addTo(map);

        // Center map on user location
        map.setView([userLat, userLng], 15);
        console.log('📍 Map centered on user location with pulsating dot');
      }, function (error) {
        console.log('❌ Error getting location:', error);
        map.setView([51.5074, -0.1278], 12);
      });
    } else {
      console.log('❌ Geolocation not supported');
      map.setView([51.5074, -0.1278], 12);
    }
  });

  // Carnival Tracker button
  carnivalTrackerBtn.addEventListener('click', function () {
    console.log('🎭 Carnival Tracker button clicked');
    toggleButtonActive(this);

    // Toggle carnival tracker visibility using the global function
    if (window.toggleCarnivalTracker) {
      window.toggleCarnivalTracker();
    } else {
      console.log('❌ Carnival tracker not initialized yet');
    }
  });

  console.log('✅ Map toolbar initialized');
}

function toggleButtonActive(button) {
  const isActive = button.classList.contains('active');
  if (isActive) {
    button.classList.remove('active');
  } else {
    button.classList.add('active');
  }
}

function initPullUpPanel() {
  const pullUpPanel = document.getElementById('pullUpPanel');
  const panelHandle = document.querySelector('.panel-handle');
  const closePanel = document.getElementById('closePanel');
  const tabButtons = document.querySelectorAll('.tab-btn');

  if (!pullUpPanel || !panelHandle || !closePanel) {
    console.error('❌ Pull-up panel elements not found!');
    return;
  }

  let panelState = 'collapsed'; // 'collapsed', 'halfway', 'expanded'

  // Make panelState globally accessible for carnival tracker
  window.pullUpPanelState = panelState;

  panelHandle.addEventListener('click', function (e) {
    e.stopPropagation();
    togglePanel();
  });

  closePanel.addEventListener('click', function (e) {
    e.stopPropagation();
    collapsePanel();
  });

  tabButtons.forEach(button => {
    button.addEventListener('click', function () {
      const targetTab = this.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  function togglePanel() {
    if (panelState === 'collapsed') {
      expandHalfway();
    } else if (panelState === 'halfway') {
      expandPanel();
    } else {
      collapsePanel();
    }
  }

  function expandHalfway() {
    pullUpPanel.classList.remove('expanded');
    pullUpPanel.classList.add('halfway');
    panelState = 'halfway';
    window.pullUpPanelState = panelState; // Sync global state
    updateHandleText();
    console.log('📱 Panel halfway');
  }

  function expandPanel() {
    pullUpPanel.classList.remove('halfway');
    pullUpPanel.classList.add('expanded');
    panelState = 'expanded';
    window.pullUpPanelState = panelState; // Sync global state
    updateHandleText();
    console.log('📱 Panel expanded');
  }

  function collapsePanel() {
    pullUpPanel.classList.remove('expanded', 'halfway');
    panelState = 'collapsed';
    window.pullUpPanelState = panelState; // Sync global state
    updateHandleText();
    console.log('📱 Panel collapsed');
  }

  function updateHandleText() {
    const handleText = document.querySelector('.handle-text');
    if (handleText) {
      switch (panelState) {
        case 'collapsed':
          handleText.textContent = 'Pull up for more';
          break;
        case 'halfway':
          handleText.textContent = 'Pull up for full view';
          break;
        case 'expanded':
          handleText.textContent = 'Pull down to close';
          break;
      }
    }
  }

  function switchTab(tabName) {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    console.log('📱 Switched to tab:', tabName);
  }

  console.log('✅ Pull-up panel initialized');
}


