-- Fresh Authentication Schema for TagYou
-- Clean implementation: Basic User → Premium User
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE USER TABLES
-- =====================================================

-- Basic user profiles (all users start here)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    phone TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    user_type TEXT DEFAULT 'basic' CHECK (user_type IN ('basic', 'premium')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    preferences JSONB DEFAULT '{
        "notifications": {
            "email": true,
            "push": true
        },
        "privacy": {
            "profile_visible": true,
            "location_visible": true
        },
        "theme": "auto",
        "language": "en"
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Premium user details (when users upgrade)
CREATE TABLE IF NOT EXISTS premium_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'unpaid')),
    payment_provider TEXT DEFAULT 'stripe',
    payment_provider_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User favorites (carnivals they want to track)
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    carnival_id INTEGER REFERENCES carnivals(id) ON DELETE CASCADE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, carnival_id)
);

-- =====================================================
-- SECURITY TABLES
-- =====================================================

-- Login attempts tracking
CREATE TABLE IF NOT EXISTS login_attempts (
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
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);

-- Premium users indexes
CREATE INDEX IF NOT EXISTS idx_premium_users_email ON premium_users(email);
CREATE INDEX IF NOT EXISTS idx_premium_users_user_id ON premium_users(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_users_status ON premium_users(subscription_status);

-- User favorites indexes
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_carnival_id ON user_favorites(carnival_id);

-- Login attempts indexes
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

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

-- Login attempts policies (read-only for users, full access for service role)
CREATE POLICY "Service role can manage login attempts" ON login_attempts
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- FUNCTIONS AND TRIGGERS
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
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upgrade user to premium
CREATE OR REPLACE FUNCTION upgrade_to_premium(user_email TEXT, payment_data JSONB DEFAULT '{}')
RETURNS BOOLEAN AS $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get user ID from email
    SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User not found: %', user_email;
    END IF;
    
    -- Update user type to premium
    UPDATE user_profiles 
    SET user_type = 'premium', updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Create premium user record
    INSERT INTO premium_users (
        user_id, 
        email, 
        subscription_status,
        payment_provider_id,
        current_period_start,
        current_period_end
    ) VALUES (
        user_uuid,
        user_email,
        'active',
        payment_data->>'payment_provider_id',
        COALESCE((payment_data->>'current_period_start')::timestamp, NOW()),
        COALESCE((payment_data->>'current_period_end')::timestamp, NOW() + INTERVAL '1 month')
    )
    ON CONFLICT (email) DO UPDATE SET
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
    -- Get user ID from email
    SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user is premium
    SELECT user_type = 'premium' INTO is_premium 
    FROM user_profiles 
    WHERE id = user_uuid;
    
    RETURN COALESCE(is_premium, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
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

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT ON premium_users TO authenticated;
GRANT ALL ON user_favorites TO authenticated;

-- Grant permissions to service role
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON premium_users TO service_role;
GRANT ALL ON user_favorites TO service_role;
GRANT ALL ON login_attempts TO service_role;

-- =====================================================
-- SAMPLE DATA (Optional - remove in production)
-- =====================================================

-- Insert sample premium users for testing
-- INSERT INTO premium_users (user_id, email, subscription_status) 
-- VALUES 
--     ('00000000-0000-0000-0000-000000000001', 'test-premium@example.com', 'active')
-- ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- VIEWS FOR EASY QUERIES
-- =====================================================

-- View for active premium users
CREATE OR REPLACE VIEW active_premium_users AS
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
-- COMPLETION MESSAGE
-- =====================================================

-- This schema creates a clean authentication system where:
-- 1. All users start as 'basic' users
-- 2. Users can upgrade to 'premium' via the upgrade_to_premium() function
-- 3. Premium status is checked via is_user_premium() function
-- 4. All tables have proper RLS policies for security
-- 5. Automatic profile creation on signup
-- 6. Comprehensive audit trail with login attempts
