# Carnival Tracker Database Schema Guide

## Overview
This comprehensive database schema extends your existing carnival tracking system with premium user roles, admin functionality, and essential features for a modern carnival tracker app.

## 🎯 Premium User Roles & Admin Features

### Core Admin Capabilities
- **Premium User Roles Table**: Links premium users to their admin capabilities
- **Squad Management**: Admins can add/delete squad members (up to configurable limits)
- **Group Organization**: Create and manage squad groups for better organization
- **Permission System**: Granular permissions for different admin levels

### Admin Features Included:
- ✅ Add/remove squad members
- ✅ Delete members (with safety confirmations)
- ✅ Manage squad settings
- ✅ View analytics and insights
- ✅ Organize members into groups
- ✅ Set member limits per premium tier

## 📊 Additional Tables for Carnival Tracker App

### 1. **Carnival Tracking Enhancements**
- **Carnival Attendance**: Track which carnivals users and squad members attend
- **Carnival Favorites**: Save favorite carnivals for quick access
- **Carnival Reviews**: User reviews and ratings system
- **Check-in Points**: Define specific locations at carnivals for check-ins

### 2. **Location & Safety Features**
- **Location History**: Track historical location data for safety
- **Safety Alerts**: Emergency alerts and incident tracking
- **Check-ins**: Track when squad members check in at specific points
- **Real-time Location Sharing**: Enhanced location tracking

### 3. **Communication & Notifications**
- **Squad Messages**: Internal messaging system
- **Notification Preferences**: Granular notification settings
- **Quiet Hours**: Respect user's quiet time preferences

### 4. **Analytics & Insights**
- **User Activity Log**: Track user behavior for analytics
- **Squad Analytics**: Daily metrics for premium users
- **Dashboard Views**: Pre-built views for common queries

## 🚀 Additional Features to Consider

### Social Features
```sql
-- Event Sharing
CREATE TABLE event_shares (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    carnival_id INTEGER REFERENCES carnivals(id),
    share_type VARCHAR(50), -- social_media, email, sms
    shared_at TIMESTAMP DEFAULT NOW()
);

-- Squad Invitations
CREATE TABLE squad_invitations (
    id UUID PRIMARY KEY,
    inviter_id UUID REFERENCES auth.users(id),
    invitee_email VARCHAR(255),
    squad_id UUID,
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, declined
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Enhanced Safety Features
```sql
-- Emergency Contacts
CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name VARCHAR(255),
    phone VARCHAR(50),
    relationship VARCHAR(100),
    is_primary BOOLEAN DEFAULT false
);

-- Safety Zones
CREATE TABLE safety_zones (
    id UUID PRIMARY KEY,
    carnival_id INTEGER REFERENCES carnivals(id),
    name VARCHAR(255),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    radius INTEGER, -- meters
    zone_type VARCHAR(50) -- safe_zone, medical, police, lost_child
);
```

### Weather & Logistics
```sql
-- Weather Updates
CREATE TABLE carnival_weather (
    id UUID PRIMARY KEY,
    carnival_id INTEGER REFERENCES carnivals(id),
    forecast_date DATE,
    temperature_min DECIMAL(4,1),
    temperature_max DECIMAL(4,1),
    conditions VARCHAR(100),
    rain_probability INTEGER,
    wind_speed DECIMAL(4,1)
);

-- Transportation
CREATE TABLE transportation_options (
    id UUID PRIMARY KEY,
    carnival_id INTEGER REFERENCES carnivals(id),
    transport_type VARCHAR(50), -- tube, bus, train, car, walking
    route_name VARCHAR(255),
    start_location VARCHAR(255),
    end_location VARCHAR(255),
    duration_minutes INTEGER,
    cost DECIMAL(6,2),
    accessibility_notes TEXT
);
```

### Food & Entertainment
```sql
-- Food Stalls (Enhanced)
CREATE TABLE food_stalls (
    id UUID PRIMARY KEY,
    carnival_id INTEGER REFERENCES carnivals(id),
    name VARCHAR(255),
    cuisine_type VARCHAR(100),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    price_range VARCHAR(20), -- £, ££, £££
    dietary_options JSONB, -- ["vegetarian", "vegan", "gluten_free"]
    rating DECIMAL(3,2),
    wait_time_minutes INTEGER,
    is_halal BOOLEAN,
    is_kosher BOOLEAN
);

-- Entertainment Schedule
CREATE TABLE entertainment_schedule (
    id UUID PRIMARY KEY,
    carnival_id INTEGER REFERENCES carnivals(id),
    stage_name VARCHAR(255),
    performer_name VARCHAR(255),
    performance_type VARCHAR(100), -- music, dance, comedy
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    description TEXT
);
```

### Financial Tracking
```sql
-- Budget Tracking
CREATE TABLE carnival_budgets (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    carnival_id INTEGER REFERENCES carnivals(id),
    budget_amount DECIMAL(8,2),
    spent_amount DECIMAL(8,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'GBP',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Expense Categories
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(100), -- food, transport, souvenirs, tickets
    icon VARCHAR(50),
    color VARCHAR(7)
);
```

### Health & Accessibility
```sql
-- Medical Stations
CREATE TABLE medical_stations (
    id UUID PRIMARY KEY,
    carnival_id INTEGER REFERENCES carnivals(id),
    name VARCHAR(255),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    services JSONB, -- ["first_aid", "lost_child", "emergency"]
    operating_hours TEXT,
    phone VARCHAR(50)
);

-- Accessibility Features
CREATE TABLE accessibility_features (
    id UUID PRIMARY KEY,
    carnival_id INTEGER REFERENCES carnivals(id),
    feature_type VARCHAR(100), -- wheelchair_access, hearing_loop, quiet_space
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    description TEXT,
    availability_hours TEXT
);
```

## 🎨 UI/UX Considerations

### Dashboard Features
- **Real-time Squad Map**: Show all squad members on a live map
- **Activity Feed**: Recent check-ins, messages, and alerts
- **Quick Actions**: One-tap check-in, SOS button, location share
- **Weather Widget**: Current conditions and forecast
- **Budget Tracker**: Visual spending breakdown

### Mobile-First Features
- **Offline Mode**: Cache essential data for poor connectivity
- **Battery Optimization**: Smart location updates based on battery level
- **Dark Mode**: Better visibility in evening carnival hours
- **Voice Commands**: "Check in at main stage" or "Find nearest food stall"

### Safety Features
- **SOS Button**: One-tap emergency alert with location
- **Lost Child Protocol**: Quick reporting and search coordination
- **Medical Emergency**: Direct connection to nearest medical station
- **Weather Alerts**: Real-time weather warnings

## 🔧 Technical Implementation Tips

### Performance Optimizations
```sql
-- Partition location_history by date for better performance
CREATE TABLE location_history_2025_08 PARTITION OF location_history
FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

-- Use materialized views for complex analytics
CREATE MATERIALIZED VIEW daily_squad_activity AS
SELECT 
    DATE(created_at) as activity_date,
    COUNT(*) as total_activities,
    COUNT(DISTINCT user_id) as active_users
FROM user_activity_log
GROUP BY DATE(created_at);
```

### API Endpoints to Consider
- `GET /api/carnivals/{id}/squad-location` - Real-time squad locations
- `POST /api/squad/check-in` - Quick check-in with location
- `POST /api/safety/alert` - Emergency alert system
- `GET /api/weather/{carnival-id}` - Weather updates
- `GET /api/food-stalls/nearby` - Nearby food options

### Integration Opportunities
- **Weather APIs**: OpenWeatherMap, WeatherAPI
- **Transport APIs**: TfL API, Google Maps
- **Payment Processing**: Stripe for premium features
- **Push Notifications**: Firebase, OneSignal
- **Social Media**: Share carnival experiences

## 📱 Mobile App Features

### Core Features
1. **Live Squad Tracking**: Real-time location sharing
2. **Check-in System**: Quick check-ins at carnival points
3. **Safety Alerts**: Emergency notifications and SOS
4. **Carnival Guide**: Schedules, maps, and information
5. **Squad Messaging**: Internal communication

### Premium Features
1. **Advanced Analytics**: Detailed squad insights
2. **Group Management**: Organize squad into groups
3. **Custom Alerts**: Personalized notification rules
4. **Export Data**: Download squad activity reports
5. **Priority Support**: Dedicated customer service

### Gamification Elements
- **Check-in Streaks**: Encourage regular check-ins
- **Squad Challenges**: Group activities and goals
- **Carnival Badges**: Achievements for participation
- **Leaderboards**: Friendly competition among squads

## 🔒 Security & Privacy

### Data Protection
- **GDPR Compliance**: User data rights and deletion
- **Location Privacy**: Granular location sharing controls
- **Data Encryption**: End-to-end encryption for messages
- **Audit Logs**: Track all data access and changes

### Privacy Controls
- **Location History**: User-controlled retention periods
- **Sharing Preferences**: Granular control over what's shared
- **Anonymous Mode**: Option to use app without personal data
- **Data Export**: Easy data export and deletion

This comprehensive schema provides a solid foundation for a feature-rich carnival tracker app while maintaining security, performance, and user privacy. The modular design allows for gradual implementation and easy scaling as your user base grows.
