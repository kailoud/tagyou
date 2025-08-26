// TagYou2 London Map - Supabase Integration
let map;
// Make map globally accessible
window.map = map;
let currentUser = null; // Will be set when user authentication is implemented
// Old authService variable removed - using modern profile system
let foodStallsData = [];
let artistsData = [];
let floatTrucksData = [];
let supabaseInitialized = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function () {
  console.log('🚀 Initializing TagYou2 London Map...');

  // Initialize map immediately
  initMap();

  // Initialize other components with minimal delays
  setTimeout(() => {
    initMapToolbar();
    console.log('✅ Toolbar initialized');
  }, 100); // Reduced from 1000ms to 100ms

  setTimeout(() => {
    initSearch();
    console.log('✅ Search initialized');
  }, 200);

  setTimeout(() => {
    initPullUpPanel();
    console.log('✅ Pull-up panel initialized');
  }, 300);

  // Initialize Supabase first
  setTimeout(async () => {
    await initializeSupabase();
    console.log('✅ Supabase initialized');
  }, 400);

  // Initialize authentication service
  setTimeout(async () => {
    await initializeAuthService();
    console.log('✅ Authentication service initialized');
  }, 500);

  console.log('🎭 Carnival tracker will initialize automatically');
});

// Initialize Supabase (non-blocking)
async function initializeSupabase() {
  console.log('🚀 Starting Supabase initialization...');
  try {
    // Check if Supabase is available
    if (typeof window.supabase === 'undefined') {
      throw new Error('Supabase SDK not loaded');
    }

    // Import and initialize Supabase config first
    console.log('🔐 Loading Supabase configuration...');

    // Import the secret config directly
    const supabaseConfig = await import('./supabase-config-secret.js');

    // Create Supabase client directly
    console.log('🔐 Creating Supabase client...');
    const supabaseClient = window.supabase.createClient(
      supabaseConfig.default.supabaseUrl,
      supabaseConfig.default.supabaseAnonKey
    );

    // Make it globally available
    window.supabase = supabaseClient;

    const success = true;

    if (success) {
      console.log('✅ Supabase core initialized successfully');

      // Now import and initialize Supabase services
      const {
        FoodStallsService,
        ArtistsService,
        FloatTrucksService,
        UserFavoritesService,
        RealtimeService,
        initializeDefaultData,
        setSupabaseInstance
      } = await import('./supabase-service.js');

      console.log('✅ Supabase modules loaded successfully');

      // Set the global Supabase instance
      setSupabaseInstance(supabaseClient);

      // Also set it for the auth service
      window.supabase = supabaseClient;

      // Avatar System V2 creates its own Supabase client, so no need to set it here

      // Initialize Supabase data
      await initializeDefaultData();
      supabaseInitialized = true;

      // Load initial data
      await loadInitialData(FoodStallsService, ArtistsService, FloatTrucksService);

      // Set up real-time listeners
      setupRealtimeListeners(RealtimeService);

      console.log('✅ Supabase initialization complete!');

      // Test the connection
      try {
        const { data, error } = await supabaseClient.from('profiles').select('count').limit(1);
        if (error) {
          console.warn('⚠️ Profiles table not found - run the SQL schema first');
        } else {
          console.log('✅ Supabase connection and profiles table working!');
        }
      } catch (error) {
        console.warn('⚠️ Could not test profiles table:', error.message);
      }
    } else {
      throw new Error('Supabase core initialization failed');
    }

  } catch (error) {
    console.error('❌ Supabase initialization failed:', error);
    console.log('📁 No data available - please set up your database tables');

    // Initialize empty arrays
    foodStallsData = [];
    artistsData = [];
    floatTrucksData = [];
  }
}

// Authentication service initialization
async function initializeAuthService() {
  console.log('🔐 Initializing Authentication Service...');

  try {
    // Check if Supabase is available
    if (!window.supabase) {
      console.error('❌ Supabase not available for auth service');
      return false;
    }

    console.log('✅ Supabase ready, loading auth service...');

    // Import and initialize auth service
    const { supabaseAuthService, setSupabaseInstance } = await import('./supabase-auth-service.js');

    // Set the global supabase instance
    setSupabaseInstance(window.supabase);

    // Make auth service globally accessible
    window.authService = supabaseAuthService;

    // Initialize the auth service
    const success = await supabaseAuthService.initialize();

    if (success) {
      // Set up auth state listener
      supabaseAuthService.onAuthStateChanged((user) => {
        console.log('🔐 Auth state changed:', user ? `User: ${user.email}` : 'No user');
        currentUser = user;

        // Update UI based on auth state
        updateAuthenticatedUI(user);
      });

      console.log('✅ Authentication service initialized');
      return true;
    } else {
      console.error('❌ Authentication service initialization failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Authentication service initialization failed:', error);
    return false;
  }
}

// Initialize Modern Profile Service


// Update UI based on authentication state
function updateAuthenticatedUI(user) {
  console.log('🎨 Updating UI for auth state:', user ? 'authenticated' : 'guest');



  if (user) {
    // User is authenticated - enable protected features
    console.log('✅ User authenticated, enabling protected features');

    // Update favorites functionality
    updateFavoritesUI(true);

    // Update any other authenticated-only features
    updateProtectedFeatures(true);

  } else {
    // User is not authenticated - disable protected features
    console.log('👤 Guest user, disabling protected features');

    // Update favorites functionality
    updateFavoritesUI(false);

    // Update any other authenticated-only features
    updateProtectedFeatures(false);
  }
}



// Update favorites UI based on auth state
function updateFavoritesUI(isAuthenticated) {
  // This will be implemented when we add favorites functionality
  console.log('🖤 Favorites UI updated:', isAuthenticated ? 'enabled' : 'disabled');
}

// Update protected features based on auth state
function updateProtectedFeatures(isAuthenticated) {
  // This will be implemented for features that require authentication
  console.log('🔒 Protected features updated:', isAuthenticated ? 'enabled' : 'disabled');
}

// Load initial data from Supabase
async function loadInitialData(FoodStallsService, ArtistsService, FloatTrucksService) {
  try {
    console.log('🚀 Loading data from Supabase...');

    // Load food stalls with detailed logging
    console.log('🍽️ Fetching food stalls from Supabase...');
    foodStallsData = await FoodStallsService.getAllFoodStalls();
    console.log('✅ Loaded food stalls from Supabase:', foodStallsData.length);
    console.log('📊 Food stalls data:', foodStallsData);

    // Load artists with detailed logging
    console.log('🎵 Fetching artists from Supabase...');
    artistsData = await ArtistsService.getAllArtists();
    console.log('✅ Loaded artists from Supabase:', artistsData.length);
    console.log('📊 Artists data:', artistsData);

    // Load float trucks with detailed logging
    console.log('🚛 Fetching float trucks from Supabase...');
    floatTrucksData = await FloatTrucksService.getAllFloatTrucks();
    console.log('✅ Loaded float trucks from Supabase:', floatTrucksData.length);
    console.log('📊 Float trucks data:', floatTrucksData);

    // If no data from Supabase, load sample data for testing
    if (foodStallsData.length === 0) {
      console.log('📝 Loading sample food stalls data...');
      foodStallsData = getSampleFoodStalls();
    }

    if (artistsData.length === 0) {
      console.log('📝 Loading sample artists data...');
      artistsData = getSampleArtists();
    }

    if (floatTrucksData.length === 0) {
      console.log('📝 Loading sample float trucks data...');
      floatTrucksData = getSampleFloatTrucks();
    }

    // Check if data is properly structured
    if (foodStallsData.length > 0) {
      console.log('🔍 Sample food stall structure:', foodStallsData[0]);
    }
    if (artistsData.length > 0) {
      console.log('🔍 Sample artist structure:', artistsData[0]);
    }
    if (floatTrucksData.length > 0) {
      console.log('🔍 Sample float truck structure:', floatTrucksData[0]);
    }

    // Populate the pull-up panel with data
    populatePullUpPanel();

  } catch (error) {
    console.error('❌ Error loading data from Supabase:', error);
    console.log('🔄 Loading sample data for testing...');
    // Initialize with sample data
    foodStallsData = getSampleFoodStalls();
    artistsData = getSampleArtists();
    floatTrucksData = getSampleFloatTrucks();

    // Populate the pull-up panel with sample data
    populatePullUpPanel();
  }
}

// Sample data functions for testing
function getSampleFoodStalls() {
  return [
    {
      id: 1,
      name: "Caribbean Delights",
      cuisine: "Caribbean",
      location: "Ladbroke Grove",
      description: "Authentic Caribbean jerk chicken and rice & peas",
      rating: 4.8,
      price_range: "££",
      image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=150&h=100&fit=crop"
    },
    {
      id: 2,
      name: "Street Food Fusion",
      cuisine: "International",
      location: "Portobello Road",
      description: "Global street food with a carnival twist",
      rating: 4.6,
      price_range: "£",
      image_url: "https://images.unsplash.com/photo-1504674900244-1b47f22f8f54?w=150&h=100&fit=crop"
    },
    {
      id: 3,
      name: "Sweet Treats Corner",
      cuisine: "Desserts",
      location: "Westbourne Park",
      description: "Homemade cakes, ice cream, and carnival sweets",
      rating: 4.9,
      price_range: "£",
      image_url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=150&h=100&fit=crop"
    }
  ];
}

function getSampleArtists() {
  return [
    {
      id: 1,
      name: "Steel Pulse",
      genre: "Reggae",
      stage: "Main Stage",
      time: "14:00",
      description: "Legendary reggae band from Birmingham",
      image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=100&fit=crop"
    },
    {
      id: 2,
      name: "Soca Warriors",
      genre: "Soca",
      stage: "Dance Arena",
      time: "16:30",
      description: "High-energy soca music and dance",
      image_url: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=150&h=100&fit=crop"
    },
    {
      id: 3,
      name: "Carnival Collective",
      genre: "World Music",
      stage: "Community Stage",
      time: "18:00",
      description: "Local artists celebrating carnival culture",
      image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=100&fit=crop"
    }
  ];
}

function getSampleFloatTrucks() {
  return [
    {
      id: 1,
      name: "Dragon Float",
      theme: "Mythical Creatures",
      route: "Main Parade Route",
      description: "Spectacular dragon float with fire effects",
      image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=100&fit=crop"
    },
    {
      id: 2,
      name: "Ocean Waves",
      theme: "Under the Sea",
      route: "Secondary Route",
      description: "Beautiful ocean-themed float with marine life",
      image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=100&fit=crop"
    },
    {
      id: 3,
      name: "Cultural Heritage",
      theme: "Caribbean History",
      route: "Main Parade Route",
      description: "Celebrating Caribbean culture and history",
      image_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&h=100&fit=crop"
    }
  ];
}

// Populate the pull-up panel with data
function populatePullUpPanel() {
  console.log('🎭 Populating pull-up panel with festival data...');

  // Populate food stalls
  const foodStallsList = document.getElementById('food-stalls-list');
  if (foodStallsList && foodStallsData.length > 0) {
    foodStallsList.innerHTML = foodStallsData.map(stall => `
      <div class="content-item">
        <div class="item-image">
          <img src="${stall.image_url}" alt="${stall.name}">
        </div>
        <div class="item-content">
          <div class="item-icon">🍽️</div>
          <div class="item-info">
            <h5>${stall.name}</h5>
            <p>${stall.description}</p>
            <div class="item-location">📍 ${stall.location}</div>
            <div class="item-rating">⭐ ${stall.rating} • ${stall.price_range}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Populate artists
  const artistsList = document.getElementById('artists-list');
  if (artistsList && artistsData.length > 0) {
    artistsList.innerHTML = artistsData.map(artist => `
      <div class="content-item">
        <div class="item-image">
          <img src="${artist.image_url}" alt="${artist.name}">
        </div>
        <div class="item-content">
          <div class="item-icon">🎵</div>
          <div class="item-info">
            <h5>${artist.name}</h5>
            <p>${artist.description}</p>
            <div class="item-location">🎪 ${artist.stage} • 🕐 ${artist.time}</div>
            <div class="item-genre">🎶 ${artist.genre}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Populate float trucks
  const floatTrucksList = document.getElementById('float-trucks-list');
  if (floatTrucksList && floatTrucksData.length > 0) {
    floatTrucksList.innerHTML = floatTrucksData.map(truck => `
      <div class="content-item">
        <div class="item-image">
          <img src="${truck.image_url}" alt="${truck.name}">
        </div>
        <div class="item-content">
          <div class="item-icon">🚛</div>
          <div class="item-info">
            <h5>${truck.name}</h5>
            <p>${truck.description}</p>
            <div class="item-location">📍 ${truck.route}</div>
            <div class="item-theme">🎨 ${truck.theme}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  console.log('✅ Pull-up panel populated with festival data!');
}

// Set up real-time listeners
function setupRealtimeListeners(RealtimeService) {
  try {
    // Listen for food stalls changes
    RealtimeService.subscribeToFoodStalls((foodStalls) => {
      foodStallsData = foodStalls;
      console.log('Food stalls updated in real-time:', foodStalls.length);

      // Update UI if food stalls are currently shown
      const foodStallBtn = document.getElementById('foodStallBtn');
      if (foodStallBtn && foodStallBtn.classList.contains('active')) {
        showFoodStalls();
      }
    });

    // Listen for artists changes
    RealtimeService.subscribeToArtists((artists) => {
      artistsData = artists;
      console.log('Artists updated in real-time:', artists.length);

      // Update UI if artists are currently shown
      const artistBandBtn = document.getElementById('artistBandBtn');
      if (artistBandBtn && artistBandBtn.classList.contains('active')) {
        showArtists();
      }
    });

  } catch (error) {
    console.error('Error setting up real-time listeners:', error);
  }
}

// Data loading functions - now using sample data for testing
function getHardcodedFoodStalls() {
  return getSampleFoodStalls();
}

function getHardcodedArtists() {
  return getSampleArtists();
}

function getHardcodedFloatTrucks() {
  return getSampleFloatTrucks();
}

// Initialize the map
function initMap() {
  // Create map centered on London with zoom controls only
  map = L.map('map', {
    zoomControl: false,       // Remove zoom controls
    attributionControl: false, // Hide attribution
    dragging: true,           // Allow panning
    touchZoom: true,          // Allow touch zoom
    scrollWheelZoom: true,    // Allow mouse wheel zoom
    doubleClickZoom: true,    // Allow double-click zoom
    boxZoom: true,            // Allow box zoom
    keyboard: true,           // Allow keyboard navigation
    tap: true                 // Allow tap zoom
  }).setView([51.5074, -0.1278], 12); // London coordinates, zoom level 12

  // Make map globally accessible
  window.map = map;

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    minZoom: 10
  }).addTo(map);

  // Show medical locations permanently
  showMedicalLocations();

  // Don't show judging zone and start flag initially - they will appear when Notting Hill Carnival is selected
  // showJudgingZone();
  // showStartFlag();
}

// Function to show medical locations (global scope)
function showMedicalLocations() {
  // Medical locations data
  const medicalLocations = [
    { lat: 51.516369, lng: -0.209404, title: 'Medical & Welfare', location: 'Ladbroke Crescent' },
    { lat: 51.520186, lng: -0.212467, title: 'Medical & Welfare', location: 'St Charles Place' },
    { lat: 51.525947, lng: -0.209153, title: 'Medical & Welfare', location: 'Kensal Road' },
    { lat: 51.522245, lng: -0.201107, title: 'Medical & Welfare', location: 'Parking Lot' },
    { lat: 51.518395, lng: -0.195733, title: 'Medical & Welfare', location: "St Stephen's Garden" }
  ];

  // Custom red cross marker icon
  const redCrossIcon = L.divIcon({
    className: 'medical-marker',
    html: '<div style="background: #dc2626; width: 16px; height: 16px; border-radius: 50%; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.8); display: flex; align-items: center; justify-content: center;"><i class="fas fa-plus" style="color: #fff; font-size: 8px;"></i></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  // Add markers for medical locations
  medicalLocations.forEach(location => {
    const marker = L.marker([location.lat, location.lng], { icon: redCrossIcon })
      .bindPopup(`<b>${location.title}</b><br>📍 ${location.location}<br>🏥 Medical & Welfare Services`)
      .addTo(map);
  });

  console.log('Medical locations displayed permanently');
}

// Food stalls functionality
let foodStallMarkers = [];

// Function to show food stalls
function showFoodStalls() {
  // Clear existing food stall markers
  hideFoodStalls();

  console.log('🍽️ Showing food stalls...');
  console.log('📊 Current foodStallsData:', foodStallsData);
  console.log('📊 foodStallsData.length:', foodStallsData.length);

  // Use Supabase data
  const stallsToShow = foodStallsData;
  console.log('🎯 Final stalls to show:', stallsToShow);
  console.log('🎯 Number of stalls to display:', stallsToShow.length);

  // Custom food stall icon
  const foodStallIcon = L.divIcon({
    className: 'food-stall-marker',
    html: '<div style="background: linear-gradient(135deg, #4ade80, #22c55e); width: 20px; height: 20px; border-radius: 50%; box-shadow: 0 4px 20px rgba(74, 222, 128, 0.6); display: flex; align-items: center; justify-content: center; border: 2px solid #fff;"><i class="fas fa-utensils" style="color: #fff; font-size: 10px;"></i></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  // Add markers for food stalls
  stallsToShow.forEach(stall => {
    const popupContent = `
      <div style="padding: 10px; max-width: 180px;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <img src="${stall.image}" alt="${stall.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; margin-right: 8px;">
          <div>
            <h3 style="margin: 0; font-size: 14px; font-weight: 600;">🍽️ ${stall.name}</h3>
            <span style="background: #10b981; color: white; padding: 1px 4px; border-radius: 3px; font-size: 9px;">⭐ ${stall.rating}</span>
          </div>
        </div>
        <p style="margin: 0 0 6px 0; font-size: 11px; color: #666;">${stall.description}</p>
        <p style="margin: 0 0 4px 0; font-size: 10px;">📍 ${stall.location}</p>
        <p style="margin: 0; font-size: 10px;">🕒 ${stall.hours}</p>
        <div style="margin-top: 8px; display: flex; gap: 4px;">
          <button onclick="addToFavorites('foodStalls', '${stall.id}')" style="background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; cursor: pointer;">❤️ Add to Favorites</button>
        </div>
      </div>
    `;

    const marker = L.marker([stall.lat, stall.lng], { icon: foodStallIcon })
      .addTo(map);

    // Bind popup once on creation
    marker.bindPopup(popupContent, {
      maxWidth: 300,
      closeButton: true,
      autoClose: false
    });

    // Add click event for debugging
    marker.on('click', function () {
      console.log('Food stall clicked:', stall.name);
    });

    foodStallMarkers.push(marker);
  });

  console.log('Food stalls displayed on map:', stallsToShow.length);
}

// Function to hide food stalls
function hideFoodStalls() {
  foodStallMarkers.forEach(marker => {
    map.removeLayer(marker);
  });
  foodStallMarkers = [];
  console.log('Food stalls hidden from map');
}

// Artists functionality
let artistMarkers = [];

// Function to show artists
function showArtists() {
  // Clear existing artist markers
  hideArtists();

  console.log('🎵 Showing artists...');
  console.log('📊 Current artistsData:', artistsData);
  console.log('📊 artistsData.length:', artistsData.length);

  // Use Supabase data
  const artistsToShow = artistsData;
  console.log('🎯 Final artists to show:', artistsToShow);
  console.log('🎯 Number of artists to display:', artistsToShow.length);

  // Custom artist icon
  const artistIcon = L.divIcon({
    className: 'artist-marker',
    html: '<div style="background: linear-gradient(135deg, #8b5cf6, #a855f7); width: 20px; height: 20px; border-radius: 50%; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.6); display: flex; align-items: center; justify-content: center; border: 2px solid #fff;"><i class="fas fa-music" style="color: #fff; font-size: 10px;"></i></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  // Add markers for artists
  artistsToShow.forEach(artist => {
    const popupContent = `
      <div style="padding: 10px; max-width: 180px;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <img src="${artist.image}" alt="${artist.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; margin-right: 8px;">
          <div>
            <h3 style="margin: 0; font-size: 14px; font-weight: 600;">🎵 ${artist.name}</h3>
            <span style="background: #8b5cf6; color: white; padding: 1px 4px; border-radius: 3px; font-size: 9px;">⭐ ${artist.rating}</span>
          </div>
        </div>
        <p style="margin: 0 0 6px 0; font-size: 11px; color: #666;">${artist.description}</p>
        <p style="margin: 0 0 4px 0; font-size: 10px;">📍 ${artist.location}</p>
        <p style="margin: 0; font-size: 10px;">🕒 ${artist.performanceTime}</p>
        <div style="margin-top: 8px; display: flex; gap: 4px;">
          <button onclick="addToFavorites('artists', '${artist.id}')" style="background: #3b82f6; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; cursor: pointer;">❤️ Add to Favorites</button>
        </div>
      </div>
    `;

    const marker = L.marker([artist.lat, artist.lng], { icon: artistIcon })
      .addTo(map);

    // Bind popup once on creation
    marker.bindPopup(popupContent, {
      maxWidth: 300,
      closeButton: true,
      autoClose: false
    });

    // Add click event for debugging
    marker.on('click', function () {
      console.log('Artist clicked:', artist.name);
    });

    artistMarkers.push(marker);
  });

  console.log('Artists displayed on map:', artistsToShow.length);
}

// Function to hide artists
function hideArtists() {
  artistMarkers.forEach(marker => {
    map.removeLayer(marker);
  });
  artistMarkers = [];
  console.log('Artists hidden from map');
}

// Function to show judging zone
function showJudgingZone() {
  // Add a marker for the judging zone label
  const judgingMarker = L.marker([51.519641, -0.199500], {
    icon: L.divIcon({
      className: 'judging-zone-marker',
      html: '<div style="background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3); transform: rotate(60deg);">🏆 Judging Zone</div>',
      iconSize: [120, 20],
      iconAnchor: [60, 10]
    })
  }).addTo(map);

  // Add popup for the judging zone
  judgingMarker.bindPopup('<b>🏆 Judging Zone</b><br>📍 Great Western Road<br>🎭 Carnival Performance Area');

  // Store reference to judging marker for responsive scaling
  window.judgingMarker = judgingMarker;

  console.log('Judging zone label displayed on Great Western Road');
}

// Function to show start flag
function showStartFlag() {
  // Start flag coordinates (beginning of carnival route)
  const startFlagCoords = [51.512565, -0.206491]; // A1 - Ladbroke Grove (start point)

  // Create start flag marker
  const startFlag = L.marker(startFlagCoords, {
    icon: L.divIcon({
      className: 'start-flag-marker',
      html: '<div style="background: #10b981; color: white; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; white-space: nowrap; box-shadow: 0 3px 8px rgba(16, 185, 129, 0.4); border: 2px solid #fff; display: flex; align-items: center; gap: 4px;"><span style="font-size: 16px;">🏁</span> START</div>',
      iconSize: [100, 30],
      iconAnchor: [50, 15]
    })
  }).addTo(map);

  // Add popup for the start flag
  startFlag.bindPopup('<b>🏁 Start Point</b><br>📍 Ladbroke Grove<br>🎭 Notting Hill Carnival Route<br>🚶‍♂️ Parade begins here');

  // Store reference to start flag for responsive scaling
  window.startFlag = startFlag;

  console.log('Start flag displayed at Ladbroke Grove');
}

// Initialize search functionality
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const clearButton = document.getElementById('clearButton');
  const searchButton = document.getElementById('searchButton');

  // Show/hide clear button based on input
  searchInput.addEventListener('input', function () {
    if (this.value.length > 0) {
      clearButton.style.display = 'flex';
    } else {
      clearButton.style.display = 'none';
    }
  });

  // Clear button functionality
  clearButton.addEventListener('click', function () {
    searchInput.value = '';
    clearButton.style.display = 'none';
    searchInput.focus();
  });

  // Search button functionality
  searchButton.addEventListener('click', function () {
    performSearch(searchInput.value);
  });

  // Enter key functionality
  searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      performSearch(this.value);
    }
  });

  // Focus search input on page load
  searchInput.focus();
}

// Perform search function
function performSearch(query) {
  if (!query.trim()) {
    return;
  }

  console.log('Searching for:', query);

  // Here you can add actual search functionality
  // For now, we'll just log the search query
  // You can integrate with a geocoding service like:
  // - OpenStreetMap Nominatim API
  // - Google Maps Geocoding API
  // - Mapbox Geocoding API

  // Example search results (you can replace this with real API calls)
  const searchResults = [
    { name: 'Big Ben', lat: 51.4994, lng: -0.1245 },
    { name: 'London Eye', lat: 51.5033, lng: -0.1195 },
    { name: 'Tower Bridge', lat: 51.5055, lng: -0.0754 },
    { name: 'Buckingham Palace', lat: 51.5014, lng: -0.1419 },
    { name: 'Trafalgar Square', lat: 51.5080, lng: -0.1281 }
  ];

  // Find matching results
  const matches = searchResults.filter(result =>
    result.name.toLowerCase().includes(query.toLowerCase())
  );

  if (matches.length > 0) {
    // Zoom to first match
    const firstMatch = matches[0];
    map.setView([firstMatch.lat, firstMatch.lng], 16);
    console.log('Found location:', firstMatch.name);
  } else {
    console.log('No locations found for:', query);
  }
}

// Initialize festivals dropdown functionality
function initFestivalsDropdown() {
  const festivalsButton = document.getElementById('festivalsButton');
  const festivalsDropdown = document.getElementById('festivalsDropdown');
  const dropdownIcon = document.querySelector('.dropdown-icon');

  // Toggle dropdown on button click
  festivalsButton.addEventListener('click', function () {
    const isOpen = festivalsDropdown.classList.contains('show');

    if (isOpen) {
      festivalsDropdown.classList.remove('show');
      dropdownIcon.style.transform = 'rotate(0deg)';
    } else {
      festivalsDropdown.classList.add('show');
      dropdownIcon.style.transform = 'rotate(180deg)';
    }
  });

  // Close dropdown when clicking outside
  function handleClickOutside(e) {
    // Check if dropdown is currently open
    if (festivalsDropdown.classList.contains('show')) {
      // Check if click is outside both the button and dropdown
      if (!festivalsButton.contains(e.target) && !festivalsDropdown.contains(e.target)) {
        festivalsDropdown.classList.remove('show');
        dropdownIcon.style.transform = 'rotate(0deg)';
        console.log('Dropdown closed by clicking outside');
      }
    }
  }

  // Add click outside listener
  document.addEventListener('click', handleClickOutside);

  // Festival item click handlers
  const festivalItems = document.querySelectorAll('.festival-item');
  let selectedFestival = null;
  let carnivalRoute = null;

  festivalItems.forEach(item => {
    item.addEventListener('click', function () {
      const festivalName = this.textContent;

      // Only allow festivals with 'available' class to be clicked
      if (!this.classList.contains('available')) {
        console.log('Festival not available:', festivalName);
        return; // Exit early, don't process the click
      }

      const festivalsText = document.querySelector('.festivals-text');

      // Check if this festival is already selected
      if (selectedFestival === festivalName) {
        // Deselect the festival
        selectedFestival = null;
        festivalsText.textContent = 'UK Festivals';
        this.classList.remove('selected');

        // Hide the carnival route
        if (carnivalRoute) {
          map.removeLayer(carnivalRoute);
          carnivalRoute = null;
        }

        // Hide judging zone and start flag when Notting Hill Carnival is deselected
        if (festivalName.includes('Notting Hill Carnival')) {
          if (window.judgingMarker) {
            map.removeLayer(window.judgingMarker);
            window.judgingMarker = null;
          }
          if (window.startFlag) {
            map.removeLayer(window.startFlag);
            window.startFlag = null;
          }
        }

        console.log('Deselected festival:', festivalName);
      } else {
        // Deselect previous festival if any
        festivalItems.forEach(fest => fest.classList.remove('selected'));

        // Hide previous Notting Hill Carnival elements if they exist
        if (window.judgingMarker) {
          map.removeLayer(window.judgingMarker);
          window.judgingMarker = null;
        }
        if (window.startFlag) {
          map.removeLayer(window.startFlag);
          window.startFlag = null;
        }

        // Select new festival
        selectedFestival = festivalName;
        festivalsText.textContent = festivalName;
        this.classList.add('selected');

        // Show carnival route for Notting Hill Carnival
        showCarnivalRoute();

        // Show judging zone and start flag for Notting Hill Carnival
        if (festivalName.includes('Notting Hill Carnival')) {
          showJudgingZone();
          showStartFlag();
        }

        console.log('Selected festival:', festivalName);
      }

      festivalsDropdown.classList.remove('show');
      dropdownIcon.style.transform = 'rotate(0deg)';
    });
  });



}



// Samsung Galaxy S24 Ultra detection and adjustments
function detectSamsungDevice() {
  const userAgent = navigator.userAgent;
  const isSamsung = userAgent.includes('Samsung') || userAgent.includes('SM-');
  const isS24Ultra = userAgent.includes('SM-S928') || userAgent.includes('S24 Ultra');

  if (isSamsung || isS24Ultra) {
    console.log('📱 Samsung device detected:', userAgent);

    // Add Samsung-specific CSS class
    document.body.classList.add('samsung-device');



    // Adjust search and festival containers - follow 320-360px logic
    const searchContainer = document.querySelector('.search-container');
    const festivalsContainer = document.querySelector('.festivals-container');

    if (searchContainer) {
      searchContainer.style.setProperty('width', '30%', 'important');
      searchContainer.style.setProperty('max-width', '96px', 'important');
    }

    if (festivalsContainer) {
      festivalsContainer.style.setProperty('width', '50%', 'important');
      festivalsContainer.style.setProperty('max-width', '160px', 'important');
    }
  }
}





// Initialize map toolbar functionality
function initMapToolbar() {
  const foodStallBtn = document.getElementById('foodStallBtn');
  const floatTruckBtn = document.getElementById('floatTruckBtn');
  const artistBandBtn = document.getElementById('artistBandBtn');
  const locationCenterBtn = document.getElementById('locationCenterBtn');
  const carnivalTrackerBtn = document.getElementById('carnivalTrackerBtn');

  // Food Stalls button
  foodStallBtn.addEventListener('click', function () {
    toggleButtonActive(this);
    console.log('Food Stalls button clicked');

    if (this.classList.contains('active')) {
      showFoodStalls();
    } else {
      hideFoodStalls();
    }
  });

  // Float Trucks button
  floatTruckBtn.addEventListener('click', function () {
    toggleButtonActive(this);
    console.log('Float Trucks button clicked');
    // Add functionality to show/hide float trucks on map
  });

  // Artists & Bands button
  artistBandBtn.addEventListener('click', function () {
    toggleButtonActive(this);
    console.log('Artists & Bands button clicked');

    if (this.classList.contains('active')) {
      showArtists();
    } else {
      hideArtists();
    }
  });



  // Medical locations data
  let medicalMarkers = [];

  // Location Center button
  let userLocationMarker = null;

  locationCenterBtn.addEventListener('click', function () {
    console.log('Location Center button clicked');
    // Add functionality to center map on user location and show blue dot
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Remove existing user location marker
        if (userLocationMarker) {
          map.removeLayer(userLocationMarker);
        }

        // Create blue dot marker for user location
        const userLocationIcon = L.divIcon({
          className: 'user-location-marker',
          html: '<div style="background: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.6);"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        // Add user location marker
        userLocationMarker = L.marker([userLat, userLng], { icon: userLocationIcon })
          .bindPopup('<b>📍 Your Location</b><br>You are here!')
          .addTo(map);

        // Center map on user location
        map.setView([userLat, userLng], 15);
        console.log('Map centered on user location with blue dot');

        // Toggle button active state
        toggleButtonActive(locationCenterBtn);
      }, function (error) {
        console.log('Error getting location:', error);
        // Fallback to London center
        map.setView([51.5074, -0.1278], 12);
      });
    } else {
      console.log('Geolocation not supported');
      // Fallback to London center
      map.setView([51.5074, -0.1278], 12);
    }
  });

  // Carnival Tracker button (replaces the old Groups button)
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

  // Profile button removed - using avatar system instead
  // The avatar system handles all profile functionality

  console.log('🎭 Carnival tracker button event listener added (replaces Groups button)');
}

// Toggle button active state
function toggleButtonActive(button) {
  const isActive = button.classList.contains('active');

  if (isActive) {
    button.classList.remove('active');
  } else {
    button.classList.add('active');
  }
}

// Profile menu functionality moved to avatar system
// The avatar system handles all profile and authentication UI

// Initialize pull-up panel functionality
function initPullUpPanel() {
  console.log('🔧 Initializing pull-up panel...');

  const pullUpPanel = document.getElementById('pullUpPanel');
  const panelHandle = document.querySelector('.panel-handle');
  const closePanel = document.getElementById('closePanel');

  console.log('🔧 Pull-up panel elements found:', {
    pullUpPanel: !!pullUpPanel,
    panelHandle: !!panelHandle,
    closePanel: !!closePanel
  });

  if (!pullUpPanel || !panelHandle || !closePanel) {
    console.error('❌ Pull-up panel elements not found!');
    return;
  }

  let isExpanded = false;
  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  // Handle click to expand/collapse
  panelHandle.addEventListener('click', function (e) {
    e.stopPropagation();
    console.log('🎯 Panel handle clicked - current state:', isExpanded);
    togglePanel();
  });

  // Close button functionality
  closePanel.addEventListener('click', function (e) {
    e.stopPropagation();
    console.log('🎯 Close button clicked');
    collapsePanel();
  });

  // Touch events for drag functionality
  panelHandle.addEventListener('touchstart', function (e) {
    e.preventDefault();
    startY = e.touches[0].clientY;
    isDragging = true;
  });

  panelHandle.addEventListener('touchmove', function (e) {
    if (!isDragging) return;
    e.preventDefault();
    currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    if (isExpanded && deltaY > 50) {
      // Dragging down from expanded state
      collapsePanel();
      isDragging = false;
    } else if (!isExpanded && deltaY < -50) {
      // Dragging up from collapsed state
      expandPanel();
      isDragging = false;
    }
  });

  panelHandle.addEventListener('touchend', function (e) {
    isDragging = false;
  });

  // Mouse events for desktop drag functionality
  panelHandle.addEventListener('mousedown', function (e) {
    e.preventDefault();
    startY = e.clientY;
    isDragging = true;
  });

  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    currentY = e.clientY;
    const deltaY = currentY - startY;

    if (isExpanded && deltaY > 50) {
      collapsePanel();
      isDragging = false;
    } else if (!isExpanded && deltaY < -50) {
      expandPanel();
      isDragging = false;
    }
  });

  document.addEventListener('mouseup', function (e) {
    isDragging = false;
  });

  function togglePanel() {
    if (isExpanded) {
      collapsePanel();
    } else {
      expandPanel();
    }
  }

  function expandPanel() {
    console.log('📈 Expanding panel...');
    pullUpPanel.classList.add('expanded');
    isExpanded = true;
    console.log('✅ Panel expanded - class added:', pullUpPanel.classList.contains('expanded'));
  }

  function collapsePanel() {
    console.log('📉 Collapsing panel...');
    pullUpPanel.classList.remove('expanded');
    isExpanded = false;
    console.log('✅ Panel collapsed - class removed:', !pullUpPanel.classList.contains('expanded'));
  }

  // Tab functionality
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(button => {
    button.addEventListener('click', function (e) {
      e.stopPropagation();
      const targetTab = this.getAttribute('data-tab');

      // Remove active class from all tabs and panes
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));

      // Add active class to clicked tab and corresponding pane
      this.classList.add('active');
      document.getElementById(targetTab).classList.add('active');

      console.log('Switched to tab:', targetTab);
    });
  });

  // Content item click functionality
  const contentItems = document.querySelectorAll('.content-item');
  contentItems.forEach(item => {
    item.addEventListener('click', function (e) {
      e.stopPropagation();
      const itemTitle = this.querySelector('h5').textContent;
      const itemLocation = this.querySelector('.item-location').textContent;

      console.log('Selected item:', itemTitle, 'at', itemLocation);
      // Add functionality to show item on map or get directions
    });
  });

  // Settings toggle functionality
  const settingToggles = document.querySelectorAll('.switch input');
  settingToggles.forEach(toggle => {
    toggle.addEventListener('change', function (e) {
      e.stopPropagation();
      const settingName = this.closest('.setting-item').querySelector('h5').textContent;
      const isEnabled = this.checked;

      console.log('Setting changed:', settingName, 'enabled:', isEnabled);
      // Add functionality to save settings
    });
  });
}

// Function to calculate responsive zoom dimensions
function calculateResponsiveZoom() {
  // Get current map zoom level
  const currentZoom = map.getZoom();

  // Get current map bounds
  const bounds = map.getBounds();
  const northEast = bounds.getNorthEast();
  const southWest = bounds.getSouthWest();

  // Calculate visible area dimensions
  const latDiff = northEast.lat - southWest.lat;
  const lngDiff = northEast.lng - southWest.lng;

  // Calculate responsive scaling based on zoom level
  let responsiveScale = 1;

  if (currentZoom <= 10) {
    // Very zoomed out - scale down UI elements
    responsiveScale = 0.7;
  } else if (currentZoom <= 12) {
    // City level - normal scale
    responsiveScale = 1.0;
  } else if (currentZoom <= 14) {
    // Neighborhood level - slightly larger
    responsiveScale = 1.2;
  } else if (currentZoom <= 16) {
    // Street level - larger elements
    responsiveScale = 1.5;
  } else {
    // Very zoomed in - largest elements
    responsiveScale = 2.0;
  }

  // Calculate pixel dimensions (approximate)
  const mapContainer = document.getElementById('map');
  const mapWidth = mapContainer.offsetWidth;
  const mapHeight = mapContainer.offsetHeight;

  // Calculate meters per pixel (approximate)
  const metersPerPixel = (latDiff * 111000) / mapHeight; // 1 degree ≈ 111km

  console.log('Zoom Level:', currentZoom);
  console.log('Responsive Scale:', responsiveScale);
  console.log('Visible Area (lat/lng):', latDiff.toFixed(4), 'x', lngDiff.toFixed(4));
  console.log('Map Dimensions (px):', mapWidth, 'x', mapHeight);
  console.log('Meters per pixel:', metersPerPixel.toFixed(2));

  return {
    zoom: currentZoom,
    scale: responsiveScale,
    bounds: bounds,
    dimensions: {
      width: mapWidth,
      height: mapHeight,
      latDiff: latDiff,
      lngDiff: lngDiff,
      metersPerPixel: metersPerPixel
    }
  };
}

// Function to apply responsive scaling to UI elements
function applyResponsiveScaling() {
  const zoomData = calculateResponsiveZoom();
  const scale = zoomData.scale;

  // Get current screen width
  const screenWidth = window.innerWidth;

  // Apply scaling to different UI elements based on zoom level
  const elements = {
    // All elements now handled separately for 320px breakpoint
    // Exclude searchBar, festivalsButton, profileContainer, and toolbar for screens 320px and above
    // Exclude pullUpPanel to avoid transform conflicts
  };

  // Apply transform scale to elements
  Object.values(elements).forEach(element => {
    if (element) {
      element.style.transform = `scale(${scale})`;
      element.style.transformOrigin = 'top left';
    }
  });



  // Handle search bar separately - only scale if screen width is below 320px
  const searchBar = document.querySelector('.search-container');
  if (searchBar) {
    if (screenWidth < 320) {
      // Scale search bar only for very small screens
      searchBar.style.transform = `scale(${scale})`;
      searchBar.style.transformOrigin = 'top left';
    } else {
      // Remove any scaling for screens 320px and above
      searchBar.style.transform = 'none';
    }
  }

  // Handle UK Festivals button separately - scale based on screen width
  const festivalsButton = document.querySelector('.festivals-container');
  if (festivalsButton) {
    if (screenWidth < 320) {
      // Scale festivals button only for very small screens
      festivalsButton.style.transform = `scale(${scale})`;
      festivalsButton.style.transformOrigin = 'top left';

      // Adjust font size based on scale for small screens
      const festivalsText = festivalsButton.querySelector('.festivals-text');
      if (festivalsText) {
        const baseFontSize = 12; // Base font size from CSS
        const scaledFontSize = baseFontSize * scale;
        festivalsText.style.fontSize = `${scaledFontSize}px`;
      }
    } else {
      // Apply 30% drop scaling for screens 320px and above (matching toolbar)
      const buttonScale = 0.7;
      festivalsButton.style.transform = `scale(${buttonScale})`;
      festivalsButton.style.transformOrigin = 'top left';

      // Adjust font size based on scale
      const festivalsText = festivalsButton.querySelector('.festivals-text');
      if (festivalsText) {
        const baseFontSize = 12; // Base font size from CSS
        const scaledFontSize = baseFontSize * buttonScale;
        festivalsText.style.fontSize = `${scaledFontSize}px`;
      }
    }
  }

  // Handle toolbar separately - scale based on screen width
  const toolbar = document.querySelector('.map-toolbar');
  if (toolbar) {
    if (screenWidth < 320) {
      // Scale toolbar only for very small screens
      toolbar.style.transform = `scale(${scale})`;
      toolbar.style.transformOrigin = 'top left';
    } else {
      // Drop toolbar by 30% for screens 320px and above
      toolbar.style.transform = 'scale(0.7)';
      toolbar.style.transformOrigin = 'top left';
    }
  }

  console.log('Applied responsive scaling:', scale, 'Screen width:', screenWidth, 'Search bar scaled:', screenWidth < 320, 'Festivals scaled:', screenWidth < 320, 'Toolbar scaled:', screenWidth < 320 ? scale : '0.7 (30% drop)');

  // Handle judging zone label scaling
  handleJudgingZoneScaling(zoomData.zoom, screenWidth);

  // Handle start flag scaling
  handleStartFlagScaling(zoomData.zoom, screenWidth);
}

// Function to handle judging zone label scaling
function handleJudgingZoneScaling(zoomLevel, screenWidth) {
  if (!window.judgingMarker) return;

  let shouldScale = true;
  let scaleValue = 1;

  // Determine if scaling should be applied based on zoom level and screen width
  if (screenWidth >= 320) {
    // For screens 320px and above
    if (zoomLevel >= 16 && zoomLevel <= 18) {
      // Stop scaling between zoom 16-18
      shouldScale = false;
      scaleValue = 1;
    } else if (zoomLevel < 16) {
      // Scale down for zoom levels below 16
      scaleValue = Math.max(0.7, 1 - (16 - zoomLevel) * 0.1);
    } else if (zoomLevel > 18) {
      // Scale up for zoom levels above 18
      scaleValue = 1 + (zoomLevel - 18) * 0.2;
    }
  } else {
    // For screens below 320px, use normal responsive scaling
    if (zoomLevel <= 10) scaleValue = 0.7;
    else if (zoomLevel <= 12) scaleValue = 1.0;
    else if (zoomLevel <= 14) scaleValue = 1.2;
    else if (zoomLevel <= 16) scaleValue = 1.5;
    else scaleValue = 2.0;
  }

  // Apply scaling to judging zone label
  if (shouldScale) {
    window.judgingMarker.setIcon(L.divIcon({
      className: 'judging-zone-marker',
      html: `<div style="background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: ${10 * scaleValue}px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3); transform: scale(${scaleValue}) rotate(60deg);">🏆 Judging Zone</div>`,
      iconSize: [120 * scaleValue, 20 * scaleValue],
      iconAnchor: [60 * scaleValue, 10 * scaleValue]
    }));
  } else {
    // Reset to default size when scaling is disabled
    window.judgingMarker.setIcon(L.divIcon({
      className: 'judging-zone-marker',
      html: '<div style="background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.3); transform: rotate(60deg);">🏆 Judging Zone</div>',
      iconSize: [120, 20],
      iconAnchor: [60, 10]
    }));
  }

  console.log('Judging zone scaling - Zoom:', zoomLevel, 'Screen width:', screenWidth, 'Scale:', scaleValue, 'Should scale:', shouldScale);
}

// Function to handle start flag scaling
function handleStartFlagScaling(zoomLevel, screenWidth) {
  if (!window.startFlag) return;

  let shouldScale = true;
  let scaleValue = 1;

  // Determine if scaling should be applied based on zoom level and screen width
  if (screenWidth >= 320) {
    // For screens 320px and above
    if (zoomLevel >= 16 && zoomLevel <= 18) {
      // Stop scaling between zoom 16-18
      shouldScale = false;
      scaleValue = 1;
    } else if (zoomLevel < 16) {
      // Scale down for zoom levels below 16
      scaleValue = Math.max(0.7, 1 - (16 - zoomLevel) * 0.1);
    } else if (zoomLevel > 18) {
      // Scale up for zoom levels above 18
      scaleValue = 1 + (zoomLevel - 18) * 0.2;
    }
  } else {
    // For screens below 320px, use normal responsive scaling
    if (zoomLevel <= 10) scaleValue = 0.7;
    else if (zoomLevel <= 12) scaleValue = 1.0;
    else if (zoomLevel <= 14) scaleValue = 1.2;
    else if (zoomLevel <= 16) scaleValue = 1.5;
    else scaleValue = 2.0;
  }

  // Apply scaling to start flag
  if (shouldScale) {
    window.startFlag.setIcon(L.divIcon({
      className: 'start-flag-marker',
      html: `<div style="background: #10b981; color: white; padding: 6px 10px; border-radius: 6px; font-size: ${12 * scaleValue}px; font-weight: bold; white-space: nowrap; box-shadow: 0 3px 8px rgba(16, 185, 129, 0.4); border: 2px solid #fff; display: flex; align-items: center; gap: 4px; transform: scale(${scaleValue});"><span style="font-size: ${16 * scaleValue}px;">🏁</span> START</div>`,
      iconSize: [100 * scaleValue, 30 * scaleValue],
      iconAnchor: [50 * scaleValue, 15 * scaleValue]
    }));
  } else {
    // Reset to default size when scaling is disabled
    window.startFlag.setIcon(L.divIcon({
      className: 'start-flag-marker',
      html: '<div style="background: #10b981; color: white; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; white-space: nowrap; box-shadow: 0 3px 8px rgba(16, 185, 129, 0.4); border: 2px solid #fff; display: flex; align-items: center; gap: 4px;"><span style="font-size: 16px;">🏁</span> START</div>',
      iconSize: [100, 30],
      iconAnchor: [50, 15]
    }));
  }

  console.log('Start flag scaling - Zoom:', zoomLevel, 'Screen width:', screenWidth, 'Scale:', scaleValue, 'Should scale:', shouldScale);
}

// Favorites functionality
async function addToFavorites(type, itemId) {
  try {
    if (!supabaseInitialized) {
      showNotification('Supabase not connected. Please set up Supabase configuration.', 'error');
      return;
    }

    // Dynamic import for UserFavoritesService
    const { UserFavoritesService } = await import('./supabase-service.js');

    // For now, use a temporary user ID (will be replaced with actual auth)
    const tempUserId = 'temp-user-' + Date.now();

    await UserFavoritesService.addToFavorites(tempUserId, type, itemId);
    console.log(`Added ${type} item ${itemId} to favorites`);

    // Show success message
    showNotification(`Added to favorites!`, 'success');

  } catch (error) {
    console.error('Error adding to favorites:', error);
    showNotification('Failed to add to favorites', 'error');
  }
}

// Notification system
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    ${type === 'success' ? 'background: #10b981;' : ''}
    ${type === 'error' ? 'background: #ef4444;' : ''}
    ${type === 'info' ? 'background: #3b82f6;' : ''}
  `;
  notification.textContent = message;

  // Add to page
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add zoom event listener to map
function initResponsiveZoom() {
  map.on('zoomend', function () {
    applyResponsiveScaling();
  });

  // Handle window resize for toolbar scaling
  window.addEventListener('resize', function () {
    applyResponsiveScaling();
  });

  // Initial calculation
  applyResponsiveScaling();
}

// Global carnival route state
window.carnivalRouteActive = false;
window.carnivalRoute = null;

// Global carnival route function
function showCarnivalRoute() {
  // Remove existing route if any
  if (window.carnivalRoute) {
    map.removeLayer(window.carnivalRoute);
  }

  // Carnival route coordinates
  const carnivalRouteCoords = [
    [51.512565, -0.206491], // A1 - Ladbroke Grove
    [51.513412, -0.207095], // A2
    [51.513876, -0.207439], // A3
    [51.514257, -0.207705], // A4
    [51.515175, -0.208372], // A5
    [51.516227, -0.209131], // A6
    [51.516945, -0.209692], // A7
    [51.517616, -0.210155], // A8
    [51.517915, -0.210328], // A9
    [51.518306, -0.210546], // A10
    [51.518959, -0.210919], // A11
    [51.519609, -0.211299], // A12
    [51.520169, -0.211619], // A13
    [51.520670, -0.211909], // A14
    [51.521160, -0.212196], // A15
    [51.521639, -0.212464], // A16
    [51.522116, -0.212742], // A17
    [51.522353, -0.212883], // A18
    [51.522966, -0.213237], // A19
    [51.523684, -0.213660], // A20
    [51.524082, -0.213921], // A21
    [51.524327, -0.213996], // A22
    [51.525289, -0.214583], // A23
    [51.525740, -0.214874], // A24
    [51.525909, -0.215061], // A25
    [51.526085, -0.215144], // A26
    [51.526336, -0.215253], // A29 - Kensal Rd
    [51.526310, -0.213861], // B1
    [51.526270, -0.212296], // B2
    [51.526242, -0.211541], // B3
    [51.526186, -0.210546], // B4
    [51.526127, -0.209911], // B5
    [51.526004, -0.209122], // B6
    [51.525930, -0.208710], // B7
    [51.525820, -0.208111], // B8
    [51.525691, -0.207379], // B9
    [51.525598, -0.206951], // B10
    [51.525475, -0.206583], // B11
    [51.525399, -0.206423], // B12
    [51.525235, -0.206137], // B13
    [51.524480, -0.205508], // B14
    [51.524295, -0.205380], // C1 - Golbourne Rd
    [51.524214, -0.205371], // C2
    [51.524129, -0.205661], // C3
    [51.524048, -0.205953], // C4
    [51.523901, -0.206208], // C5
    [51.523697, -0.206490], // C6
    [51.523589, -0.206582], // C7
    [51.523308, -0.206721], // C8
    [51.523212, -0.206733], // C9
    [51.523150, -0.206637], // C10
    [51.523124, -0.206516], // D1 - Elkstone Road
    [51.523059, -0.206407], // D2
    [51.522984, -0.206246], // D3
    [51.522871, -0.206050], // D4
    [51.522714, -0.205583], // D5
    [51.522626, -0.205293], // D6
    [51.522480, -0.204769], // D7
    [51.522359, -0.204341], // D8
    [51.522286, -0.204071], // D9
    [51.522257, -0.203941], // D10
    [51.522244, -0.203688], // D11
    [51.522315, -0.203307], // D12
    [51.522393, -0.203068], // D13
    [51.522420, -0.202845], // D14
    [51.522409, -0.202589], // D15
    [51.522330, -0.202250], // D16
    [51.522233, -0.201823], // D17
    [51.522189, -0.201602], // D18
    [51.522114, -0.201366], // D19
    [51.521849, -0.201236], // E1
    [51.521627, -0.201093], // E2
    [51.521353, -0.200893], // E3
    [51.521025, -0.200637], // E4
    [51.520742, -0.200437], // E5
    [51.518595, -0.198448], // E6
    [51.518613, -0.198423], // F - Westbourne Park Road
    [51.519079, -0.196369], // G - Westbourne Park Road
    [51.515062, -0.195045], // H - Chepstow Rd
    [51.514405, -0.200323], // I - Westbourne Grove
    [51.512588, -0.206464]  // J - Ladbroke Gardens (back to A1)
  ];

  // Create polyline for the route
  window.carnivalRoute = L.polyline(carnivalRouteCoords, {
    color: '#ff6b35',
    weight: 6,
    opacity: 0.8,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(map);

  // Add orange markers for key points
  const keyPoints = [
    { lat: 51.512565, lng: -0.206491, title: 'Start - Ladbroke Grove' },
    { lat: 51.526336, lng: -0.215253, title: 'Kensal Road' },
    { lat: 51.524295, lng: -0.205380, title: 'Golbourne Road' },
    { lat: 51.523124, lng: -0.206516, title: 'Elkstone Road' },
    { lat: 51.518613, lng: -0.198423, title: 'Westbourne Park Road' },
    { lat: 51.512588, lng: -0.206464, title: 'End - Ladbroke Gardens' }
  ];

  // Custom orange marker icon
  const orangeIcon = L.divIcon({
    className: 'carnival-marker',
    html: '<div style="background: #ff6b35; width: 12px; height: 12px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 8px rgba(255, 107, 53, 0.4);"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  // Add markers for key points
  keyPoints.forEach(point => {
    L.marker([point.lat, point.lng], { icon: orangeIcon })
      .bindPopup(`<b>${point.title}</b><br>Notting Hill Carnival Route`)
      .addTo(map);
  });

  // Fit map to show the entire route
  map.fitBounds(window.carnivalRoute.getBounds(), { padding: [20, 20] });

  // Set global state
  window.carnivalRouteActive = true;

  console.log('Notting Hill Carnival route displayed');
  console.log('Global carnival route state set to:', window.carnivalRouteActive);
}

// Expose carnival route functions globally for avatar system
window.showCarnivalRoute = showCarnivalRoute;
window.showJudgingZone = showJudgingZone;
window.showStartFlag = showStartFlag;

// Test Supabase connection function
window.testSupabaseConnection = async function () {
  console.log('🔐 Testing Supabase connection...');
  console.log('🔐 Checking if Supabase client exists:', !!window.supabase);
  console.log('🔐 Checking if supabaseClient exists:', !!window.supabaseClient);

  try {
    // Test basic connection
    const { data, error } = await window.supabase.from('profiles').select('count').limit(1);

    if (error) {
      console.error('❌ Supabase connection failed:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);

      if (error.code === 'PGRST116') {
        console.error('❌ Profiles table does not exist! Please run the SQL schema.');
      }

      return false;
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('✅ Profiles table accessible');
      return true;
    }
  } catch (error) {
    console.error('❌ Supabase test failed:', error);
    return false;
  }
};

// Test authentication flow
window.testAuthFlow = async function () {
  console.log('🔐 Testing authentication flow...');

  try {
    // Test sign up
    const { data, error } = await window.supabase.auth.signUp({
      email: 'your-email@gmail.com',
      password: 'your-password'
    });

    if (error) {
      console.error('❌ Sign up test failed:', error);
    } else {
      console.log('✅ Sign up test successful:', data);
    }

    return { data, error };
  } catch (error) {
    console.error('❌ Auth flow test failed:', error);
    return { error };
  }
};

// Simple connection test
window.simpleTest = function () {
  console.log('🔐 Simple Supabase test...');
  console.log('🔐 window.supabase exists:', !!window.supabase);
  console.log('🔐 window.supabase.auth exists:', !!(window.supabase && window.supabase.auth));
  console.log('🔐 window.supabase.from exists:', !!(window.supabase && window.supabase.from));

  if (window.supabase) {
    console.log('✅ Supabase client is available');
    return true;
  } else {
    console.error('❌ Supabase client is not available');
    return false;
  }
};


