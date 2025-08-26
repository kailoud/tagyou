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
  // Add click listeners to flip cards
  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', function (e) {
      // Don't flip if clicking on the back button
      if (e.target.classList.contains('flip-back-btn')) {
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

  if (artistsData.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No artists available.</p></div>';
    return;
  }

  container.innerHTML = artistsData.map((artist, index) => `
      <div class="flip-card" data-index="${index}">
        <div class="flip-card-inner">
          <!-- Front Side (Basic Info) -->
          <div class="flip-card-front">
            <div class="item-image">
              ${artist.image_url ?
      `<img src="${artist.image_url}" alt="${artist.name}" onerror="this.parentElement.innerHTML='<div class=\\"no-image\\">🎵</div>'">` :
      '<div class="no-image">🎵</div>'
    }
            </div>
            <div class="item-content">
              <div class="item-header">
                <h5>${artist.name || 'Unnamed Artist'}</h5>
                <div class="item-badge genre-badge">${artist.genre || 'Music'}</div>
              </div>
              <p class="item-description">${artist.description || 'Amazing live performance and entertainment at the festival.'}</p>
              <div class="item-details">
                <div class="detail-row">
                  <span class="item-stage">🎤 ${artist.stage || 'Main Stage'}</span>
                  <span class="item-rating">⭐ ${artist.rating || '4.8'}</span>
                </div>
              </div>
              <div class="flip-hint">Click for more info</div>
            </div>
          </div>
          
          <!-- Back Side (Detailed Info) -->
          <div class="flip-card-back">
            <div class="back-header">
              <h5>${artist.name || 'Unnamed Artist'}</h5>
              <div class="item-badge genre-badge">${artist.genre || 'Music'}</div>
            </div>
            <div class="back-content">
              <div class="info-section">
                <h6>🎤 Stage</h6>
                <p>${artist.stage || 'Main Stage'}</p>
              </div>
              <div class="info-section">
                <h6>🕐 Performance Time</h6>
                <p>${artist.performance_time || 'TBA'}</p>
              </div>
              <div class="info-section">
                <h6>⏱️ Duration</h6>
                <p>${artist.duration || '60 min'}</p>
              </div>
              <div class="info-section">
                <h6>⭐ Rating</h6>
                <p>${artist.rating || '4.8'} / 5.0</p>
              </div>
              <div class="info-section">
                <h6>🎵 Specialties</h6>
                <p>${artist.specialties || 'Live Performance'}</p>
              </div>
              <div class="info-section">
                <h6>📝 Description</h6>
                <p>${artist.description || 'Amazing live performance and entertainment at the festival.'}</p>
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
        map.setView([userLat, userLng], 15);
        console.log('📍 Map centered on user location');
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

  let isExpanded = false;

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
    if (isExpanded) {
      collapsePanel();
    } else {
      expandPanel();
    }
  }

  function expandPanel() {
    pullUpPanel.classList.add('expanded');
    isExpanded = true;
    console.log('📱 Panel expanded');
  }

  function collapsePanel() {
    pullUpPanel.classList.remove('expanded');
    isExpanded = false;
    console.log('📱 Panel collapsed');
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


