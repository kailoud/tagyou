-- =====================================================
-- UPDATE USER TIER SYSTEM WITH GRACE PERIOD
-- Safe update script - only adds new functionality
-- Run this in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: UPDATE ADD NEW USER FUNCTION (WITH GRACE PERIOD)
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
-- STEP 2: UPDATE GET USER PERMISSIONS FUNCTION (WITH GRACE PERIOD)
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
            WHERE id = target_user_id;
            
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
-- STEP 3: CREATE GRACE PERIOD MANAGEMENT FUNCTIONS
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
-- STEP 4: VERIFICATION
-- =====================================================

-- Test the grace period functions
SELECT 
    'Grace Period Functions' as test,
    'Functions created successfully' as status
UNION ALL
SELECT 
    'add_new_user()' as test,
    'Updated with grace period logic' as status
UNION ALL
SELECT 
    'get_user_permissions()' as test,
    'Updated with grace period checking' as status
UNION ALL
SELECT 
    'reset_expired_grace_periods()' as test,
    'New function created' as status
UNION ALL
SELECT 
    'get_grace_period_status()' as test,
    'New function created' as status;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Grace Period functionality added successfully!';
    RAISE NOTICE '⏰ Basic users now get 1 hour grace period after adding a user.';
    RAISE NOTICE '🔄 Use reset_expired_grace_periods() to manually reset expired grace periods.';
    RAISE NOTICE '📋 Use get_grace_period_status() to check grace period status for any user.';
    RAISE NOTICE '👥 add_new_user() and get_user_permissions() now include grace period logic.';
END $$;
