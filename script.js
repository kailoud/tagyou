// TagYou2 London Map - Clean Version with Search
let map;

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
  console.log('TagYou2 London Map loaded successfully!');

  // Initialize the map
  initMap();

  // Initialize search functionality
  initSearch();

  // Initialize festivals dropdown
  initFestivalsDropdown();

  // Initialize profile button
  initProfileButton();

  // Initialize map toolbar
  initMapToolbar();

  // Initialize pull-up panel
  initPullUpPanel();

  // Initialize responsive zoom functionality
  initResponsiveZoom();
});

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

// Food stalls data and functionality
let foodStallMarkers = [];

// Food stalls data within Notting Hill Carnival boundaries
const foodStalls = [
  {
    id: 1,
    name: "Caribbean Spice Kitchen",
    lat: 51.5198,
    lng: -0.2015,
    location: "Ladbroke Grove",
    description: "Authentic Jamaican jerk chicken and Caribbean cuisine",
    specialties: ["Jerk Chicken", "Curry Goat", "Rice & Peas", "Plantain"],
    rating: 4.8,
    priceRange: "££",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    hours: "11:00 AM - 8:00 PM",
    phone: "+44 20 7123 4567"
  },
  {
    id: 2,
    name: "Notting Hill Jerk House",
    lat: 51.5212,
    lng: -0.1987,
    location: "Portobello Road",
    description: "Traditional jerk chicken with secret family recipe",
    specialties: ["Jerk Chicken", "Jerk Pork", "Ackee & Saltfish", "Callaloo"],
    rating: 4.9,
    priceRange: "££",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
    hours: "10:00 AM - 9:00 PM",
    phone: "+44 20 7123 4568"
  },
  {
    id: 3,
    name: "Island Flavours",
    lat: 51.5185,
    lng: -0.2043,
    location: "Westbourne Grove",
    description: "Fresh Caribbean street food and traditional dishes",
    specialties: ["Jerk Chicken", "Roti", "Doubles", "Sorrel Drink"],
    rating: 4.7,
    priceRange: "£",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    hours: "12:00 PM - 7:00 PM",
    phone: "+44 20 7123 4569"
  }
];

// Function to show food stalls
function showFoodStalls() {
  // Clear existing food stall markers
  hideFoodStalls();

  // Custom food stall icon
  const foodStallIcon = L.divIcon({
    className: 'food-stall-marker',
    html: '<div style="background: linear-gradient(135deg, #4ade80, #22c55e); width: 20px; height: 20px; border-radius: 50%; box-shadow: 0 3px 10px rgba(74, 222, 128, 0.6); display: flex; align-items: center; justify-content: center; border: 2px solid #fff;"><i class="fas fa-utensils" style="color: #fff; font-size: 10px;"></i></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  // Add markers for food stalls
  foodStalls.forEach(stall => {
    const popupContent = `
      <div style="max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="margin-bottom: 12px;">
          <img src="${stall.image}" alt="${stall.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
        </div>
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 700;">${stall.name}</h3>
        <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; line-height: 1.4;">${stall.description}</p>
        <div style="margin-bottom: 8px;">
          <span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600;">⭐ ${stall.rating}</span>
          <span style="background: #f59e0b; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-left: 4px;">${stall.priceRange}</span>
        </div>
        <div style="margin-bottom: 8px;">
          <strong style="color: #374151; font-size: 12px;">📍 ${stall.location}</strong>
        </div>
        <div style="margin-bottom: 8px;">
          <strong style="color: #374151; font-size: 12px;">🕒 ${stall.hours}</strong>
        </div>
        <div style="margin-bottom: 8px;">
          <strong style="color: #374151; font-size: 12px;">📞 ${stall.phone}</strong>
        </div>
        <div style="margin-bottom: 8px;">
          <strong style="color: #374151; font-size: 12px;">🍽️ Specialties:</strong>
          <div style="margin-top: 4px;">
            ${stall.specialties.map(item => `<span style="background: #f3f4f6; color: #374151; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-right: 4px; margin-bottom: 4px; display: inline-block;">${item}</span>`).join('')}
          </div>
        </div>
      </div>
    `;

    const marker = L.marker([stall.lat, stall.lng], { icon: foodStallIcon })
      .bindPopup(popupContent, { maxWidth: 300 })
      .addTo(map);

    foodStallMarkers.push(marker);
  });

  console.log('Food stalls displayed on map');
}

// Function to hide food stalls
function hideFoodStalls() {
  foodStallMarkers.forEach(marker => {
    map.removeLayer(marker);
  });
  foodStallMarkers = [];
  console.log('Food stalls hidden from map');
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
  document.addEventListener('click', function (e) {
    if (!festivalsButton.contains(e.target) && !festivalsDropdown.contains(e.target)) {
      festivalsDropdown.classList.remove('show');
      dropdownIcon.style.transform = 'rotate(0deg)';
    }
  });

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

  // Function to show carnival route
  function showCarnivalRoute() {
    // Remove existing route if any
    if (carnivalRoute) {
      map.removeLayer(carnivalRoute);
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
    carnivalRoute = L.polyline(carnivalRouteCoords, {
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
    map.fitBounds(carnivalRoute.getBounds(), { padding: [20, 20] });

    console.log('Notting Hill Carnival route displayed');
  }
}

// Initialize profile button functionality
function initProfileButton() {
  const profileButton = document.getElementById('profileButton');
  const profileDropdown = document.getElementById('profileDropdown');
  const toggleSwitch = document.getElementById('toggleSwitch');

  // Profile button click handler
  profileButton.addEventListener('click', function (e) {
    e.stopPropagation();
    const isOpen = profileDropdown.classList.contains('show');

    if (isOpen) {
      profileDropdown.classList.remove('show');
    } else {
      profileDropdown.classList.add('show');
    }
    console.log('Profile dropdown toggled');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function (e) {
    if (!profileButton.contains(e.target) && !profileDropdown.contains(e.target)) {
      profileDropdown.classList.remove('show');
    }
  });

  // Profile menu item click handlers
  const profileMenuItems = document.querySelectorAll('.profile-menu-item');
  profileMenuItems.forEach(item => {
    item.addEventListener('click', function (e) {
      e.stopPropagation();
      const itemId = this.id;
      const itemText = this.querySelector('span').textContent;

      console.log('Profile menu item clicked:', itemText);

      // Handle different menu items
      switch (itemId) {
        case 'profileMenuItem':
          console.log('Opening profile page...');
          // Add functionality to open profile page
          break;
        case 'favoritesMenuItem':
          console.log('Opening favorites...');
          // Add functionality to show favorites
          break;
        case 'historyMenuItem':
          console.log('Opening recent activity...');
          // Add functionality to show activity history
          break;
        case 'notificationsMenuItem':
          console.log('Opening notifications...');
          // Add functionality to show notifications
          break;
        case 'settingsMenuItem':
          console.log('Opening settings...');
          // Add functionality to open settings
          break;
        case 'helpMenuItem':
          console.log('Opening help & support...');
          // Add functionality to show help
          break;
        case 'logoutMenuItem':
          console.log('Signing out...');
          // Add logout functionality
          if (confirm('Are you sure you want to sign out?')) {
            console.log('User confirmed logout');
            profileDropdown.classList.remove('show');
            // Add actual logout logic here
          }
          break;
        default:
          console.log('Unknown menu item clicked');
      }
    });
  });

  // Toggle switch click handler
  toggleSwitch.addEventListener('click', function () {
    const isEnabled = this.classList.contains('enabled');

    if (isEnabled) {
      this.classList.remove('enabled');
      this.classList.add('disabled');
      this.setAttribute('aria-checked', 'false');
      console.log('Toggle switched OFF');
    } else {
      this.classList.remove('disabled');
      this.classList.add('enabled');
      this.setAttribute('aria-checked', 'true');
      console.log('Toggle switched ON');
    }
  });
}

// Initialize map toolbar functionality
function initMapToolbar() {
  const groupsBtn = document.getElementById('groupsBtn');
  const foodStallBtn = document.getElementById('foodStallBtn');
  const floatTruckBtn = document.getElementById('floatTruckBtn');
  const artistBandBtn = document.getElementById('artistBandBtn');
  const festivalBtn = document.getElementById('festivalBtn');
  const locationCenterBtn = document.getElementById('locationCenterBtn');

  // Groups button
  groupsBtn.addEventListener('click', function () {
    toggleButtonActive(this);
    console.log('Groups button clicked');
    // Add functionality to show/hide groups on map
  });

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
    // Add functionality to show/hide artists/bands on map
  });

  // Festival button
  festivalBtn.addEventListener('click', function () {
    toggleButtonActive(this);
    console.log('Festival button clicked');

    // Automatically select Notting Hill Carnival when festival button is clicked
    const nottingHillItem = document.querySelector('.festival-item.available');
    if (nottingHillItem) {
      // Simulate click on Notting Hill Carnival item
      nottingHillItem.click();
      console.log('Notting Hill Carnival automatically selected via festival button');
    } else {
      console.log('Notting Hill Carnival item not found');
    }
  });

  // Medical locations data
  let medicalMarkers = [];

  // Location Center button
  locationCenterBtn.addEventListener('click', function () {
    console.log('Location Center button clicked');
    // Add functionality to center map on user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        map.setView([position.coords.latitude, position.coords.longitude], 15);
        console.log('Map centered on user location');
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

// Initialize pull-up panel functionality
function initPullUpPanel() {
  const pullUpPanel = document.getElementById('pullUpPanel');
  const panelHandle = document.querySelector('.panel-handle');
  const closePanel = document.getElementById('closePanel');
  let isExpanded = false;
  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  // Handle click to expand/collapse
  panelHandle.addEventListener('click', function (e) {
    e.stopPropagation();
    console.log('Panel handle clicked - current state:', isExpanded);
    togglePanel();
  });

  // Close button functionality
  closePanel.addEventListener('click', function (e) {
    e.stopPropagation();
    console.log('Close button clicked');
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
    pullUpPanel.classList.add('expanded');
    isExpanded = true;
    console.log('Panel expanded - class added:', pullUpPanel.classList.contains('expanded'));
  }

  function collapsePanel() {
    pullUpPanel.classList.remove('expanded');
    isExpanded = false;
    console.log('Panel collapsed - class removed:', !pullUpPanel.classList.contains('expanded'));
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

  // Handle profile container (includes switch and profile button) separately - only scale if screen width is below 320px
  const profileContainer = document.querySelector('.profile-container');
  if (profileContainer) {
    if (screenWidth < 320) {
      // Scale profile container only for very small screens
      profileContainer.style.transform = `scale(${scale})`;
      profileContainer.style.transformOrigin = 'top left';
    } else {
      // Remove any scaling for screens 320px and above
      profileContainer.style.transform = 'none';
    }
  }

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

  console.log('Applied responsive scaling:', scale, 'Screen width:', screenWidth, 'Search bar scaled:', screenWidth < 320, 'Festivals scaled:', screenWidth < 320, 'Profile scaled:', screenWidth < 320, 'Toolbar scaled:', screenWidth < 320 ? scale : '0.7 (30% drop)');

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
