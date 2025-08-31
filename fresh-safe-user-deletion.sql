-- Safe User Deletion Script
-- This script safely removes users without breaking the auth system

-- =====================================================
-- STEP 1: CHECK USER BEFORE DELETION
-- =====================================================

-- Function to safely check user existence
CREATE OR REPLACE FUNCTION check_user_exists(user_email TEXT)
RETURNS TABLE(
    auth_exists BOOLEAN,
    profile_exists BOOLEAN,
    premium_exists BOOLEAN,
    favorites_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXISTS(SELECT 1 FROM auth.users WHERE email = user_email) as auth_exists,
        EXISTS(SELECT 1 FROM user_profiles WHERE email = user_email) as profile_exists,
        EXISTS(SELECT 1 FROM premium_users WHERE email = user_email) as premium_exists,
        COALESCE((
            SELECT COUNT(*) 
            FROM user_favorites uf 
            JOIN auth.users u ON uf.user_id = u.id 
            WHERE u.email = user_email
        ), 0) as favorites_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 2: SAFE USER DEACTIVATION
-- =====================================================

-- Function to safely deactivate a user
CREATE OR REPLACE FUNCTION deactivate_user(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    user_uuid UUID;
    result_message TEXT;
BEGIN
    -- Get user ID
    SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RETURN 'User not found in auth.users';
    END IF;
    
    -- Deactivate user profile
    UPDATE user_profiles 
    SET status = 'suspended', updated_at = NOW()
    WHERE email = user_email;
    
    -- Cancel premium subscription
    UPDATE premium_users 
    SET subscription_status = 'canceled', updated_at = NOW()
    WHERE email = user_email;
    
    result_message := 'User deactivated successfully. User can still sign in but is suspended.';
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 3: SAFE PROFILE DELETION
-- =====================================================

-- Function to safely delete user profile only
CREATE OR REPLACE FUNCTION delete_user_profile_only(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    user_uuid UUID;
    result_message TEXT;
BEGIN
    -- Get user ID
    SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RETURN 'User not found in auth.users';
    END IF;
    
    -- Delete from user_profiles only
    DELETE FROM user_profiles WHERE email = user_email;
    
    -- Delete from premium_users
    DELETE FROM premium_users WHERE email = user_email;
    
    -- Delete user favorites
    DELETE FROM user_favorites WHERE user_id = user_uuid;
    
    result_message := 'User profile deleted. User can still sign in but will need to recreate profile.';
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 4: COMPLETE USER REMOVAL (USE WITH CAUTION)
-- =====================================================

-- Function to completely remove user (RISKY - use carefully)
CREATE OR REPLACE FUNCTION remove_user_completely(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    user_uuid UUID;
    result_message TEXT;
BEGIN
    -- Get user ID
    SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RETURN 'User not found in auth.users';
    END IF;
    
    -- Delete from all tables
    DELETE FROM user_favorites WHERE user_id = user_uuid;
    DELETE FROM premium_users WHERE email = user_email;
    DELETE FROM user_profiles WHERE email = user_email;
    DELETE FROM login_attempts WHERE email = user_email;
    
    -- Note: auth.users deletion requires special permissions
    -- and should be done through Supabase dashboard or admin functions
    
    result_message := 'User data removed from all tables. Auth account may still exist.';
    
    RETURN result_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 5: GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to service role only (for security)
GRANT EXECUTE ON FUNCTION check_user_exists(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION deactivate_user(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION delete_user_profile_only(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION remove_user_completely(TEXT) TO service_role;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Example 1: Check a user before deletion
-- SELECT * FROM check_user_exists('user@example.com');

-- Example 2: Deactivate a user (safest)
-- SELECT deactivate_user('user@example.com');

-- Example 3: Delete profile only
-- SELECT delete_user_profile_only('user@example.com');

-- Example 4: Complete removal (use with caution)
-- SELECT remove_user_completely('user@example.com');

-- =====================================================
-- COMPLETION
-- =====================================================

SELECT '✅ Safe user deletion functions created!' as status;
SELECT 'Use deactivate_user() for safest option.' as recommendation;
SELECT 'Use delete_user_profile_only() to remove profile data.' as option2;
SELECT 'Use remove_user_completely() only when absolutely necessary.' as warning;
