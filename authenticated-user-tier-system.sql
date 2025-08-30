-- =====================================================
-- AUTHENTICATED USER TIER SYSTEM SETUP
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: CREATE USER TIERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_tiers (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    tier_type VARCHAR(50) NOT NULL DEFAULT 'basic' CHECK (tier_type IN ('basic', 'premium')),
    tier_status VARCHAR(50) NOT NULL DEFAULT 'permanent' CHECK (tier_status IN ('temporary', 'permanent')),
    users_added_count INTEGER DEFAULT 0,
    max_users_can_add INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    upgraded_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NULL, -- NULL = permanent, timestamp = temporary
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_tiers_email ON user_tiers(email);
CREATE INDEX IF NOT EXISTS idx_user_tiers_tier_type ON user_tiers(tier_type);
CREATE INDEX IF NOT EXISTS idx_user_tiers_tier_status ON user_tiers(tier_status);
CREATE INDEX IF NOT EXISTS idx_user_tiers_active ON user_tiers(is_active);
CREATE INDEX IF NOT EXISTS idx_user_tiers_expires_at ON user_tiers(expires_at);

-- =====================================================
-- STEP 3: ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE user_tiers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: CREATE RLS POLICIES FOR USER_TIERS
-- =====================================================
-- Users can view their own tier record
CREATE POLICY "Users can view their own tier record" ON user_tiers
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own tier record
CREATE POLICY "Users can update their own tier record" ON user_tiers
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own tier record
CREATE POLICY "Users can insert their own tier record" ON user_tiers
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- STEP 5: CREATE USER RELATIONSHIPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    added_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    added_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    relationship_type VARCHAR(50) NOT NULL DEFAULT 'permanent' CHECK (relationship_type IN ('temporary', 'permanent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NULL,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(added_by_user_id, added_user_id)
);

-- =====================================================
-- STEP 6: CREATE INDEXES FOR USER_RELATIONSHIPS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_relationships_added_by ON user_relationships(added_by_user_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_added_user ON user_relationships(added_user_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_active ON user_relationships(is_active);

-- =====================================================
-- STEP 7: ENABLE RLS FOR USER_RELATIONSHIPS
-- =====================================================
ALTER TABLE user_relationships ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 8: CREATE RLS POLICIES FOR USER_RELATIONSHIPS
-- =====================================================
-- Users can view relationships they're involved in
CREATE POLICY "Users can view relationships they're involved in" ON user_relationships
    FOR SELECT USING (auth.uid() = added_by_user_id OR auth.uid() = added_user_id);

-- Users can insert relationships they create
CREATE POLICY "Users can insert relationships they create" ON user_relationships
    FOR INSERT WITH CHECK (auth.uid() = added_by_user_id);

-- Users can update relationships they created
CREATE POLICY "Users can update relationships they created" ON user_relationships
    FOR UPDATE USING (auth.uid() = added_by_user_id);

-- =====================================================
-- STEP 9: UPDATE HANDLE_NEW_USER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile record
    INSERT INTO profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    
    -- Create basic user record (permanent basic user)
    INSERT INTO basic_users (id, email, created_at, expires_at, last_activity, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        NOW(),
        NULL, -- NULL = permanent basic user
        NOW(),
        true
    );
    
    -- Create user tier record (permanent basic user by default)
    INSERT INTO user_tiers (id, email, tier_type, tier_status, users_added_count, max_users_can_add, created_at, expires_at, last_activity, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        'basic', -- Default tier type
        'permanent', -- Default tier status
        0, -- No users added yet
        1, -- Can add 1 Permanent Basic User (basic user limit)
        NOW(),
        NULL, -- NULL = permanent
        NOW(),
        true
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 10: CREATE UPGRADE TO PREMIUM FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION upgrade_user_to_premium(user_email VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Get user ID
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User not found: %', user_email;
    END IF;
    
    -- Update user tier to premium
    UPDATE user_tiers 
    SET 
        tier_type = 'premium',
        tier_status = 'permanent',
        max_users_can_add = 999999, -- Unlimited (practical limit)
        upgraded_at = NOW(),
        last_activity = NOW()
    WHERE id = user_id;
    
    IF FOUND THEN
        RAISE NOTICE 'User % upgraded to premium successfully', user_email;
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'User tier record not found for: %', user_email;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 11: CREATE ADD NEW USER FUNCTION (WITH GRACE PERIOD)
-- =====================================================
CREATE OR REPLACE FUNCTION add_new_user(
    new_user_email VARCHAR,
    new_user_name VARCHAR DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    current_user_id UUID;
    current_user_tier user_tiers%ROWTYPE;
    new_user_id UUID;
    result JSON;
    grace_period_expiry TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not authenticated');
    END IF;
    
    -- Get current user's tier information
    SELECT * INTO current_user_tier FROM user_tiers WHERE id = current_user_id;
    
    IF current_user_tier IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User tier not found');
    END IF;
    
    -- Check grace period for basic users (1 hour grace period)
    IF current_user_tier.tier_type = 'basic' AND current_user_tier.users_added_count >= 1 THEN
        -- Get the most recent user added by this user
        SELECT created_at + INTERVAL '1 hour' INTO grace_period_expiry
        FROM user_relationships 
        WHERE added_by_user_id = current_user_id 
        ORDER BY created_at DESC 
        LIMIT 1;
        
        -- If grace period has expired, reset the count
        IF grace_period_expiry < NOW() THEN
            UPDATE user_tiers 
            SET users_added_count = 0,
                last_activity = NOW()
            WHERE id = current_user_id;
            
            -- Update the tier record
            SELECT * INTO current_user_tier FROM user_tiers WHERE id = current_user_id;
        END IF;
    END IF;
    
    -- Check if user can add more users
    IF current_user_tier.users_added_count >= current_user_tier.max_users_can_add THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'User limit reached', 
            'current_count', current_user_tier.users_added_count,
            'max_allowed', current_user_tier.max_users_can_add,
            'grace_period_expiry', grace_period_expiry
        );
    END IF;
    
    -- Check if new user email already exists
    IF EXISTS(SELECT 1 FROM auth.users WHERE email = new_user_email) THEN
        RETURN json_build_object('success', false, 'error', 'User with this email already exists');
    END IF;
    
    -- Generate a new user ID
    new_user_id := gen_random_uuid();
    
    -- Create user tier record for the new user (always creates a Permanent Basic User)
    INSERT INTO user_tiers (id, email, tier_type, tier_status, users_added_count, max_users_can_add, created_at, expires_at, last_activity, is_active)
    VALUES (
        new_user_id,
        new_user_email,
        'basic', -- Always creates a basic user
        'permanent', -- Always creates a permanent user
        0,
        1, -- Can add 1 Permanent Basic User
        NOW(),
        NULL,
        NOW(),
        true
    );
    
    -- Create relationship record
    INSERT INTO user_relationships (added_by_user_id, added_user_id, relationship_type, created_at, expires_at, is_active)
    VALUES (
        current_user_id,
        new_user_id,
        'permanent',
        NOW(),
        NULL,
        true
    );
    
    -- Update the adding user's count
    UPDATE user_tiers 
    SET users_added_count = users_added_count + 1,
        last_activity = NOW()
    WHERE id = current_user_id;
    
    RETURN json_build_object(
        'success', true,
        'new_user_id', new_user_id,
        'new_user_email', new_user_email,
        'added_by', current_user_id,
        'relationship_type', 'permanent',
        'grace_period_expiry', NOW() + INTERVAL '1 hour'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 12: CREATE GET USER PERMISSIONS FUNCTION (WITH GRACE PERIOD)
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_permissions(user_email VARCHAR DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    target_user_id UUID;
    user_tier_info user_tiers%ROWTYPE;
    added_users_count INTEGER;
    can_add_users BOOLEAN;
    grace_period_expiry TIMESTAMP WITH TIME ZONE;
    grace_period_active BOOLEAN;
BEGIN
    -- If no email provided, use current user
    IF user_email IS NULL THEN
        target_user_id := auth.uid();
    ELSE
        SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
    END IF;
    
    IF target_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not found');
    END IF;
    
    -- Get user tier information
    SELECT * INTO user_tier_info FROM user_tiers WHERE id = target_user_id;
    
    IF user_tier_info IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User tier not found');
    END IF;
    
    -- Count users added by this user
    SELECT COUNT(*) INTO added_users_count 
    FROM user_relationships 
    WHERE added_by_user_id = target_user_id AND is_active = true;
    
    -- Check grace period for basic users
    grace_period_expiry := NULL;
    grace_period_active := FALSE;
    
    IF user_tier_info.tier_type = 'basic' AND added_users_count >= 1 THEN
        -- Get the most recent user added by this user
        SELECT created_at + INTERVAL '1 hour' INTO grace_period_expiry
        FROM user_relationships 
        WHERE added_by_user_id = target_user_id 
        ORDER BY created_at DESC 
        LIMIT 1;
        
        -- Check if grace period is still active
        grace_period_active := (grace_period_expiry > NOW());
        
        -- If grace period has expired, reset the count
        IF NOT grace_period_active THEN
            UPDATE user_tiers 
            SET users_added_count = 0,
                last_activity = NOW()
            WHERE id = current_user_id;
            
            -- Update counts
            added_users_count := 0;
            SELECT * INTO user_tier_info FROM user_tiers WHERE id = target_user_id;
        END IF;
    END IF;
    
    -- Check if user can add more users
    can_add_users := (added_users_count < user_tier_info.max_users_can_add);
    
    RETURN json_build_object(
        'success', true,
        'user_id', target_user_id,
        'email', user_tier_info.email,
        'tier_type', user_tier_info.tier_type,
        'tier_status', user_tier_info.tier_status,
        'users_added_count', added_users_count,
        'max_users_can_add', user_tier_info.max_users_can_add,
        'can_add_users', can_add_users,
        'is_premium', user_tier_info.tier_type = 'premium',
        'is_permanent', user_tier_info.tier_status = 'permanent',
        'grace_period_expiry', grace_period_expiry,
        'grace_period_active', grace_period_active
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 13: CREATE GRACE PERIOD MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to reset expired grace periods
CREATE OR REPLACE FUNCTION reset_expired_grace_periods()
RETURNS INTEGER AS $$
DECLARE
    reset_count INTEGER := 0;
    user_record RECORD;
BEGIN
    -- Find all basic users with expired grace periods
    FOR user_record IN 
        SELECT DISTINCT ut.id, ut.users_added_count
        FROM user_tiers ut
        JOIN user_relationships ur ON ut.id = ur.added_by_user_id
        WHERE ut.tier_type = 'basic' 
        AND ut.users_added_count >= 1
        AND ur.created_at + INTERVAL '1 hour' < NOW()
    LOOP
        -- Reset the user's count
        UPDATE user_tiers 
        SET users_added_count = 0,
            last_activity = NOW()
        WHERE id = user_record.id;
        
        reset_count := reset_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Reset grace periods for % basic users', reset_count;
    RETURN reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get grace period status for a user
CREATE OR REPLACE FUNCTION get_grace_period_status(user_email VARCHAR DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    target_user_id UUID;
    grace_period_expiry TIMESTAMP WITH TIME ZONE;
    grace_period_active BOOLEAN;
    time_remaining INTERVAL;
BEGIN
    -- If no email provided, use current user
    IF user_email IS NULL THEN
        target_user_id := auth.uid();
    ELSE
        SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
    END IF;
    
    IF target_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not found');
    END IF;
    
    -- Get grace period information
    SELECT created_at + INTERVAL '1 hour' INTO grace_period_expiry
    FROM user_relationships 
    WHERE added_by_user_id = target_user_id 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF grace_period_expiry IS NULL THEN
        RETURN json_build_object(
            'success', true,
            'grace_period_active', false,
            'message', 'No grace period active'
        );
    END IF;
    
    grace_period_active := (grace_period_expiry > NOW());
    time_remaining := grace_period_expiry - NOW();
    
    RETURN json_build_object(
        'success', true,
        'grace_period_expiry', grace_period_expiry,
        'grace_period_active', grace_period_active,
        'time_remaining', time_remaining,
        'time_remaining_seconds', EXTRACT(EPOCH FROM time_remaining)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 14: CREATE TIER RECORDS FOR EXISTING USERS
-- =====================================================
INSERT INTO user_tiers (id, email, tier_type, tier_status, users_added_count, max_users_can_add, created_at, expires_at, last_activity, is_active)
SELECT 
    au.id,
    au.email,
    'basic' as tier_type,
    'permanent' as tier_status,
    0 as users_added_count,
    1 as max_users_can_add, -- Can add 1 Permanent Basic User
    au.created_at,
    NULL as expires_at,
    au.created_at as last_activity,
    true as is_active
FROM auth.users au
LEFT JOIN user_tiers ut ON au.id = ut.id
WHERE ut.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 15: VERIFICATION QUERIES
-- =====================================================

-- Show total counts
SELECT 
    'Total auth users' as metric,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Total user tiers' as metric,
    COUNT(*) as count
FROM user_tiers
UNION ALL
SELECT 
    'Basic users' as metric,
    COUNT(*) as count
FROM user_tiers WHERE tier_type = 'basic'
UNION ALL
SELECT 
    'Premium users' as metric,
    COUNT(*) as count
FROM user_tiers WHERE tier_type = 'premium';

-- Show recent user tiers
SELECT 
    id,
    email,
    tier_type,
    tier_status,
    users_added_count,
    max_users_can_add,
    created_at,
    upgraded_at,
    CASE 
        WHEN tier_type = 'premium' THEN 'Premium User (Unlimited)'
        WHEN tier_type = 'basic' AND tier_status = 'permanent' THEN 'Permanent Basic User (Can add 1 Permanent Basic User)'
        ELSE 'Temporary User'
    END as user_description
FROM user_tiers 
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- STEP 16: GRANT PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- STEP 17: OPTIONAL CRON JOB FOR GRACE PERIOD CLEANUP
-- =====================================================
-- Uncomment the line below to automatically reset expired grace periods every 5 minutes
-- SELECT cron.schedule('reset-grace-periods', '*/5 * * * *', 'SELECT reset_expired_grace_periods();');

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ User Tier System with Grace Period setup completed successfully!';
    RAISE NOTICE '📊 Check the verification queries above for system status.';
    RAISE NOTICE '🔐 All users are now tracked with proper tier permissions.';
    RAISE NOTICE '⭐ Use upgrade_user_to_premium() to upgrade users to premium.';
    RAISE NOTICE '👥 Use add_new_user() to add new users with permission checking.';
    RAISE NOTICE '⏰ Grace Period: Basic users get 1 hour after adding a user before count resets to 0/1.';
    RAISE NOTICE '🔄 Use reset_expired_grace_periods() to manually reset expired grace periods.';
    RAISE NOTICE '📋 Use get_grace_period_status() to check grace period status for any user.';
END $$;
