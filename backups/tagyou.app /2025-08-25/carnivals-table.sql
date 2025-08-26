-- Carnivals Table for TagYou Integration
-- This table stores carnival data synced from tagyou.org

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_carnivals_status ON carnivals(status);
CREATE INDEX IF NOT EXISTS idx_carnivals_location ON carnivals(location);
CREATE INDEX IF NOT EXISTS idx_carnivals_date ON carnivals(date);
CREATE INDEX IF NOT EXISTS idx_carnivals_external_id ON carnivals(external_id);

-- Enable Row Level Security (RLS)
ALTER TABLE carnivals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow all authenticated users to read carnivals
CREATE POLICY "Allow authenticated users to read carnivals" ON carnivals
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role to manage carnivals (for admin panel)
CREATE POLICY "Allow service role to manage carnivals" ON carnivals
    FOR ALL USING (auth.role() = 'service_role');

-- Allow anonymous users to read carnivals (for public access)
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

-- Trigger to automatically update updated_at
CREATE TRIGGER update_carnivals_updated_at_trigger
    BEFORE UPDATE ON carnivals
    FOR EACH ROW
    EXECUTE FUNCTION update_carnivals_updated_at();

-- Insert some sample carnival data (you can remove this after real data is synced)
INSERT INTO carnivals (external_id, name, location, date, status, description, website, expected_attendance, highlights) 
VALUES 
    ('nhc-2025', 'Notting Hill Carnival', 'London', 'Aug 24-26, 2025', 'active', 'Europe''s largest street festival celebrating Caribbean culture', 'https://thelondonnottinghillcarnival.com', '2+ million', '["Steel Pan Competition", "Mas Bands", "Sound Systems", "Caribbean Food"]'),
    ('mcc-2025', 'Manchester Caribbean Carnival', 'Manchester', 'Aug 9-10, 2025', 'finished', 'Celebrating Caribbean heritage in the heart of Manchester', 'https://manchestercarnival.com', '100,000+', '["Parade Route", "Alexandra Park Festival", "Local Caribbean Cuisine"]'),
    ('lwic-2025', 'Leeds West Indian Carnival', 'Leeds', 'Aug 25, 2025', 'upcoming', 'One of the oldest Caribbean carnivals in Europe', 'https://leedscarnival.co.uk', '150,000+', '["Chapeltown Festival", "Steel Band Competition", "Caribbean Market"]'),
    ('bic-2025', 'Birmingham International Carnival', 'Birmingham', 'Sep 13-14, 2025', 'upcoming', 'A vibrant celebration of multicultural Birmingham', 'https://birminghamcarnival.com', '75,000+', '["Handsworth Park", "International Food Village", "Live Music Stages"]')
ON CONFLICT (external_id) DO NOTHING;
