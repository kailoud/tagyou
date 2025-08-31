-- Complete TagYou Database Reset and Setup
-- Professional, tested solution for authentication and user management
-- This script completely resets and properly configures the database

-- =====================================================
-- STEP 1: CLEAN SLATE - DROP ALL EXISTING OBJECTS
-- =====================================================

-- Drop all existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_premium_users_updated_at ON premium_users;
DROP TRIGGER IF EXISTS update_carnivals_updated_at_trigger ON carnivals;

-- Drop all existing functions
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_carnivals_updated_at();
DROP FUNCTION IF EXISTS upgrade_to_premium(TEXT, JSONB);
DROP FUNCTION IF EXISTS is_user_premium(TEXT);
DROP FUNCTION IF EXISTS create_user_profile_manual(TEXT, UUID);
DROP FUNCTION IF EXISTS sync_premium_status();
DROP FUNCTION IF EXISTS deactivate_user(TEXT);
DROP FUNCTION IF EXISTS delete_user_profile_only(TEXT);
DROP FUNCTION IF EXISTS remove_user_completely(TEXT);
DROP FUNCTION IF EXISTS check_user_exists(TEXT);

-- Drop all existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS login_attempts CASCADE;
DROP TABLE IF EXISTS premium_users CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS carnivals CASCADE;

-- Drop all existing views
DROP VIEW IF EXISTS active_premium_users;

-- =====================================================
-- STEP 2: CREATE TABLES WITH PROPER CONSTRAINTS
-- =====================================================

-- Create carnivals table first (no dependencies)
CREATE TABLE carnivals (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    date VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'upcoming',
    description TEXT,
    website VARCHAR(500),
    expected_attendance VARCHAR(100),
    highlights JSONB,
    route_data JSONB,
    coordinates JSONB,
    images JSONB,
    tags JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table with proper constraints
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    phone TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    user_type TEXT NOT NULL DEFAULT 'basic' CHECK (user_type IN ('basic', 'premium')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    preferences JSONB DEFAULT '{"notifications":{"email":true,"push":true},"privacy":{"profile_visible":true,"location_visible":true},"theme":"auto","language":"en"}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create premium_users table with proper constraints
CREATE TABLE premium_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'unpaid')),
    payment_provider TEXT DEFAULT 'stripe',
    payment_provider_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, email)
);

-- Create user_favorites table
CREATE TABLE user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    carnival_id INTEGER NOT NULL REFERENCES carnivals(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, carnival_id)
);

-- Create login_attempts table
CREATE TABLE login_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Carnivals indexes
CREATE INDEX idx_carnivals_status ON carnivals(status);
CREATE INDEX idx_carnivals_location ON carnivals(location);
CREATE INDEX idx_carnivals_date ON carnivals(date);
CREATE INDEX idx_carnivals_external_id ON carnivals(external_id);

-- User profiles indexes
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);

-- Premium users indexes
CREATE INDEX idx_premium_users_email ON premium_users(email);
CREATE INDEX idx_premium_users_user_id ON premium_users(user_id);
CREATE INDEX idx_premium_users_status ON premium_users(subscription_status);

-- User favorites indexes
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_carnival_id ON user_favorites(carnival_id);

-- Login attempts indexes
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_attempted_at ON login_attempts(attempted_at);

-- =====================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE carnivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: CREATE RLS POLICIES
-- =====================================================

-- Carnivals policies (public read access)
CREATE POLICY "Allow public read access to carnivals" ON carnivals
    FOR SELECT USING (true);

CREATE POLICY "Allow service role full access to carnivals" ON carnivals
    FOR ALL USING (auth.role() = 'service_role');

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles" ON user_profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Premium users policies
CREATE POLICY "Users can view their own premium status" ON premium_users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all premium users" ON premium_users
    FOR ALL USING (auth.role() = 'service_role');

-- User favorites policies
CREATE POLICY "Users can view their own favorites" ON user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" ON user_favorites
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all favorites" ON user_favorites
    FOR ALL USING (auth.role() = 'service_role');

-- Login attempts policies
CREATE POLICY "Service role can manage login attempts" ON login_attempts
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- STEP 6: CREATE FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name', 
            split_part(NEW.email, '@', 1)
        )
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upgrade user to premium
CREATE OR REPLACE FUNCTION upgrade_to_premium(user_email TEXT, payment_data JSONB DEFAULT '{}')
RETURNS BOOLEAN AS $$
DECLARE
    user_uuid UUID;
BEGIN
    SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User not found: %', user_email;
    END IF;
    
    -- Update user type to premium
    UPDATE user_profiles 
    SET user_type = 'premium', updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Create or update premium user record
    INSERT INTO premium_users (user_id, email, subscription_status, payment_provider_id, current_period_start, current_period_end)
    VALUES (
        user_uuid,
        user_email,
        'active',
        payment_data->>'payment_provider_id',
        COALESCE((payment_data->>'current_period_start')::timestamp, NOW()),
        COALESCE((payment_data->>'current_period_end')::timestamp, NOW() + INTERVAL '1 month')
    )
    ON CONFLICT (user_id) DO UPDATE SET
        subscription_status = 'active',
        current_period_start = COALESCE((payment_data->>'current_period_start')::timestamp, NOW()),
        current_period_end = COALESCE((payment_data->>'current_period_end')::timestamp, NOW() + INTERVAL '1 month'),
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is premium
CREATE OR REPLACE FUNCTION is_user_premium(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_uuid UUID;
    is_premium BOOLEAN;
BEGIN
    SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    SELECT user_type = 'premium' INTO is_premium 
    FROM user_profiles 
    WHERE id = user_uuid;
    
    RETURN COALESCE(is_premium, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to properly delete a user (removes from auth.users)
CREATE OR REPLACE FUNCTION delete_user_completely(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    user_uuid UUID;
    result_message TEXT;
BEGIN
    -- Get user ID
    SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RETURN 'User not found: ' || user_email;
    END IF;
    
    -- Delete from all tables (cascade will handle related records)
    DELETE FROM user_favorites WHERE user_id = user_uuid;
    DELETE FROM premium_users WHERE user_id = user_uuid;
    DELETE FROM user_profiles WHERE id = user_uuid;
    DELETE FROM login_attempts WHERE user_id = user_uuid;
    
    -- Delete from auth.users (this is the key part)
    DELETE FROM auth.users WHERE id = user_uuid;
    
    result_message := 'User completely deleted: ' || user_email;
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 7: CREATE TRIGGERS
-- =====================================================

-- Trigger to create profile on new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Triggers to update updated_at timestamp
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_premium_users_updated_at
    BEFORE UPDATE ON premium_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carnivals_updated_at
    BEFORE UPDATE ON carnivals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 8: GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT ON premium_users TO authenticated;
GRANT ALL ON user_favorites TO authenticated;
GRANT SELECT ON carnivals TO authenticated;

-- Grant permissions to service role
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON premium_users TO service_role;
GRANT ALL ON user_favorites TO service_role;
GRANT ALL ON login_attempts TO service_role;
GRANT ALL ON carnivals TO service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION upgrade_to_premium(TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION upgrade_to_premium(TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION is_user_premium(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_premium(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION delete_user_completely(TEXT) TO service_role;

-- =====================================================
-- STEP 9: INSERT SAMPLE DATA
-- =====================================================

-- Insert sample carnival data
INSERT INTO carnivals (external_id, name, location, date, status, description, website, expected_attendance, highlights) 
VALUES 
    ('nhc-2025', 'Notting Hill Carnival', 'London', 'Aug 24-26, 2025', 'active', 'Europe''s largest street festival celebrating Caribbean culture', 'https://thelondonnottinghillcarnival.com', '2+ million', '["Steel Pan Competition", "Mas Bands", "Sound Systems", "Caribbean Food"]'),
    ('mcc-2025', 'Manchester Caribbean Carnival', 'Manchester', 'Aug 9-10, 2025', 'finished', 'Celebrating Caribbean heritage in the heart of Manchester', 'https://manchestercarnival.com', '100,000+', '["Parade Route", "Alexandra Park Festival", "Local Caribbean Cuisine"]'),
    ('lwic-2025', 'Leeds West Indian Carnival', 'Leeds', 'Aug 25, 2025', 'upcoming', 'One of the oldest Caribbean carnivals in Europe', 'https://leedscarnival.co.uk', '150,000+', '["Chapeltown Festival", "Steel Band Competition", "Caribbean Market"]'),
    ('bic-2025', 'Birmingham International Carnival', 'Birmingham', 'Sep 13-14, 2025', 'upcoming', 'A vibrant celebration of multicultural Birmingham', 'https://birminghamcarnival.com', '75,000+', '["Handsworth Park", "International Food Village", "Live Music Stages"]')
ON CONFLICT (external_id) DO NOTHING;

-- =====================================================
-- STEP 10: CREATE VIEWS
-- =====================================================

-- View for active premium users
CREATE VIEW active_premium_users AS
SELECT 
    up.id,
    up.email,
    up.display_name,
    up.user_type,
    pu.subscription_status,
    pu.current_period_start,
    pu.current_period_end,
    up.created_at,
    up.updated_at
FROM user_profiles up
LEFT JOIN premium_users pu ON up.id = pu.user_id
WHERE up.user_type = 'premium' 
AND up.status = 'active'
AND (pu.subscription_status = 'active' OR pu.subscription_status IS NULL);

-- Grant permissions on view
GRANT SELECT ON active_premium_users TO authenticated;
GRANT SELECT ON active_premium_users TO service_role;

-- =====================================================
-- STEP 11: VERIFICATION
-- =====================================================

-- Verify all tables exist
SELECT 'Tables created:' as verification,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('carnivals', 'user_profiles', 'premium_users', 'user_favorites', 'login_attempts');

-- Verify triggers exist
SELECT 'Triggers created:' as verification,
    COUNT(*) as count
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Verify functions exist
SELECT 'Functions created:' as verification,
    COUNT(*) as count
FROM pg_proc 
WHERE proname IN ('handle_new_user', 'upgrade_to_premium', 'is_user_premium', 'delete_user_completely');

-- =====================================================
-- COMPLETION
-- =====================================================

SELECT '✅ Complete database reset and setup completed!' as status;
SELECT 'All tables, triggers, functions, and policies have been properly configured.' as message;
SELECT 'Use delete_user_completely() function to properly delete users.' as important_note;
SELECT 'Test the system with fresh-auth-test.html to verify everything works.' as next_step;
