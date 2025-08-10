-- Fix Food Stalls Table Structure
-- Run this in your Supabase SQL Editor

-- =====================================================
-- DROP AND RECREATE FOOD_STALLS TABLE
-- =====================================================

-- First, drop the existing table if it exists
DROP TABLE IF EXISTS food_stalls CASCADE;

-- Create the food_stalls table with the correct structure
CREATE TABLE food_stalls (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    contact TEXT,
    email TEXT,
    phone TEXT,
    operating_hours TEXT,
    hours TEXT,
    coordinates TEXT,
    coordinates_lat DECIMAL(10, 8),
    coordinates_lng DECIMAL(11, 8),
    status TEXT DEFAULT 'active',
    image_url TEXT,
    image TEXT,
    category TEXT,
    rating DECIMAL(3, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE food_stalls ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Anyone can read food stalls
CREATE POLICY "Anyone can read food stalls" ON food_stalls
    FOR SELECT USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage food stalls" ON food_stalls
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
        )
    );

-- Insert sample data
INSERT INTO food_stalls (name, description, location, contact, email, phone, operating_hours, hours, coordinates, coordinates_lat, coordinates_lng, status, image_url, image, category, rating) VALUES
('Burger Palace', 'Delicious gourmet burgers', 'Main Street', '+44 7700 900001', 'burger@example.com', '+44 7700 900001', '08:00-18:00', '08:00-18:00', '51.5074, -0.1278', 51.5074, -0.1278, 'active', '🍔', '🍔', 'Fast Food', 4.5),
('Pizza Express', 'Authentic Italian pizza', 'Food Court', '+44 7700 900002', 'pizza@example.com', '+44 7700 900002', '10:00-22:00', '10:00-22:00', '51.5070, -0.1270', 51.5070, -0.1270, 'active', '🍕', '🍕', 'Italian', 4.2),
('Taco Truck', 'Mexican street food', 'Park Area', '+44 7700 900003', 'taco@example.com', '+44 7700 900003', '11:00-20:00', '11:00-20:00', '51.5080, -0.1280', 51.5080, -0.1280, 'active', '🌮', '🌮', 'Mexican', 4.8);

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'food_stalls' 
ORDER BY ordinal_position;

-- Verify the data was inserted
SELECT * FROM food_stalls;
