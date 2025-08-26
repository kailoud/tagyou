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
}

function populateFoodStalls() {
  const container = document.getElementById('food-stalls-list');
  if (!container) return;

  if (foodStallsData.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No food stalls available.</p></div>';
    return;
  }

  container.innerHTML = foodStallsData.map(stall => `
    <div class="content-item">
      <div class="item-image">
        ${stall.image_url ?
      `<img src="${stall.image_url}" alt="${stall.name}" onerror="this.parentElement.innerHTML='No Image'">` :
      '<div class="no-image">No Image</div>'
    }
      </div>
      <div class="item-content">
        <h5>${stall.name || 'Unnamed Stall'}</h5>
        <p class="item-cuisine">${stall.cuisine || 'Cuisine not specified'}</p>
        <p class="item-description">${stall.description || 'No description available'}</p>
        <div class="item-details">
          <span class="item-location">📍 ${stall.location || 'Location not specified'}</span>
          <span class="item-rating">⭐ ${stall.rating || 'N/A'}</span>
        </div>
        <div class="item-price">${stall.price_range || 'Price not specified'}</div>
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

  container.innerHTML = artistsData.map(artist => `
    <div class="content-item">
      <div class="item-image">
        ${artist.image_url ?
      `<img src="${artist.image_url}" alt="${artist.name}" onerror="this.parentElement.innerHTML='No Image'">` :
      '<div class="no-image">No Image</div>'
    }
      </div>
      <div class="item-content">
        <h5>${artist.name || 'Unnamed Artist'}</h5>
        <p class="item-genre">${artist.genre || 'Genre not specified'}</p>
        <p class="item-description">${artist.description || 'No description available'}</p>
        <div class="item-details">
          <span class="item-stage">🎤 ${artist.stage || 'Stage not specified'}</span>
          <span class="item-time">🕐 ${artist.performance_time || 'Time not specified'}</span>
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

  container.innerHTML = floatTrucksData.map(truck => `
    <div class="content-item">
      <div class="item-image">
        ${truck.image_url ?
      `<img src="${truck.image_url}" alt="${truck.name}" onerror="this.parentElement.innerHTML='No Image'">` :
      '<div class="no-image">No Image</div>'
    }
      </div>
      <div class="item-content">
        <h5>${truck.name || 'Unnamed Float'}</h5>
        <p class="item-theme">${truck.theme || 'Theme not specified'}</p>
        <p class="item-description">${truck.description || 'No description available'}</p>
        <div class="item-details">
          <span class="item-route">🛣️ ${truck.route || 'Route not specified'}</span>
          <span class="item-time">🕐 ${truck.parade_time || 'Time not specified'}</span>
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


