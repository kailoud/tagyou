-- Supabase Database Schema for Modern Profile System
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    preferences JSONB DEFAULT '{
        "notifications": {
            "email": true,
            "push": true,
            "sms": false
        },
        "privacy": {
            "profile_visible": true,
            "location_visible": true,
            "activity_visible": true
        },
        "theme": "auto",
        "language": "en",
        "timezone": "UTC"
    }'::jsonb,
    settings JSONB DEFAULT '{
        "dark_mode": false,
        "auto_save": true,
        "location_services": true,
        "analytics": true
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('food_stall', 'artist', 'float_truck', 'location')),
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    item_description TEXT,
    item_location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

-- Create user_sessions table for tracking user activity
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    device_info JSONB,
    location_info JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item_type ON favorites(item_type);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (
        (preferences->>'privacy'->>'profile_visible')::boolean = true
    );

-- Favorites RLS Policies
CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites" ON favorites
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- User Sessions RLS Policies
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage buckets for avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Avatars are publicly viewable" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Create function to get user profile with favorites count
CREATE OR REPLACE FUNCTION get_user_profile_with_stats(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT,
    preferences JSONB,
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    favorites_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.*,
        COUNT(f.id)::BIGINT as favorites_count
    FROM profiles p
    LEFT JOIN favorites f ON p.id = f.user_id
    WHERE p.id = user_uuid
    GROUP BY p.id, p.email, p.display_name, p.avatar_url, p.bio, p.location, 
             p.website, p.phone, p.date_of_birth, p.gender, p.preferences, 
             p.settings, p.created_at, p.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to search profiles
CREATE OR REPLACE FUNCTION search_profiles(search_term TEXT)
RETURNS TABLE (
    id UUID,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.display_name,
        p.avatar_url,
        p.bio,
        p.location,
        p.created_at
    FROM profiles p
    WHERE 
        (p.preferences->>'privacy'->>'profile_visible')::boolean = true
        AND (
            p.display_name ILIKE '%' || search_term || '%'
            OR p.bio ILIKE '%' || search_term || '%'
            OR p.location ILIKE '%' || search_term || '%'
        )
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user favorites with details
CREATE OR REPLACE FUNCTION get_user_favorites(user_uuid UUID, item_type_filter TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    item_type TEXT,
    item_id TEXT,
    item_name TEXT,
    item_description TEXT,
    item_location TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.item_type,
        f.item_id,
        f.item_name,
        f.item_description,
        f.item_location,
        f.created_at
    FROM favorites f
    WHERE f.user_id = user_uuid
        AND (item_type_filter IS NULL OR f.item_type = item_type_filter)
    ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add favorite
CREATE OR REPLACE FUNCTION add_favorite(
    p_item_type TEXT,
    p_item_id TEXT,
    p_item_name TEXT,
    p_item_description TEXT DEFAULT NULL,
    p_item_location TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    favorite_id UUID;
BEGIN
    INSERT INTO favorites (
        user_id,
        item_type,
        item_id,
        item_name,
        item_description,
        item_location
    ) VALUES (
        auth.uid(),
        p_item_type,
        p_item_id,
        p_item_name,
        p_item_description,
        p_item_location
    )
    ON CONFLICT (user_id, item_type, item_id) DO NOTHING
    RETURNING id INTO favorite_id;
    
    RETURN favorite_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to remove favorite
CREATE OR REPLACE FUNCTION remove_favorite(p_item_type TEXT, p_item_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM favorites 
    WHERE user_id = auth.uid() 
        AND item_type = p_item_type 
        AND item_id = p_item_id;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if item is favorited
CREATE OR REPLACE FUNCTION is_favorited(p_item_type TEXT, p_item_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM favorites 
        WHERE user_id = auth.uid() 
            AND item_type = p_item_type 
            AND item_id = p_item_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Insert some sample data for testing (optional)
-- INSERT INTO profiles (id, email, display_name, bio, location) VALUES 
--     ('00000000-0000-0000-0000-000000000001', 'your-email@gmail.com', 'Your Name', 'Your profile description', 'Your Location');

-- Create comments for documentation
COMMENT ON TABLE profiles IS 'User profiles with preferences and settings';
COMMENT ON TABLE favorites IS 'User favorite items (food stalls, artists, etc.)';
COMMENT ON TABLE user_sessions IS 'User session tracking for analytics';
COMMENT ON FUNCTION get_user_profile_with_stats IS 'Get user profile with favorites count';
COMMENT ON FUNCTION search_profiles IS 'Search public profiles';
COMMENT ON FUNCTION get_user_favorites IS 'Get user favorites with optional type filter';
COMMENT ON FUNCTION add_favorite IS 'Add item to user favorites';
COMMENT ON FUNCTION remove_favorite IS 'Remove item from user favorites';
COMMENT ON FUNCTION is_favorited IS 'Check if item is in user favorites';
