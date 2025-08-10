-- Supabase Database Schema for GroupTracker Admin Portal
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create food_stalls table
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

-- Create float_trucks table
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

-- Create groups table
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

-- Create friends table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_food_stalls_status ON food_stalls(status);
CREATE INDEX IF NOT EXISTS idx_food_stalls_category ON food_stalls(category);
CREATE INDEX IF NOT EXISTS idx_float_trucks_status ON float_trucks(status);
CREATE INDEX IF NOT EXISTS idx_float_trucks_category ON float_trucks(category);
CREATE INDEX IF NOT EXISTS idx_groups_status ON groups(status);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);
CREATE INDEX IF NOT EXISTS idx_friends_email ON friends(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_food_stalls_updated_at BEFORE UPDATE ON food_stalls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_float_trucks_updated_at BEFORE UPDATE ON float_trucks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friends_updated_at BEFORE UPDATE ON friends FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - Optional for admin portal
-- ALTER TABLE food_stalls ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE float_trucks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Insert sample data (optional)
INSERT INTO food_stalls (name, category, location, coordinates, phone, email, hours, rating, description, status, image) VALUES
('Mike''s Burger Stand', 'Fast Food', 'Downtown Plaza', '{"lat": 40.7128, "lng": -74.0060}', '+1 (555) 123-4567', 'mike@burgerstand.com', '10:00 AM - 10:00 PM', 4.5, 'Best burgers in downtown', 'active', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&h=100&fit=crop&crop=center')
ON CONFLICT DO NOTHING;

INSERT INTO float_trucks (name, category, current_location, coordinates, phone, email, schedule, tracking_method, gps_tracker_id, driver_phone, rating, description, status, image) VALUES
('Tropical Paradise Float', 'Drinks & Smoothies', 'Central Park', '{"lat": 40.7850, "lng": -73.9680}', '+1 (555) 987-6543', 'info@tropicalfloat.com', 'Monday-Friday: Various locations', 'gps', 'TRK-001-TROP', '+1 (555) 987-6543', 4.8, 'Mobile tropical drink experience', 'active', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop&crop=center')
ON CONFLICT DO NOTHING;

INSERT INTO groups (name, type, member_count, description, admin, email, status) VALUES
('Downtown Food Lovers', 'Food Community', 156, 'Local food enthusiasts sharing reviews and recommendations', 'Sarah Johnson', 'admin@downtownfoodlovers.com', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO friends (name, username, email, phone, location, status) VALUES
('John Smith', 'johnsmith123', 'john@email.com', '+1 (555) 456-7890', 'New York, NY', 'active')
ON CONFLICT DO NOTHING;
