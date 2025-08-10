-- Fix Float Trucks Table Structure
-- Run this in your Supabase SQL Editor

-- =====================================================
-- DROP AND RECREATE FLOAT_TRUCKS TABLE
-- =====================================================

-- First, drop the existing table if it exists
DROP TABLE IF EXISTS float_trucks CASCADE;

-- Create the float_trucks table with the correct structure
CREATE TABLE float_trucks (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    current_location TEXT,
    currentLocation TEXT,
    coordinates TEXT,
    coordinates_lat DECIMAL(10, 8),
    coordinates_lng DECIMAL(11, 8),
    phone TEXT,
    email TEXT,
    schedule TEXT,
    tracking_method TEXT,
    trackingMethod TEXT,
    gps_tracker_id TEXT,
    gpsTrackerId TEXT,
    driver_phone TEXT,
    driverPhone TEXT,
    next_stop TEXT,
    nextStop TEXT,
    estimated_arrival TEXT,
    estimatedArrival TEXT,
    rating DECIMAL(3, 2),
    description TEXT,
    status TEXT DEFAULT 'active',
    image_url TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE float_trucks ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Anyone can read float trucks (public data)
CREATE POLICY "Anyone can read float trucks" ON float_trucks
    FOR SELECT USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage float trucks" ON float_trucks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
        )
    );

-- Insert sample data
INSERT INTO float_trucks (
    name, 
    category, 
    current_location, 
    currentLocation, 
    coordinates, 
    coordinates_lat, 
    coordinates_lng, 
    phone, 
    email, 
    schedule, 
    tracking_method, 
    trackingMethod, 
    gps_tracker_id, 
    gpsTrackerId, 
    driver_phone, 
    driverPhone, 
    next_stop, 
    nextStop, 
    estimated_arrival, 
    estimatedArrival, 
    rating, 
    description, 
    status, 
    image_url, 
    image
) VALUES
(
    'Ice Cream Float Mobile',
    'Desserts',
    'Children''s Playground Area',
    'Children''s Playground Area',
    '51.5074, -0.1278',
    51.5074,
    -0.1278,
    '+44 7700 900004',
    'icecream@floattrucks.com',
    '12:00-18:00 Daily',
    'GPS Tracking',
    'GPS Tracking',
    'GPS-ICE-001',
    'GPS-ICE-001',
    '+44 7700 900104',
    '+44 7700 900104',
    'Main Square',
    'Main Square',
    '14:30',
    '14:30',
    4.7,
    'Delicious ice cream and frozen treats served from our mobile truck. Perfect for hot summer days!',
    'active',
    '🍦',
    '🍦'
),
(
    'Coffee Express Mobile',
    'Beverages',
    'Business District',
    'Business District',
    '51.5070, -0.1270',
    51.5070,
    -0.1270,
    '+44 7700 900005',
    'coffee@floattrucks.com',
    '07:00-17:00 Weekdays',
    'GPS Tracking',
    'GPS Tracking',
    'GPS-COF-002',
    'GPS-COF-002',
    '+44 7700 900105',
    '+44 7700 900105',
    'Office Park',
    'Office Park',
    '09:15',
    '09:15',
    4.5,
    'Premium coffee and espresso drinks served fresh from our mobile coffee truck. Perfect for busy professionals!',
    'active',
    '☕',
    '☕'
),
(
    'Taco Truck Deluxe',
    'Mexican Food',
    'Park Area',
    'Park Area',
    '51.5080, -0.1280',
    51.5080,
    -0.1280,
    '+44 7700 900006',
    'tacos@floattrucks.com',
    '11:00-20:00 Daily',
    'GPS Tracking',
    'GPS Tracking',
    'GPS-TAC-003',
    'GPS-TAC-003',
    '+44 7700 900106',
    '+44 7700 900106',
    'Festival Grounds',
    'Festival Grounds',
    '12:45',
    '12:45',
    4.8,
    'Authentic Mexican street food including tacos, burritos, and quesadillas. Fresh ingredients and bold flavors!',
    'active',
    '🌮',
    '🌮'
);

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'float_trucks' 
ORDER BY ordinal_position;

-- Verify the data was inserted
SELECT * FROM float_trucks;
