# TagYou2 London Map - Data Table Fields & Headers

## 📊 **Data Structure Overview**

This document outlines all the data fields, table headers, and data structures used in the TagYou2 London Map project.

---

## 🍽️ **Food Stalls Data Table**

### **Table Name:** `foodStallsData[]`
### **Data Source:** `getHardcodedFoodStalls()` function

| Field Name | Data Type | Description | Example Value |
|------------|-----------|-------------|---------------|
| `id` | Number | Unique identifier | `1` |
| `name` | String | Food stall name | `"Caribbean Spice Kitchen"` |
| `lat` | Number | Latitude coordinate | `51.517871` |
| `lng` | Number | Longitude coordinate | `-0.205163` |
| `location` | String | Street/area location | `"Ladbroke Grove"` |
| `description` | String | Detailed description | `"Authentic Jamaican jerk chicken and Caribbean cuisine"` |
| `specialties` | Array[String] | List of specialty dishes | `["Jerk Chicken", "Curry Goat", "Rice & Peas", "Plantain"]` |
| `rating` | Number | Star rating (0-5) | `4.8` |
| `priceRange` | String | Price category | `"££"` |
| `image` | String | Image URL | `"https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop"` |
| `hours` | String | Operating hours | `"11:00 AM - 8:00 PM"` |
| `phone` | String | Contact phone number | `"+44 20 7123 4567"` |

### **Sample Food Stalls:**
1. **Caribbean Spice Kitchen** - Ladbroke Grove
2. **Notting Hill Jerk House** - Portobello Road  
3. **Island Flavours** - Westbourne Grove

---

## 🎵 **Artists & Bands Data Table**

### **Table Name:** `artistsData[]`
### **Data Source:** `getHardcodedArtists()` function

| Field Name | Data Type | Description | Example Value |
|------------|-----------|-------------|---------------|
| `id` | Number | Unique identifier | `1` |
| `name` | String | Artist/band name | `"DJ Shy FX"` |
| `lat` | Number | Latitude coordinate | `51.517674` |
| `lng` | Number | Longitude coordinate | `-0.200438` |
| `location` | String | Performance location | `"Ladbroke Grove"` |
| `description` | String | Artist description | `"Legendary drum & bass and jungle pioneer"` |
| `genres` | Array[String] | Music genres | `["Drum & Bass", "Jungle", "UK Garage", "Reggae"]` |
| `rating` | Number | Star rating (0-5) | `4.9` |
| `performanceTime` | String | Performance schedule | `"3:00 PM - 4:30 PM"` |
| `stage` | String | Stage/venue name | `"Main Float Route"` |
| `image` | String | Artist image URL | `"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop"` |
| `phone` | String | Contact phone number | `"+44 20 7123 4570"` |
| `experience` | String | Years of experience | `"25+ years in UK dance music scene"` |

### **Sample Artists:**
1. **DJ Shy FX** - Drum & Bass pioneer
2. **Steel Pulse** - Reggae legends
3. **London Samba Collective** - Brazilian rhythms

---

## 🎭 **UK Festivals Data Table**

### **Table Name:** `festivalItems[]`
### **Data Source:** HTML structure in `index.html`

| Field Name | Data Type | Description | Example Value |
|------------|-----------|-------------|---------------|
| `emoji` | String | Festival emoji icon | `"🎭"` |
| `name` | String | Festival name | `"Notting Hill Carnival"` |
| `status` | String | Availability status | `"available"` or `"coming-soon"` |
| `className` | String | CSS class for styling | `"festival-item available"` |

### **Available Festivals (1):**
- 🎭 **Notting Hill Carnival** - `status: "available"`

### **Coming Soon Festivals (19):**
- 🎪 Edinburgh Festival Fringe
- 🎸 Glastonbury Festival
- 🎵 Reading Festival
- 🎤 Leeds Festival
- 🤘 Download Festival
- 🏝️ Isle of Wight Festival
- 🌳 Latitude Festival
- 🌈 Bestival
- 🎪 Boomtown Fair
- 🎧 Creamfields
- 🎶 V Festival
- 🎤 T in the Park
- 🎵 Wireless Festival
- 🎉 Parklife Festival
- 💕 Lovebox Festival
- 🌞 Field Day Festival
- 🎨 All Points East

---

## 🚛 **Float Trucks Data Table**

### **Table Name:** `floatTrucksData[]`
### **Data Source:** HTML content in `index.html`

| Field Name | Data Type | Description | Example Value |
|------------|-----------|-------------|---------------|
| `name` | String | Float truck name | `"Circus Float"` |
| `description` | String | Float description | `"Spectacular circus performers on wheels"` |
| `location` | String | Parade location | `"Parade Route, 2:00 PM"` |
| `emoji` | String | Float emoji icon | `"🎪"` |
| `image` | String | Float image URL | `"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=100&fit=crop"` |

### **Sample Float Trucks:**
1. **Circus Float** - Parade Route, 2:00 PM
2. **Costume Float** - Main Parade, 3:30 PM
3. **Music Float** - Cultural Route, 4:00 PM

---

## 👥 **Groups & Communities Data Table**

### **Table Name:** `groupsData[]`
### **Data Source:** HTML content in `index.html`

| Field Name | Data Type | Description | Example Value |
|------------|-----------|-------------|---------------|
| `name` | String | Group name | `"LGBTQ+ Community"` |
| `description` | String | Group description | `"Inclusive space for LGBTQ+ festival-goers"` |
| `location` | String | Meeting location | `"Community Hub, All Day"` |
| `emoji` | String | Group emoji icon | `"🏳️‍🌈"` |
| `image` | String | Group image URL | `"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&h=100&fit=crop"` |

### **Sample Groups:**
1. **LGBTQ+ Community** - Community Hub, All Day
2. **International Visitors** - Welcome Center, 10:00 AM
3. **Art & Culture Group** - Cultural Center, 11:00 AM

---

## 🏥 **Medical Locations Data Table**

### **Table Name:** `medicalLocations[]`
### **Data Source:** `showMedicalLocations()` function

| Field Name | Data Type | Description | Example Value |
|------------|-----------|-------------|---------------|
| `name` | String | Location name | `"Ladbroke Crescent Medical"` |
| `lat` | Number | Latitude coordinate | `51.516369` |
| `lng` | Number | Longitude coordinate | `-0.209404` |
| `type` | String | Medical facility type | `"Medical/Welfare"` |
| `icon` | String | Red cross icon | `"fas fa-cross"` |
| `color` | String | Marker color | `"#ff0000"` |

### **Medical Locations (5):**
1. **Ladbroke Crescent** - 51.516369, -0.209404
2. **St Charles Place** - 51.520186, -0.212467
3. **Kensal Road** - 51.525947, -0.209153
4. **Parking Lot** - 51.522245, -0.201107
5. **St Stephen's Garden** - 51.518395, -0.195733

---

## 🗺️ **Map Markers & Overlays Data Table**

### **Table Name:** `mapOverlays[]`
### **Data Source:** Various map functions

| Field Name | Data Type | Description | Example Value |
|------------|-----------|-------------|---------------|
| `type` | String | Overlay type | `"polyline"`, `"marker"`, `"label"` |
| `name` | String | Overlay name | `"Carnival Route"` |
| `coordinates` | Array[Array] | Coordinate pairs | `[[51.517, -0.205], [51.518, -0.206]]` |
| `color` | String | Overlay color | `"#ff8c42"` |
| `weight` | Number | Line weight | `4` |
| `rotation` | Number | Label rotation (degrees) | `60` |
| `zoomScaling` | Object | Zoom scaling rules | `{min: 16, max: 18, scale: false}` |

### **Map Overlays:**
1. **Carnival Route** - Orange polyline
2. **Judging Zone Label** - Red label (60° rotation)
3. **Start Flag** - Green marker
4. **Medical Markers** - Red markers (5 locations)

---

## 👤 **Profile Data Table**

### **Table Name:** `profileData`
### **Data Source:** HTML structure in `index.html`

| Field Name | Data Type | Description | Example Value |
|------------|-----------|-------------|---------------|
| `name` | String | User name | `"Festival Goer"` |
| `welcome` | String | Welcome message | `"Welcome to TagYou2!"` |
| `favorites` | Number | Number of favorites | `3` |
| `notifications` | Number | Number of notifications | `2` |
| `menuItems` | Array[Object] | Profile menu items | See below |

### **Profile Menu Items:**
| Menu Item | Icon | Badge | Description |
|-----------|------|-------|-------------|
| My Profile | `fas fa-user-circle` | - | User profile settings |
| My Favorites | `fas fa-heart` | `3` | Saved favorites |
| Recent Activity | `fas fa-history` | - | Activity history |
| Notifications | `fas fa-bell` | `2` | User notifications |
| Settings | `fas fa-cog` | - | App settings |
| Help & Support | `fas fa-question-circle` | - | Help resources |
| Sign Out | `fas fa-sign-out-alt` | - | Logout function |

---

## ⚙️ **Settings Data Table**

### **Table Name:** `settingsData`
### **Data Source:** HTML content in `index.html`

| Field Name | Data Type | Description | Example Value |
|------------|-----------|-------------|---------------|
| `settingName` | String | Setting name | `"Location Services"` |
| `settingType` | String | Setting type | `"toggle"`, `"select"`, `"input"` |
| `value` | Mixed | Current value | `true`, `"enabled"`, `"100"` |
| `description` | String | Setting description | `"Allow location access for map features"` |
| `icon` | String | Setting icon | `"fas fa-location-arrow"` |

### **Sample Settings:**
1. **Location Services** - Toggle setting
2. **Notifications** - Toggle setting
3. **Map Theme** - Select setting
4. **Language** - Select setting

---

## 📱 **Responsive Data Table**

### **Table Name:** `responsiveBreakpoints`
### **Data Source:** CSS media queries

| Breakpoint | Screen Width | Description | Scaling Rules |
|------------|--------------|-------------|---------------|
| Mobile | 320px | Mobile optimization | 25% search, 50% festivals |
| Tablet Portrait | 479px | Tablet portrait | 50% search, 50% festivals |
| Small Tablet | 480px | Small tablet | Maintains 480px scale |
| Medium Tablet | 540px | Medium tablet | Gradual scaling |
| Large Tablet | 640px | Large tablet | Full width scaling |
| Small Desktop | 660px | Small desktop | Desktop layout |
| Desktop | 760px | Full desktop | Complete desktop layout |

---

## 🔧 **JavaScript Data Variables**

### **Global Variables:**
```javascript
let map;                    // Leaflet map instance
let currentUser = null;     // Current user data
let foodStallsData = [];    // Food stalls array
let artistsData = [];       // Artists array
let firebaseInitialized = false;  // Firebase status
```

### **Map-Specific Variables:**
```javascript
let carnivalRoute = null;   // Carnival route polyline
let medicalMarkers = [];    // Medical location markers
let judgingMarker = null;   // Judging zone label
let startFlag = null;       // Start flag marker
```

---

## 📊 **Data Flow Summary**

### **Data Sources:**
1. **Hardcoded Data** - Fallback data in JavaScript functions
2. **HTML Content** - Static content in HTML structure
3. **Firebase Integration** - Real-time data (planned)
4. **User Input** - Search queries and interactions

### **Data Destinations:**
1. **Map Markers** - Displayed on Leaflet map
2. **UI Components** - Rendered in HTML elements
3. **Pull-Up Panel** - Tab content display
4. **Search Results** - Filtered data display

---

*Last Updated: August 18, 2025*  
*Data Structure Version: 1.0*
