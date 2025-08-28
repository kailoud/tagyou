-- Carnival Squad Members Table
-- This table stores squad members for the carnival tracker feature

-- Create the carnival_squad_members table
CREATE TABLE IF NOT EXISTS carnival_squad_members (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    relationship VARCHAR(100),
    email VARCHAR(255),
    is_sharing BOOLEAN DEFAULT false,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_area VARCHAR(255),
    last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    avatar_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE carnival_squad_members IS 'Stores carnival squad members for location sharing and tracking';
COMMENT ON COLUMN carnival_squad_members.user_id IS 'Reference to the authenticated user who owns this squad';
COMMENT ON COLUMN carnival_squad_members.name IS 'Display name of the squad member';
COMMENT ON COLUMN carnival_squad_members.phone IS 'Phone number for calling/messaging';
COMMENT ON COLUMN carnival_squad_members.relationship IS 'Relationship to the user (Friend, Family, etc.)';
COMMENT ON COLUMN carnival_squad_members.is_sharing IS 'Whether this member is currently sharing location';
COMMENT ON COLUMN carnival_squad_members.location_lat IS 'Current latitude if sharing location';
COMMENT ON COLUMN carnival_squad_members.location_lng IS 'Current longitude if sharing location';
COMMENT ON COLUMN carnival_squad_members.location_area IS 'Human-readable area name';
COMMENT ON COLUMN carnival_squad_members.avatar_data IS 'JSON data for avatar display';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_carnival_squad_user_id ON carnival_squad_members(user_id);
CREATE INDEX IF NOT EXISTS idx_carnival_squad_sharing ON carnival_squad_members(is_sharing);
CREATE INDEX IF NOT EXISTS idx_carnival_squad_created_at ON carnival_squad_members(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE carnival_squad_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own squad members
CREATE POLICY "Users can view their own squad members" ON carnival_squad_members
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own squad members
CREATE POLICY "Users can insert their own squad members" ON carnival_squad_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own squad members
CREATE POLICY "Users can update their own squad members" ON carnival_squad_members
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own squad members
CREATE POLICY "Users can delete their own squad members" ON carnival_squad_members
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_carnival_squad_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_carnival_squad_updated_at
    BEFORE UPDATE ON carnival_squad_members
    FOR EACH ROW
    EXECUTE FUNCTION update_carnival_squad_updated_at();

-- Insert some sample data (optional - for testing)
-- INSERT INTO carnival_squad_members (user_id, name, phone, relationship, is_sharing, location_area)
-- VALUES 
--     ('00000000-0000-0000-0000-000000000000', 'John Doe', '+1234567890', 'Friend', true, 'Ladbroke Grove'),
--     ('00000000-0000-0000-0000-000000000000', 'Jane Smith', '+0987654321', 'Family', false, 'Portobello Road');

-- Grant necessary permissions
GRANT ALL ON carnival_squad_members TO authenticated;
GRANT USAGE ON SEQUENCE carnival_squad_members_id_seq TO authenticated;
