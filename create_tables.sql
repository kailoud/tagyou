-- GroupTracker Database Schema for Supabase
-- Run this in your Supabase SQL Editor to create all necessary tables

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- 1. Food Stalls Table
CREATE TABLE IF NOT EXISTS food_stalls (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    coordinates JSONB NOT NULL DEFAULT '{"lat": 0, "lng": 0}',
    phone VARCHAR(50),
    email VARCHAR(255),
    hours VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Float Trucks Table
CREATE TABLE IF NOT EXISTS float_trucks (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    current_location VARCHAR(255) NOT NULL,
    coordinates JSONB NOT NULL DEFAULT '{"lat": 0, "lng": 0}',
    phone VARCHAR(50),
    email VARCHAR(255),
    schedule VARCHAR(255),
    tracking_method VARCHAR(50) DEFAULT 'gps',
    gps_tracker_id VARCHAR(100),
    driver_phone VARCHAR(50),
    last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_live BOOLEAN DEFAULT true,
    estimated_speed INTEGER DEFAULT 0,
    next_stop VARCHAR(255),
    estimated_arrival TIME,
    rating DECIMAL(3,2) DEFAULT 0,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Groups Table
CREATE TABLE IF NOT EXISTS groups (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    member_count INTEGER DEFAULT 0,
    description TEXT,
    admin VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Friends Table
CREATE TABLE IF NOT EXISTS friends (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    location VARCHAR(255),
    join_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Food Stalls Indexes
CREATE INDEX IF NOT EXISTS idx_food_stalls_status ON food_stalls(status);
CREATE INDEX IF NOT EXISTS idx_food_stalls_category ON food_stalls(category);
CREATE INDEX IF NOT EXISTS idx_food_stalls_location ON food_stalls(location);

-- Float Trucks Indexes
CREATE INDEX IF NOT EXISTS idx_float_trucks_status ON float_trucks(status);
CREATE INDEX IF NOT EXISTS idx_float_trucks_category ON float_trucks(category);
CREATE INDEX IF NOT EXISTS idx_float_trucks_location ON float_trucks(current_location);
CREATE INDEX IF NOT EXISTS idx_float_trucks_tracking ON float_trucks(tracking_method);

-- Groups Indexes
CREATE INDEX IF NOT EXISTS idx_groups_status ON groups(status);
CREATE INDEX IF NOT EXISTS idx_groups_type ON groups(type);
CREATE INDEX IF NOT EXISTS idx_groups_admin ON groups(admin);

-- Friends Indexes
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);
CREATE INDEX IF NOT EXISTS idx_friends_email ON friends(email);
CREATE INDEX IF NOT EXISTS idx_friends_username ON friends(username);

-- =====================================================
-- CREATE TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for all tables
CREATE TRIGGER update_food_stalls_updated_at 
    BEFORE UPDATE ON food_stalls 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_float_trucks_updated_at 
    BEFORE UPDATE ON float_trucks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at 
    BEFORE UPDATE ON groups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friends_updated_at 
    BEFORE UPDATE ON friends 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Sample Food Stalls
INSERT INTO food_stalls (name, category, location, coordinates, phone, email, hours, rating, description, status, image) VALUES
('Mike''s Burger Stand', 'Fast Food', 'Downtown Plaza', '{"lat": 40.7128, "lng": -74.0060}', '+1 (555) 123-4567', 'mike@burgerstand.com', '10:00 AM - 10:00 PM', 4.5, 'Best burgers in downtown with fresh ingredients and friendly service', 'active', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop&crop=center'),
('Taco Fiesta', 'Mexican', 'Main Square', '{"lat": 40.7589, "lng": -73.9851}', '+1 (555) 234-5678', 'taco@fiesta.com', '11:00 AM - 11:00 PM', 4.8, 'Authentic Mexican tacos and burritos made fresh daily', 'active', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop&crop=center'),
('Sushi Express', 'Japanese', 'East Wing', '{"lat": 40.7505, "lng": -73.9934}', '+1 (555) 345-6789', 'sushi@express.com', '12:00 PM - 9:00 PM', 4.6, 'Fresh sushi and sashimi prepared by expert chefs', 'active', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=100&h=100&fit=crop&crop=center'),
('Pizza Palace', 'Italian', 'West Plaza', '{"lat": 40.7484, "lng": -73.9857}', '+1 (555) 456-7890', 'pizza@palace.com', '11:00 AM - 12:00 AM', 4.2, 'Traditional Italian pizza with wood-fired oven', 'active', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop&crop=center'),
('Curry Corner', 'Indian', 'South Market', '{"lat": 40.7421, "lng": -73.9911}', '+1 (555) 567-8901', 'curry@corner.com', '10:30 AM - 10:30 PM', 4.7, 'Spicy and flavorful Indian cuisine', 'active', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop&crop=center')
ON CONFLICT DO NOTHING;

-- Sample Float Trucks
INSERT INTO float_trucks (name, category, current_location, coordinates, phone, email, schedule, tracking_method, gps_tracker_id, driver_phone, rating, description, status, image) VALUES
('Tropical Paradise Float', 'Drinks & Smoothies', 'Central Park', '{"lat": 40.7850, "lng": -73.9680}', '+1 (555) 987-6543', 'info@tropicalfloat.com', 'Monday-Friday: Various locations', 'gps', 'TRK-001-TROP', '+1 (555) 987-6543', 4.8, 'Mobile tropical drink experience with fresh fruits', 'active', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop&crop=center'),
('Ice Cream Truck', 'Desserts', 'Mobile - Downtown', '{"lat": 40.7589, "lng": -73.9851}', '+1 (555) 876-5432', 'ice@cream.com', 'Daily: 2:00 PM - 8:00 PM', 'gps', 'TRK-002-ICE', '+1 (555) 876-5432', 4.3, 'Classic ice cream truck with variety of flavors', 'active', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop&crop=center'),
('Coffee Cart', 'Beverages', 'Financial District', '{"lat": 40.7064, "lng": -74.0090}', '+1 (555) 765-4321', 'coffee@cart.com', 'Weekdays: 7:00 AM - 6:00 PM', 'mobile-app', 'TRK-003-COF', '+1 (555) 765-4321', 4.7, 'Premium coffee and espresso drinks', 'active', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop&crop=center'),
('Hot Dog Wagon', 'Fast Food', 'Times Square', '{"lat": 40.7580, "lng": -73.9855}', '+1 (555) 654-3210', 'hotdog@wagon.com', 'Daily: 10:00 AM - 10:00 PM', 'social-media', 'TRK-004-DOG', '+1 (555) 654-3210', 3.9, 'Classic New York hot dogs and pretzels', 'inactive', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop&crop=center'),
('Smoothie Mobile', 'Healthy', 'Upper East Side', '{"lat": 40.7736, "lng": -73.9712}', '+1 (555) 543-2109', 'smoothie@mobile.com', 'Daily: 9:00 AM - 7:00 PM', 'hybrid', 'TRK-005-SMO', '+1 (555) 543-2109', 4.4, 'Healthy smoothies and fresh juices', 'active', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop&crop=center')
ON CONFLICT DO NOTHING;

-- Sample Groups
INSERT INTO groups (name, type, member_count, description, admin, email, status) VALUES
('Downtown Food Lovers', 'Food Community', 156, 'Local food enthusiasts sharing reviews and recommendations for downtown restaurants', 'Sarah Johnson', 'admin@downtownfoodlovers.com', 'active'),
('Festival Goers NYC', 'Event Group', 89, 'Group for festival and event enthusiasts in New York City', 'Mike Chen', 'admin@festivalgoersnyc.com', 'active'),
('Food Truck Hunters', 'Food Community', 234, 'Dedicated to finding and reviewing the best food trucks in the city', 'Lisa Rodriguez', 'admin@foodtruckhunters.com', 'active'),
('Weekend Warriors', 'Friends Group', 67, 'Weekend adventure and activity group for young professionals', 'David Kim', 'admin@weekendwarriors.com', 'active'),
('Tech Meetup NYC', 'Business Network', 445, 'Technology professionals networking and sharing industry insights', 'Jennifer Smith', 'admin@techmeetupnyc.com', 'active')
ON CONFLICT DO NOTHING;

-- Sample Friends
INSERT INTO friends (name, username, email, phone, location, status) VALUES
('John Smith', 'johnsmith123', 'john@email.com', '+1 (555) 456-7890', 'New York, NY', 'active'),
('Emma Wilson', 'emmawilson', 'emma@email.com', '+1 (555) 567-8901', 'Brooklyn, NY', 'active'),
('Michael Brown', 'mikebrown', 'michael@email.com', '+1 (555) 678-9012', 'Queens, NY', 'active'),
('Sarah Davis', 'sarahdavis', 'sarah@email.com', '+1 (555) 789-0123', 'Manhattan, NY', 'active'),
('Alex Johnson', 'alexj', 'alex@email.com', '+1 (555) 890-1234', 'Bronx, NY', 'active'),
('Maria Garcia', 'mariagarcia', 'maria@email.com', '+1 (555) 901-2345', 'Staten Island, NY', 'active'),
('James Wilson', 'jamesw', 'james@email.com', '+1 (555) 012-3456', 'New York, NY', 'active'),
('Lisa Anderson', 'lisaanderson', 'lisa@email.com', '+1 (555) 123-4567', 'Brooklyn, NY', 'active')
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES (Optional - run to check data)
-- =====================================================

-- Check table counts
-- SELECT 'food_stalls' as table_name, COUNT(*) as count FROM food_stalls
-- UNION ALL
-- SELECT 'float_trucks', COUNT(*) FROM float_trucks
-- UNION ALL
-- SELECT 'groups', COUNT(*) FROM groups
-- UNION ALL
-- SELECT 'friends', COUNT(*) FROM friends;

-- Check sample data
-- SELECT * FROM food_stalls LIMIT 3;
-- SELECT * FROM float_trucks LIMIT 3;
-- SELECT * FROM groups LIMIT 3;
-- SELECT * FROM friends LIMIT 3;

-- =====================================================
-- NOTES
-- =====================================================

/*
This script creates:
1. 4 main tables for the GroupTracker admin portal
2. Performance indexes for faster queries
3. Automatic timestamp triggers
4. Sample data for testing

To run this script:
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Paste this entire script
5. Click "Run"

After running, you can:
1. Test user registration and login
2. Access the admin portal with admin emails
3. Add, edit, and delete items in all tables
4. Upload and manage images
5. Test all CRUD operations

Admin access emails:
- demo@tagyou.com
- Any email ending with @admin.com
*/
