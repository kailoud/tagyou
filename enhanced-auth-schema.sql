-- Enhanced Authentication Schema for TagYou
-- Implements comprehensive security and best practices
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE AUTHENTICATION TABLES
-- =====================================================

-- Enhanced profiles table with security features
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
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret TEXT,
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending')),
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

-- Role-based access control
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role_name TEXT NOT NULL CHECK (role_name IN ('user', 'premium', 'moderator', 'admin', 'super_admin')),
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, role_name)
);

-- Granular permissions system
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    permission_name TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- SECURITY & MONITORING TABLES
-- =====================================================

-- Login attempt tracking for security monitoring
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location_data JSONB
);

-- Device management for security
CREATE TABLE IF NOT EXISTS user_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    device_id TEXT UNIQUE NOT NULL,
    device_name TEXT,
    device_type TEXT,
    browser_info JSONB,
    os_info JSONB,
    ip_address INET,
    is_trusted BOOLEAN DEFAULT FALSE,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comprehensive audit logging
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PREMIUM & SUBSCRIPTION TABLES
-- =====================================================

-- Enhanced premium users table
CREATE TABLE IF NOT EXISTS premium_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'unpaid')),
    subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'premium', 'enterprise')),
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

-- =====================================================
-- EXISTING TABLES (KEPT FOR COMPATIBILITY)
-- =====================================================

-- Favorites table (existing)
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

-- User sessions table (existing)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    device_info JSONB,
    location_info JSONB
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Core authentication indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);

-- Security monitoring indexes
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time ON login_attempts(email, attempted_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON login_attempts(ip_address, attempted_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_success ON login_attempts(success, attempted_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id ON login_attempts(user_id, attempted_at);

-- User roles and permissions
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_active ON user_permissions(is_active);

-- Premium users
CREATE INDEX IF NOT EXISTS idx_premium_users_user_id ON premium_users(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_users_status ON premium_users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_premium_users_period_end ON premium_users(current_period_end);

-- Audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Device management
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_device_id ON user_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_last_used ON user_devices(last_used_at);

-- Existing indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item_type ON favorites(item_type);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;
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

-- User Roles RLS Policies
CREATE POLICY "Users can view their own roles" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role_name IN ('admin', 'super_admin') 
            AND ur.is_active = true
        )
    );

-- User Permissions RLS Policies
CREATE POLICY "Users can view their own permissions" ON user_permissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all permissions" ON user_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role_name IN ('admin', 'super_admin') 
            AND ur.is_active = true
        )
    );

-- Login Attempts RLS Policies
CREATE POLICY "Users can view their own login attempts" ON login_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all login attempts" ON login_attempts
    FOR ALL USING (auth.role() = 'service_role');

-- User Devices RLS Policies
CREATE POLICY "Users can view their own devices" ON user_devices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own devices" ON user_devices
    FOR ALL USING (auth.uid() = user_id);

-- Audit Logs RLS Policies
CREATE POLICY "Users can view their own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role_name IN ('admin', 'super_admin') 
            AND ur.is_active = true
        )
    );

CREATE POLICY "Service role can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Premium Users RLS Policies
CREATE POLICY "Users can view their own premium status" ON premium_users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage premium users" ON premium_users
    FOR ALL USING (auth.role() = 'service_role');

-- Favorites RLS Policies (existing)
CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites" ON favorites
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- User Sessions RLS Policies (existing)
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- DATABASE FUNCTIONS
-- =====================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    
    -- Assign default user role
    INSERT INTO user_roles (user_id, role_name)
    VALUES (NEW.id, 'user');
    
    -- Log the user creation
    INSERT INTO audit_logs (user_id, action, resource_type, new_values)
    VALUES (NEW.id, 'user_created', 'user', to_jsonb(NEW.*));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate password strength
CREATE OR REPLACE FUNCTION validate_password_strength(password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN 
        length(password) >= 8 AND
        password ~ '[A-Z]' AND
        password ~ '[a-z]' AND
        password ~ '[0-9]' AND
        password ~ '[^A-Za-z0-9]';
END;
$$ LANGUAGE plpgsql;

-- Function to check login rate limit
CREATE OR REPLACE FUNCTION check_login_rate_limit(email TEXT, ip_address INET)
RETURNS BOOLEAN AS $$
DECLARE
    attempt_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO attempt_count
    FROM login_attempts
    WHERE (login_attempts.email = check_login_rate_limit.email OR login_attempts.ip_address = check_login_rate_limit.ip_address)
    AND attempted_at > NOW() - INTERVAL '15 minutes'
    AND success = FALSE;
    
    RETURN attempt_count < 5;
END;
$$ LANGUAGE plpgsql;

-- Function to get user complete profile
CREATE OR REPLACE FUNCTION get_user_complete_profile(user_uuid UUID)
RETURNS TABLE (
    profile_data JSONB,
    roles TEXT[],
    permissions JSONB,
    premium_status JSONB,
    device_count INTEGER,
    last_login TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        to_jsonb(p.*) as profile_data,
        array_agg(ur.role_name) FILTER (WHERE ur.is_active = true) as roles,
        jsonb_agg(up.*) FILTER (WHERE up.is_active = true) as permissions,
        to_jsonb(pu.*) as premium_status,
        COUNT(ud.id)::INTEGER as device_count,
        p.last_login_at as last_login
    FROM profiles p
    LEFT JOIN user_roles ur ON p.id = ur.user_id
    LEFT JOIN user_permissions up ON p.id = up.user_id
    LEFT JOIN premium_users pu ON p.id = pu.user_id
    LEFT JOIN user_devices ud ON p.id = ud.user_id
    WHERE p.id = user_uuid
    GROUP BY p.id, pu.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
    user_uuid UUID,
    permission_name TEXT,
    resource_type TEXT DEFAULT NULL,
    resource_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM user_permissions up
        WHERE up.user_id = user_has_permission.user_uuid
        AND up.permission_name = user_has_permission.permission_name
        AND (user_has_permission.resource_type IS NULL OR up.resource_type = user_has_permission.resource_type)
        AND (user_has_permission.resource_id IS NULL OR up.resource_id = user_has_permission.resource_id)
        AND up.is_active = true
        AND (up.expires_at IS NULL OR up.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track user activity
CREATE OR REPLACE FUNCTION track_user_activity(
    user_uuid UUID,
    activity_type TEXT,
    activity_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        resource_type,
        new_values
    ) VALUES (
        user_uuid,
        activity_type,
        'user_activity',
        activity_data
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect suspicious activity
CREATE OR REPLACE FUNCTION detect_suspicious_activity(user_uuid UUID)
RETURNS TABLE (
    risk_level TEXT,
    risk_factors JSONB,
    recommendations JSONB
) AS $$
DECLARE
    failed_attempts INTEGER;
    device_count INTEGER;
    recent_logins INTEGER;
BEGIN
    -- Count failed login attempts
    SELECT COUNT(*) INTO failed_attempts
    FROM login_attempts
    WHERE user_id = detect_suspicious_activity.user_uuid
    AND attempted_at > NOW() - INTERVAL '1 hour'
    AND success = FALSE;
    
    -- Count devices
    SELECT COUNT(*) INTO device_count
    FROM user_devices
    WHERE user_id = detect_suspicious_activity.user_uuid;
    
    -- Count recent logins
    SELECT COUNT(*) INTO recent_logins
    FROM login_attempts
    WHERE user_id = detect_suspicious_activity.user_uuid
    AND attempted_at > NOW() - INTERVAL '24 hours'
    AND success = TRUE;
    
    RETURN QUERY
    SELECT 
        CASE 
            WHEN failed_attempts > 5 THEN 'high'
            WHEN failed_attempts > 3 THEN 'medium'
            ELSE 'low'
        END as risk_level,
        jsonb_build_object(
            'failed_attempts', failed_attempts,
            'device_count', device_count,
            'recent_logins', recent_logins
        ) as risk_factors,
        jsonb_build_object(
            'enable_2fa', failed_attempts > 3,
            'review_devices', device_count > 5,
            'contact_support', failed_attempts > 10
        ) as recommendations;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions
    WHERE session_end < NOW() - INTERVAL '30 days'
    OR (session_end IS NULL AND session_start < NOW() - INTERVAL '24 hours');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger for updating updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_premium_users_updated_at ON premium_users;
CREATE TRIGGER update_premium_users_updated_at
    BEFORE UPDATE ON premium_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STORAGE SETUP
-- =====================================================

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

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert default admin user (optional - replace with your email)
-- INSERT INTO profiles (id, email, display_name, status) VALUES 
--     ('00000000-0000-0000-0000-000000000001', 'admin@tagyou.com', 'Admin User', 'active');

-- INSERT INTO user_roles (user_id, role_name) VALUES 
--     ('00000000-0000-0000-0000-000000000001', 'super_admin');

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE profiles IS 'Enhanced user profiles with security features and preferences';
COMMENT ON TABLE user_roles IS 'Role-based access control for users';
COMMENT ON TABLE user_permissions IS 'Granular permissions system';
COMMENT ON TABLE login_attempts IS 'Security monitoring for login attempts';
COMMENT ON TABLE user_devices IS 'Device management for security';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for security';
COMMENT ON TABLE premium_users IS 'Enhanced premium subscription management';
COMMENT ON TABLE favorites IS 'User favorite items (food stalls, artists, etc.)';
COMMENT ON TABLE user_sessions IS 'User session tracking for analytics';

COMMENT ON FUNCTION get_user_complete_profile IS 'Get complete user profile with all related data';
COMMENT ON FUNCTION user_has_permission IS 'Check if user has specific permission';
COMMENT ON FUNCTION track_user_activity IS 'Track user activity for analytics';
COMMENT ON FUNCTION detect_suspicious_activity IS 'Detect suspicious user activity';
COMMENT ON FUNCTION validate_password_strength IS 'Validate password meets security requirements';
COMMENT ON FUNCTION check_login_rate_limit IS 'Check if login attempts exceed rate limit';
COMMENT ON FUNCTION cleanup_expired_sessions IS 'Clean up expired user sessions';

-- =====================================================
-- SCHEDULED TASKS (SET UP IN SUPABASE DASHBOARD)
-- =====================================================

-- Set up scheduled function calls in Supabase Dashboard:
-- 1. Go to Database > Functions
-- 2. Create a new function to call cleanup_expired_sessions()
-- 3. Set up a cron job to run daily: 0 2 * * * (2 AM daily)
