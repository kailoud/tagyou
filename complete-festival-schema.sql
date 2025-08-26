-- Complete Festival Schema for TagYou Integration
-- This file contains ALL tables needed for the festival information system
-- Execute this file in order to set up the complete database schema

-- =====================================================
-- STEP 1: CARNIVALS TABLE (must be created first)
-- =====================================================

-- Create carnivals table
CREATE TABLE IF NOT EXISTS carnivals (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE, -- ID from tagyou.org
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    date VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'upcoming', -- active, upcoming, finished
    description TEXT,
    website VARCHAR(500),
    expected_attendance VARCHAR(100),
    highlights JSONB, -- Array of highlights
    route_data JSONB, -- Map route data
    coordinates JSONB, -- Latitude/longitude
    images JSONB, -- Array of image URLs
    tags JSONB, -- Array of tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for carnivals table
CREATE INDEX IF NOT EXISTS idx_carnivals_status ON carnivals(status);
CREATE INDEX IF NOT EXISTS idx_carnivals_location ON carnivals(location);
CREATE INDEX IF NOT EXISTS idx_carnivals_date ON carnivals(date);
CREATE INDEX IF NOT EXISTS idx_carnivals_external_id ON carnivals(external_id);

-- Enable Row Level Security (RLS) for carnivals
ALTER TABLE carnivals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for carnivals
CREATE POLICY "Allow authenticated users to read carnivals" ON carnivals
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to manage carnivals" ON carnivals
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow anonymous users to read carnivals" ON carnivals
    FOR SELECT USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_carnivals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at for carnivals
CREATE TRIGGER update_carnivals_updated_at_trigger
    BEFORE UPDATE ON carnivals
    FOR EACH ROW
    EXECUTE FUNCTION update_carnivals_updated_at();

-- =====================================================
-- STEP 2: FESTIVAL TABLES (created after carnivals)
-- =====================================================

-- FOOD STALLS TABLE
CREATE TABLE IF NOT EXISTS food_stalls (
    id SERIAL PRIMARY KEY,
    carnival_id INTEGER REFERENCES carnivals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    cuisine VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    price_range VARCHAR(10) CHECK (price_range IN ('£', '££', '£££', '££££')),
    image_url TEXT,
    coordinates JSONB, -- Latitude/longitude for map positioning
    opening_hours JSONB, -- Array of opening hours
    special_dietary_options JSONB, -- Array of dietary options (vegan, gluten-free, etc.)
    contact_info JSONB, -- Phone, email, social media
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold_out')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FLOAT TRUCKS TABLE
CREATE TABLE IF NOT EXISTS float_trucks (
    id SERIAL PRIMARY KEY,
    carnival_id INTEGER REFERENCES carnivals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    theme VARCHAR(255) NOT NULL,
    route VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    coordinates JSONB, -- Latitude/longitude for map positioning
    parade_schedule JSONB, -- Array of parade times and dates
    participants_count INTEGER DEFAULT 0,
    music_type VARCHAR(100),
    special_effects JSONB, -- Array of special effects (fire, lights, etc.)
    contact_info JSONB, -- Organizer contact details
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ARTISTS TABLE
CREATE TABLE IF NOT EXISTS artists (
    id SERIAL PRIMARY KEY,
    carnival_id INTEGER REFERENCES carnivals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    stage VARCHAR(255) NOT NULL,
    time VARCHAR(10) NOT NULL, -- Format: HH:MM
    description TEXT,
    image_url TEXT,
    coordinates JSONB, -- Latitude/longitude for stage location
    performance_duration INTEGER, -- Duration in minutes
    setlist JSONB, -- Array of songs to be performed
    social_media JSONB, -- Social media links
    booking_agent JSONB, -- Agent contact information
    special_requirements JSONB, -- Technical requirements, backstage needs
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 3: INDEXES FOR FESTIVAL TABLES
-- =====================================================

-- Food Stalls Indexes
CREATE INDEX IF NOT EXISTS idx_food_stalls_carnival_id ON food_stalls(carnival_id);
CREATE INDEX IF NOT EXISTS idx_food_stalls_cuisine ON food_stalls(cuisine);
CREATE INDEX IF NOT EXISTS idx_food_stalls_location ON food_stalls(location);
CREATE INDEX IF NOT EXISTS idx_food_stalls_rating ON food_stalls(rating);
CREATE INDEX IF NOT EXISTS idx_food_stalls_status ON food_stalls(status);

-- Float Trucks Indexes
CREATE INDEX IF NOT EXISTS idx_float_trucks_carnival_id ON float_trucks(carnival_id);
CREATE INDEX IF NOT EXISTS idx_float_trucks_theme ON float_trucks(theme);
CREATE INDEX IF NOT EXISTS idx_float_trucks_route ON float_trucks(route);
CREATE INDEX IF NOT EXISTS idx_float_trucks_status ON float_trucks(status);

-- Artists Indexes
CREATE INDEX IF NOT EXISTS idx_artists_carnival_id ON artists(carnival_id);
CREATE INDEX IF NOT EXISTS idx_artists_genre ON artists(genre);
CREATE INDEX IF NOT EXISTS idx_artists_stage ON artists(stage);
CREATE INDEX IF NOT EXISTS idx_artists_time ON artists(time);
CREATE INDEX IF NOT EXISTS idx_artists_status ON artists(status);

-- =====================================================
-- STEP 4: ROW LEVEL SECURITY (RLS) FOR FESTIVAL TABLES
-- =====================================================

-- Enable RLS on all festival tables
ALTER TABLE food_stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE float_trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Food Stalls RLS Policies
CREATE POLICY "Allow authenticated users to read food stalls" ON food_stalls
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to manage food stalls" ON food_stalls
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow anonymous users to read food stalls" ON food_stalls
    FOR SELECT USING (true);

-- Float Trucks RLS Policies
CREATE POLICY "Allow authenticated users to read float trucks" ON float_trucks
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to manage float trucks" ON float_trucks
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow anonymous users to read float trucks" ON float_trucks
    FOR SELECT USING (true);

-- Artists RLS Policies
CREATE POLICY "Allow authenticated users to read artists" ON artists
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to manage artists" ON artists
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow anonymous users to read artists" ON artists
    FOR SELECT USING (true);

-- =====================================================
-- STEP 5: TRIGGER FUNCTIONS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp for festival tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for all festival tables
CREATE TRIGGER update_food_stalls_updated_at_trigger
    BEFORE UPDATE ON food_stalls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_float_trucks_updated_at_trigger
    BEFORE UPDATE ON float_trucks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artists_updated_at_trigger
    BEFORE UPDATE ON artists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 6: SAMPLE DATA
-- =====================================================

-- Insert sample carnival data first
INSERT INTO carnivals (external_id, name, location, date, status, description, website, expected_attendance, highlights) 
VALUES 
    ('nhc-2025', 'Notting Hill Carnival', 'London', 'Aug 24-26, 2025', 'active', 'Europe''s largest street festival celebrating Caribbean culture', 'https://thelondonnottinghillcarnival.com', '2+ million', '["Steel Pan Competition", "Mas Bands", "Sound Systems", "Caribbean Food"]'),
    ('mcc-2025', 'Manchester Caribbean Carnival', 'Manchester', 'Aug 9-10, 2025', 'finished', 'Celebrating Caribbean heritage in the heart of Manchester', 'https://manchestercarnival.com', '100,000+', '["Parade Route", "Alexandra Park Festival", "Local Caribbean Cuisine"]'),
    ('lwic-2025', 'Leeds West Indian Carnival', 'Leeds', 'Aug 25, 2025', 'upcoming', 'One of the oldest Caribbean carnivals in Europe', 'https://leedscarnival.co.uk', '150,000+', '["Chapeltown Festival", "Steel Band Competition", "Caribbean Market"]'),
    ('bic-2025', 'Birmingham International Carnival', 'Birmingham', 'Sep 13-14, 2025', 'upcoming', 'A vibrant celebration of multicultural Birmingham', 'https://birminghamcarnival.com', '75,000+', '["Handsworth Park", "International Food Village", "Live Music Stages"]')
ON CONFLICT (external_id) DO NOTHING;

-- Sample Food Stalls Data (for Notting Hill Carnival - ID 1)
INSERT INTO food_stalls (carnival_id, name, cuisine, location, description, rating, price_range, image_url, coordinates) 
VALUES 
    (1, 'Caribbean Delights', 'Caribbean', 'Ladbroke Grove', 'Authentic Caribbean jerk chicken and rice & peas', 4.8, '££', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=150&h=100&fit=crop', '{"lat": 51.516369, "lng": -0.209404}'),
    (1, 'Street Food Fusion', 'International', 'Portobello Road', 'Global street food with a carnival twist', 4.6, '£', 'https://images.unsplash.com/photo-1504674900244-1b47f22f8f54?w=150&h=100&fit=crop', '{"lat": 51.519641, "lng": -0.199409}'),
    (1, 'Sweet Treats Corner', 'Desserts', 'Westbourne Park', 'Homemade cakes, ice cream, and carnival sweets', 4.9, '£', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=150&h=100&fit=crop', '{"lat": 51.522245, "lng": -0.201107}')
ON CONFLICT DO NOTHING;

-- Sample Float Trucks Data
INSERT INTO float_trucks (carnival_id, name, theme, route, description, image_url, coordinates) 
VALUES 
    (1, 'Dragon Float', 'Mythical Creatures', 'Main Parade Route', 'Spectacular dragon float with fire effects', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=100&fit=crop', '{"lat": 51.516369, "lng": -0.209404}'),
    (1, 'Ocean Waves', 'Under the Sea', 'Secondary Route', 'Beautiful ocean-themed float with marine life', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=100&fit=crop', '{"lat": 51.519641, "lng": -0.199409}'),
    (1, 'Cultural Heritage', 'Caribbean History', 'Main Parade Route', 'Celebrating Caribbean culture and history', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&h=100&fit=crop', '{"lat": 51.522245, "lng": -0.201107}')
ON CONFLICT DO NOTHING;

-- Sample Artists Data
INSERT INTO artists (carnival_id, name, genre, stage, time, description, image_url, coordinates) 
VALUES 
    (1, 'Steel Pulse', 'Reggae', 'Main Stage', '14:00', 'Legendary reggae band from Birmingham', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=100&fit=crop', '{"lat": 51.516369, "lng": -0.209404}'),
    (1, 'Soca Warriors', 'Soca', 'Dance Arena', '16:30', 'High-energy soca music and dance', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=150&h=100&fit=crop', '{"lat": 51.519641, "lng": -0.199409}'),
    (1, 'Carnival Collective', 'World Music', 'Community Stage', '18:00', 'Local artists celebrating carnival culture', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=100&fit=crop', '{"lat": 51.522245, "lng": -0.201107}')
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 7: DATABASE VIEWS
-- =====================================================

-- View for all festival information for a specific carnival
CREATE OR REPLACE VIEW festival_overview AS
SELECT 
    c.id as carnival_id,
    c.name as carnival_name,
    c.location as carnival_location,
    c.date as carnival_date,
    COUNT(DISTINCT fs.id) as food_stalls_count,
    COUNT(DISTINCT ft.id) as float_trucks_count,
    COUNT(DISTINCT a.id) as artists_count
FROM carnivals c
LEFT JOIN food_stalls fs ON c.id = fs.carnival_id AND fs.status = 'active'
LEFT JOIN float_trucks ft ON c.id = ft.carnival_id AND ft.status = 'active'
LEFT JOIN artists a ON c.id = a.carnival_id AND a.status = 'confirmed'
GROUP BY c.id, c.name, c.location, c.date;

-- View for food stalls with ratings
CREATE OR REPLACE VIEW top_rated_food_stalls AS
SELECT 
    fs.*,
    c.name as carnival_name
FROM food_stalls fs
JOIN carnivals c ON fs.carnival_id = c.id
WHERE fs.rating >= 4.0 AND fs.status = 'active'
ORDER BY fs.rating DESC;

-- View for artists by stage and time
CREATE OR REPLACE VIEW artist_schedule AS
SELECT 
    a.*,
    c.name as carnival_name
FROM artists a
JOIN carnivals c ON a.carnival_id = c.id
WHERE a.status = 'confirmed'
ORDER BY a.time, a.stage;

-- =====================================================
-- STEP 8: COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON TABLE carnivals IS 'Stores information about carnivals and festivals';
COMMENT ON TABLE food_stalls IS 'Stores information about food vendors at carnivals';
COMMENT ON TABLE float_trucks IS 'Stores information about parade floats and trucks';
COMMENT ON TABLE artists IS 'Stores information about performing artists and bands';

COMMENT ON COLUMN food_stalls.coordinates IS 'JSON object with lat and lng for map positioning';
COMMENT ON COLUMN food_stalls.opening_hours IS 'JSON array of opening hours for each day';
COMMENT ON COLUMN food_stalls.special_dietary_options IS 'JSON array of dietary options (vegan, gluten-free, etc.)';

COMMENT ON COLUMN float_trucks.parade_schedule IS 'JSON array of parade times and dates';
COMMENT ON COLUMN float_trucks.special_effects IS 'JSON array of special effects (fire, lights, etc.)';

COMMENT ON COLUMN artists.setlist IS 'JSON array of songs to be performed';
COMMENT ON COLUMN artists.special_requirements IS 'JSON object of technical requirements and backstage needs';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

-- This will show a success message when the script completes
SELECT 'Festival database schema created successfully! (Food Stalls, Float Trucks, Artists)' as status;
