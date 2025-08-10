-- Force Fix Float Trucks Table
-- This script will definitely fix the currentLocation issue

-- =====================================================
-- COMPLETELY DROP AND RECREATE THE TABLE
-- =====================================================

-- Drop the table completely (this will remove all data)
DROP TABLE IF EXISTS float_trucks CASCADE;

-- Create the table with ALL possible column variations
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

-- Enable RLS
ALTER TABLE float_trucks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read float trucks" ON float_trucks
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage float trucks" ON float_trucks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
        )
    );

-- Insert test data
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
    'Test Float Truck',
    'Test Category',
    'Test Location',
    'Test Location',
    '51.5074, -0.1278',
    51.5074,
    -0.1278,
    '+44 7700 900000',
    'test@example.com',
    '09:00-17:00',
    'GPS',
    'GPS',
    'GPS-TEST-001',
    'GPS-TEST-001',
    '+44 7700 900001',
    '+44 7700 900001',
    'Next Stop',
    'Next Stop',
    '12:00',
    '12:00',
    4.5,
    'Test description',
    'active',
    '🚚',
    '🚚'
);

-- Verify the table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'float_trucks' 
ORDER BY ordinal_position;

-- Test that currentLocation column exists and works
SELECT name, currentLocation FROM float_trucks WHERE id = 1;
