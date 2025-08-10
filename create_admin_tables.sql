-- Create Admin Tables for GroupTracker
-- Run this in your Supabase SQL Editor

-- =====================================================
-- CREATE ADMIN TABLES
-- =====================================================

-- 1. Create food_stalls table
CREATE TABLE IF NOT EXISTS food_stalls (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    contact TEXT,
    email TEXT,
    phone TEXT,
    operating_hours TEXT,
    coordinates_lat DECIMAL(10, 8),
    coordinates_lng DECIMAL(11, 8),
    status TEXT DEFAULT 'active',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create float_trucks table
CREATE TABLE IF NOT EXISTS float_trucks (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    contact TEXT,
    email TEXT,
    phone TEXT,
    operating_hours TEXT,
    coordinates_lat DECIMAL(10, 8),
    coordinates_lng DECIMAL(11, 8),
    status TEXT DEFAULT 'active',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create groups table
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    member_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create friends table
CREATE TABLE IF NOT EXISTS friends (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'online',
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE food_stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE float_trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- Food Stalls Policies
-- Anyone can read food stalls (public data)
CREATE POLICY "Anyone can read food stalls" ON food_stalls
    FOR SELECT USING (true);

-- Only admins can insert/update/delete food stalls
CREATE POLICY "Admins can manage food stalls" ON food_stalls
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
        )
    );

-- Float Trucks Policies
-- Anyone can read float trucks (public data)
CREATE POLICY "Anyone can read float trucks" ON float_trucks
    FOR SELECT USING (true);

-- Only admins can insert/update/delete float trucks
CREATE POLICY "Admins can manage float trucks" ON float_trucks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
        )
    );

-- Groups Policies
-- Anyone can read groups (public data)
CREATE POLICY "Anyone can read groups" ON groups
    FOR SELECT USING (true);

-- Only admins can insert/update/delete groups
CREATE POLICY "Admins can manage groups" ON groups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
        )
    );

-- Friends Policies
-- Anyone can read friends (public data)
CREATE POLICY "Anyone can read friends" ON friends
    FOR SELECT USING (true);

-- Only admins can insert/update/delete friends
CREATE POLICY "Admins can manage friends" ON friends
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
        )
    );

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert sample food stalls
INSERT INTO food_stalls (name, description, location, contact, email, phone, operating_hours, coordinates_lat, coordinates_lng, status, image_url) VALUES
('Burger Palace', 'Delicious gourmet burgers', 'Main Street', '+44 7700 900001', 'burger@example.com', '+44 7700 900001', '08:00-18:00', 51.5074, -0.1278, 'active', '🍔'),
('Pizza Express', 'Authentic Italian pizza', 'Food Court', '+44 7700 900002', 'pizza@example.com', '+44 7700 900002', '10:00-22:00', 51.5070, -0.1270, 'active', '🍕'),
('Taco Truck', 'Mexican street food', 'Park Area', '+44 7700 900003', 'taco@example.com', '+44 7700 900003', '11:00-20:00', 51.5080, -0.1280, 'active', '🌮')
ON CONFLICT DO NOTHING;

-- Insert sample float trucks
INSERT INTO float_trucks (name, description, location, contact, email, phone, operating_hours, coordinates_lat, coordinates_lng, status, image_url) VALUES
('Ice Cream Float', 'Mobile ice cream truck', 'Children''s Area', '+44 7700 900004', 'icecream@example.com', '+44 7700 900004', '12:00-18:00', 51.5068, -0.1275, 'active', '🍦'),
('Coffee Mobile', 'Premium coffee on wheels', 'Business District', '+44 7700 900005', 'coffee@example.com', '+44 7700 900005', '07:00-17:00', 51.5074, -0.1278, 'active', '☕')
ON CONFLICT DO NOTHING;

-- Insert sample groups
INSERT INTO groups (name, description, member_count, status) VALUES
('Festival Squad 2025', 'Main festival group', 4, 'active'),
('Food Lovers', 'Group for food enthusiasts', 8, 'active')
ON CONFLICT DO NOTHING;

-- Insert sample friends
INSERT INTO friends (name, email, phone, status, avatar) VALUES
('Alex Johnson', 'alex@example.com', '+44 7700 900123', 'online', 'A'),
('Sarah Smith', 'sarah@example.com', '+44 7700 900124', 'online', 'S'),
('Mike Wilson', 'mike@example.com', '+44 7700 900125', 'away', 'M')
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('food_stalls', 'float_trucks', 'groups', 'friends');

-- Check if policies were created
SELECT schemaname, tablename, policyname FROM pg_policies 
WHERE tablename IN ('food_stalls', 'float_trucks', 'groups', 'friends');

-- Check sample data
SELECT 'food_stalls' as table_name, COUNT(*) as count FROM food_stalls
UNION ALL
SELECT 'float_trucks' as table_name, COUNT(*) as count FROM float_trucks
UNION ALL
SELECT 'groups' as table_name, COUNT(*) as count FROM groups
UNION ALL
SELECT 'friends' as table_name, COUNT(*) as count FROM friends;

-- =====================================================
-- INSTRUCTIONS
-- =====================================================

/*
TO USE THIS SCRIPT:

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste this entire script
4. Run the script
5. After running, try adding a food stall again in your Admin Portal

The script will:
- Create all necessary tables for the Admin Portal
- Set up proper permissions (only admins can modify data)
- Insert sample data to get you started
- Verify everything was created correctly

After running this script, you should be able to:
- Add new food stalls
- Edit existing food stalls
- Delete food stalls
- Manage float trucks, groups, and friends
*/
