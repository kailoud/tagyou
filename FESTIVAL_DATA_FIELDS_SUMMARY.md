# Festival Information Data Fields Summary

## Overview
This document outlines the data fields for each festival information tab (Food Stalls, Float Trucks, Artists) and how they map to the UI components in the pull-up panel.

## 🍽️ Food Stalls Tab

### Core Data Fields (from JavaScript sample data)
- **id** - Unique identifier
- **name** - Food stall name (displayed as `<h5>`)
- **cuisine** - Type of cuisine (Caribbean, International, Desserts)
- **location** - Physical location (displayed with 📍 icon)
- **description** - Detailed description (displayed as `<p>`)
- **rating** - Rating out of 5 (displayed with ⭐ icon)
- **price_range** - Price category (£, ££, £££, ££££)
- **image_url** - Image for the food stall

### Additional Database Fields
- **carnival_id** - Foreign key to carnivals table
- **coordinates** - JSONB for map positioning (lat/lng)
- **opening_hours** - JSONB array of opening hours
- **special_dietary_options** - JSONB array (vegan, gluten-free, etc.)
- **contact_info** - JSONB object (phone, email, social media)
- **status** - active/inactive/sold_out

### UI Display Format
```html
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
```

---

## 🚛 Float Trucks Tab

### Core Data Fields (from JavaScript sample data)
- **id** - Unique identifier
- **name** - Float truck name (displayed as `<h5>`)
- **theme** - Theme of the float (displayed with 🎨 icon)
- **route** - Parade route (displayed with 📍 icon)
- **description** - Detailed description (displayed as `<p>`)
- **image_url** - Image for the float truck

### Additional Database Fields
- **carnival_id** - Foreign key to carnivals table
- **coordinates** - JSONB for map positioning (lat/lng)
- **parade_schedule** - JSONB array of parade times and dates
- **participants_count** - Number of participants
- **music_type** - Type of music played
- **special_effects** - JSONB array (fire, lights, etc.)
- **contact_info** - JSONB object (organizer contact details)
- **status** - active/inactive/cancelled

### UI Display Format
```html
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
```

---

## 🎵 Artists Tab

### Core Data Fields (from JavaScript sample data)
- **id** - Unique identifier
- **name** - Artist/band name (displayed as `<h5>`)
- **genre** - Music genre (displayed with 🎶 icon)
- **stage** - Performance stage (displayed with 🎪 icon)
- **time** - Performance time (displayed with 🕐 icon)
- **description** - Detailed description (displayed as `<p>`)
- **image_url** - Image for the artist

### Additional Database Fields
- **carnival_id** - Foreign key to carnivals table
- **coordinates** - JSONB for stage location (lat/lng)
- **performance_duration** - Duration in minutes
- **setlist** - JSONB array of songs to be performed
- **social_media** - JSONB object (social media links)
- **booking_agent** - JSONB object (agent contact information)
- **special_requirements** - JSONB object (technical requirements, backstage needs)
- **status** - confirmed/pending/cancelled/completed

### UI Display Format
```html
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
```

---

## 🔗 Database Relationships

### Foreign Key Relationships
- All festival tables reference `carnivals(id)` via `carnival_id`
- Cascade delete ensures data integrity

### Sample Data Integration
The sample data in the SQL file references carnival ID 1 (Notting Hill Carnival) from the existing `carnivals` table.

---

## 📊 Database Views

### Available Views
1. **festival_overview** - Summary counts for each carnival
2. **top_rated_food_stalls** - Food stalls with ratings ≥ 4.0
3. **artist_schedule** - Artists ordered by time and stage

### Example Queries
```sql
-- Get all food stalls for Notting Hill Carnival
SELECT * FROM food_stalls WHERE carnival_id = 1 AND status = 'active';

-- Get artist schedule for today
SELECT * FROM artist_schedule WHERE carnival_id = 1;

-- Get top-rated food options
SELECT * FROM top_rated_food_stalls WHERE carnival_id = 1;
```

---

## 🔒 Security & Permissions

### Row Level Security (RLS)
- All tables have RLS enabled
- Authenticated users can read all data
- Service role can manage all data
- Anonymous users can read all data (public access)

### Data Validation
- Rating constraints (0-5 for food stalls)
- Price range constraints (£, ££, £££, ££££)
- Status constraints for each table type
- Time format validation (HH:MM)

---

## 🚀 Implementation Notes

### Current State
- ✅ UI tabs are implemented in HTML (Food Stalls, Float Trucks, Artists)
- ✅ JavaScript sample data functions exist
- ✅ Data display logic is implemented
- ✅ SQL schema is created with sample data
- ❌ Groups tab has been removed

### Next Steps
1. Run the updated SQL schema in Supabase
2. Update JavaScript services to use real database queries
3. Implement real-time updates using Supabase subscriptions
4. Add map markers for coordinates
5. Implement search and filtering functionality

### File Locations
- **SQL Schema**: `complete-festival-schema.sql`
- **UI Implementation**: `index.html` (pull-up panel section)
- **JavaScript Logic**: `script.js` (populatePullUpPanel function)
- **Sample Data**: `script.js` (getSampleFoodStalls, getSampleArtists, getSampleFloatTrucks)

---

## 📋 Tab Structure Summary

### Available Tabs
1. **🍽️ Food Stalls** - Food vendors and refreshments
2. **🚛 Float Trucks** - Parade floats and mobile attractions  
3. **🎵 Artists** - Live performances and musical entertainment

### Removed Tab
- ~~**👥 Groups**~~ - Carnival groups and organizations (removed)

### Tab Navigation Structure
```html
<div class="tab-navigation">
  <button class="tab-btn active" data-tab="foodstall">
    <i class="fas fa-utensils"></i>
    <span>Food Stalls</span>
  </button>
  <button class="tab-btn" data-tab="floattrucks">
    <i class="fas fa-truck"></i>
    <span>Float Trucks</span>
  </button>
  <button class="tab-btn" data-tab="artist">
    <i class="fas fa-music"></i>
    <span>Artists</span>
  </button>
</div>
```
