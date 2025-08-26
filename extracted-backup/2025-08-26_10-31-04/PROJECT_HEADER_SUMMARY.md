# TagYou2 London Map - Project Header Summary

## 📋 **Project Overview**
- **Project Name:** TagYou2 London Map
- **Version:** 1.0.0
- **Description:** Interactive London map focused on Notting Hill Carnival with festival features
- **Main Entry Point:** `index.html`
- **Live Server Port:** 5501

---

## 🏗️ **Core Architecture**

### **Main Files Structure:**
```
tagyou2/
├── index.html          # Main HTML structure
├── script.js           # JavaScript functionality (1481 lines)
├── styles.css          # CSS styling (2217 lines)
├── package.json        # Project configuration
├── README.md           # Project documentation
├── .eslintrc.json      # Code linting rules
├── .vscode/            # VS Code settings
└── responsive-zoom-guide.css  # Responsive design guide
```

---

## 🎯 **UI Components & Fields**

### **1. Controls Container (Top Header)**
**Location:** Fixed top position, full width
**Components:**
- **Search Container** (Left side)
- **Festivals Container** (Center)
- **Profile Container** (Right side)

### **2. Search Bar Component**
**Fields:**
- `#searchInput` - Text input for location search
- `#clearButton` - Clear search button (X)
- `#searchButton` - Blue search button
- `.search-icon` - Left search icon
- **Functionality:** Search London locations, Enter key support

### **3. UK Festivals Dropdown**
**Fields:**
- `#festivalsButton` - Main dropdown button
- `#festivalsDropdown` - Dropdown container
- `.festivals-text` - Button text
- `.dropdown-icon` - Chevron down icon
- `.festival-item` - Individual festival items (20 festivals)
- **Available Festival:** Notting Hill Carnival
- **Coming Soon:** 19 other UK festivals (blurred, non-clickable)

### **4. Profile & Toggle Section**
**Fields:**
- `#toggleSwitch` - Toggle switch (disabled/enabled states)
- `#profileButton` - Profile icon button
- `#profileDropdown` - Profile dropdown menu
- **Profile Menu Items:**
  - My Profile
  - My Favorites (badge: 3)
  - Recent Activity
  - Notifications (badge: 2)
  - Settings
  - Help & Support
  - Sign Out

### **5. Interactive Map Toolbar**
**Location:** Fixed position on map
**Toolbar Buttons:**
- `#groupsBtn` - Groups (users icon)
- `#foodStallBtn` - Food Stalls (utensils icon)
- `#floatTruckBtn` - Float Trucks (truck icon)
- `#artistBandBtn` - Artists & Bands (music icon)
- `#festivalBtn` - Festivals (star icon) - **Auto-selects Notting Hill Carnival**
- `#locationCenterBtn` - Center on Location (crosshairs icon)

### **6. Pull-Up Panel**
**Fields:**
- `#pullUpPanel` - Main panel container
- `.panel-handle` - Drag handle
- `.handle-text` - "Pull up for more" text
- `#closePanel` - Close button

**Tab Navigation:**
- `#foodstall` - Food Stalls tab (active by default)
- `#floattrucks` - Float Trucks tab
- `#artist` - Artists tab
- `#groups` - Groups tab
- `#settings` - Settings tab

**Tab Content Structure:**
- `.tab-header` - Tab title and description
- `.content-list` - Scrollable content container
- `.content-item` - Individual content cards

---

## 🗺️ **Map Features & Markers**

### **Map Initialization:**
- **Library:** Leaflet.js
- **Center:** London (51.5074, -0.1278)
- **Zoom:** 13
- **Tile Layer:** OpenStreetMap

### **Map Markers & Overlays:**

#### **Medical Locations (Permanent Red Markers):**
1. **Ladbroke Crescent** - 51.516369, -0.209404
2. **St Charles Place** - 51.520186, -0.212467
3. **Kensal Road** - 51.525947, -0.209153
4. **Parking Lot** - 51.522245, -0.201107
5. **St Stephen's Garden** - 51.518395, -0.195733

#### **Notting Hill Carnival Route:**
- **Orange Polyline** - Carnival parade route
- **Judging Zone Label** - Red label at 51.519641, -0.199409 (Great Western Rd)
  - **Rotation:** 60 degrees
  - **Scaling:** Stops scaling between zoom 16-18
- **Start Flag** - Green flag at Ladbroke Grove (carnival start point)

---

## 🔧 **JavaScript Functions & Features**

### **Core Initialization Functions:**
1. `initMap()` - Initialize Leaflet map
2. `initSearch()` - Search functionality
3. `initFestivalsDropdown()` - UK Festivals dropdown
4. `initProfileButton()` - Profile and toggle functionality
5. `initMapToolbar()` - Interactive toolbar
6. `initPullUpPanel()` - Pull-up panel with tabs
7. `initResponsiveZoom()` - Responsive scaling system

### **Map-Specific Functions:**
- `showMedicalLocations()` - Display medical markers
- `showCarnivalRoute()` - Display Notting Hill Carnival route
- `showJudgingZone()` - Display judging zone label
- `showStartFlag()` - Display start flag marker
- `calculateResponsiveZoom()` - Calculate zoom-based scaling
- `applyResponsiveScaling()` - Apply responsive scaling to UI elements

### **Data Management:**
- `foodStallsData[]` - Food stalls data array
- `artistsData[]` - Artists data array
- `getHardcodedFoodStalls()` - Fallback food stalls data
- `getHardcodedArtists()` - Fallback artists data

---

## 📱 **Responsive Design System**

### **Breakpoints:**
- **320px** - Mobile optimization
- **479px** - Tablet portrait
- **480px** - Small tablet
- **540px** - Medium tablet
- **640px** - Large tablet
- **660px** - Small desktop
- **760px** - Desktop

### **Zoom-Based Scaling:**
- **Zoom 16-18:** Special scaling rules for judging zone and start flag
- **Screen ≥320px:** UI elements don't scale with zoom
- **Screen <320px:** Full responsive scaling

### **Component Scaling Rules:**
- **Search Bar:** 25% width at 320px, scales to 50% at 479px
- **UK Festivals:** 50% width at 320px, maintains until 430px
- **Profile & Toggle:** Maintains scale from 320px to 760px
- **Toolbar:** 30% scale at 320px and above

---

## 🎨 **Design System**

### **Color Palette:**
- **Primary Blue:** #667eea, #764ba2
- **Festival Gradient:** #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57
- **Medical Red:** #ff0000
- **Carnival Orange:** #ff8c42
- **Start Flag Green:** #28a745

### **Visual Effects:**
- **Glassmorphism:** Backdrop blur effects
- **Gradients:** Multi-color gradients with animations
- **Shadows:** Box shadows and text shadows
- **Animations:** Hover effects, transitions, shimmer effects
- **Emojis:** Festival-themed emojis throughout UI

---

## 🔗 **External Dependencies**

### **CDN Libraries:**
- **Leaflet.js:** Map functionality
- **Font Awesome:** Icons (6.4.0)
- **OpenStreetMap:** Map tiles

### **Development Dependencies:**
- **live-server:** Development server
- **ESLint:** Code linting
- **VS Code Extensions:** Development environment

---

## 🚀 **Development Commands**

```bash
# Start development server
npm start

# Alternative start command
npm run dev

# Install dependencies
npm install

# Run linting
npm run lint
```

---

## 📊 **Project Statistics**

- **Total Lines of Code:** ~3,700+ lines
- **JavaScript Functions:** 20+ core functions
- **CSS Classes:** 100+ styled components
- **HTML Elements:** 50+ interactive elements
- **Map Markers:** 8+ permanent markers
- **Festival Entries:** 20 UK festivals
- **Responsive Breakpoints:** 7 breakpoints
- **Tab Panels:** 5 content tabs

---

## 🎯 **Key Features Summary**

✅ **Interactive London Map** with Leaflet.js  
✅ **Notting Hill Carnival Route** with orange line  
✅ **Medical Locations** with red markers  
✅ **Judging Zone** with rotated label  
✅ **Start Flag** at carnival beginning  
✅ **UK Festivals Dropdown** with 20 festivals  
✅ **Search Functionality** for London locations  
✅ **Profile System** with dropdown menu  
✅ **Toggle Switch** for settings  
✅ **Interactive Toolbar** with 6 buttons  
✅ **Pull-Up Panel** with 5 tabs  
✅ **Responsive Design** for all screen sizes  
✅ **Zoom-Based Scaling** system  
✅ **Festival Star Button** auto-selects Notting Hill Carnival  
✅ **Live Server** development environment  

---

*Last Updated: August 18, 2025*  
*Project Status: ✅ Fully Functional*
