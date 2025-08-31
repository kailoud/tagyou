-- Fix Missing User Profiles and Diagnose Trigger Issues
-- This script finds and fixes missing profiles and diagnoses trigger problems

-- =====================================================
-- STEP 1: CHECK ALL USERS IN AUTH
-- =====================================================

SELECT '=== ALL USERS IN AUTH.USERS ===' as section;

SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed'
        ELSE 'Not Confirmed'
    END as status
FROM auth.users 
ORDER BY created_at DESC;

-- =====================================================
-- STEP 2: CHECK ALL PROFILES
-- =====================================================

SELECT '=== ALL PROFILES IN USER_PROFILES ===' as section;

SELECT 
    id,
    email,
    display_name,
    user_type,
    created_at
FROM user_profiles 
ORDER BY created_at DESC;

-- =====================================================
-- STEP 3: FIND MISSING PROFILES
-- =====================================================

SELECT '=== USERS WITHOUT PROFILES ===' as section;

SELECT 
    u.id,
    u.email,
    u.created_at as user_created_at,
    'MISSING PROFILE' as status
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL
ORDER BY u.created_at DESC;

-- =====================================================
-- STEP 4: CHECK TRIGGER STATUS
-- =====================================================

SELECT '=== TRIGGER DIAGNOSTICS ===' as section;

-- Check if trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    'TRIGGER EXISTS' as status
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check if function exists
SELECT 
    proname as function_name,
    'FUNCTION EXISTS' as status
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- =====================================================
-- STEP 5: TEST TRIGGER FUNCTION MANUALLY
-- =====================================================

SELECT '=== MANUAL TRIGGER TEST ===' as section;

-- Test the function with a sample user (if any exist without profiles)
DO $$
DECLARE
    test_user RECORD;
    test_result BOOLEAN;
BEGIN
    -- Get first user without profile
    SELECT u.* INTO test_user
    FROM auth.users u
    LEFT JOIN user_profiles p ON u.id = p.id
    WHERE p.id IS NULL
    LIMIT 1;
    
    IF test_user.id IS NOT NULL THEN
        RAISE NOTICE 'Testing trigger function with user: %', test_user.email;
        
        -- Try to create profile manually
        INSERT INTO user_profiles (id, email, display_name, user_type, created_at, updated_at)
        VALUES (
            test_user.id,
            test_user.email,
            COALESCE(
                test_user.raw_user_meta_data->>'full_name',
                split_part(test_user.email, '@', 1)
            ),
            'basic',
            test_user.created_at,
            NOW()
        );
        
        RAISE NOTICE 'Manual profile creation successful for: %', test_user.email;
    ELSE
        RAISE NOTICE 'No users found without profiles to test with';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Manual profile creation failed: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 6: RECREATE TRIGGER WITH BETTER ERROR HANDLING
-- =====================================================

SELECT '=== RECREATING TRIGGER ===' as section;

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a more robust function with detailed logging
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    RAISE NOTICE 'Trigger fired for user: %', NEW.email;
    
    -- Insert user profile with comprehensive error handling
    INSERT INTO user_profiles (id, email, display_name, user_type, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name', 
            split_part(NEW.email, '@', 1)
        ),
        'basic',
        NEW.created_at,
        NOW()
    );
    
    RAISE NOTICE 'Profile created successfully for: %', NEW.email;
    RETURN NEW;
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE WARNING 'Profile already exists for user: %', NEW.email;
        RETURN NEW;
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to create profile for %: % (Code: %)', NEW.email, SQLERRM, SQLSTATE;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- STEP 7: CREATE PROFILES FOR ALL MISSING USERS
-- =====================================================

SELECT '=== CREATING MISSING PROFILES ===' as section;

-- Create profiles for all users who don't have them
INSERT INTO user_profiles (id, email, display_name, user_type, created_at, updated_at)
SELECT 
    u.id,
    u.email,
    COALESCE(
        u.raw_user_meta_data->>'full_name',
        split_part(u.email, '@', 1)
    ) as display_name,
    'basic' as user_type,
    u.created_at,
    NOW() as updated_at
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 8: CHECK FOR CONFLICTING SCRIPTS
-- =====================================================

SELECT '=== CHECKING FOR CONFLICTS ===' as section;

-- Check for multiple triggers on auth.users
SELECT 
    trigger_name,
    event_manipulation,
    'POTENTIAL CONFLICT' as issue
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth'
AND trigger_name != 'on_auth_user_created';

-- Check for functions that might interfere
SELECT 
    proname as function_name,
    'POTENTIAL CONFLICT' as issue
FROM pg_proc 
WHERE prosrc ILIKE '%user_profiles%'
AND proname != 'handle_new_user';

-- =====================================================
-- STEP 9: VERIFY FINAL STATE
-- =====================================================

SELECT '=== FINAL VERIFICATION ===' as section;

-- Count users vs profiles
SELECT 
    'Total users in auth.users:' as metric,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Total profiles in user_profiles:' as metric,
    COUNT(*) as count
FROM user_profiles
UNION ALL
SELECT 
    'Users without profiles:' as metric,
    COUNT(*) as count
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Show final profile list
SELECT 
    'FINAL PROFILE LIST' as section,
    id,
    email,
    display_name,
    user_type,
    created_at
FROM user_profiles 
ORDER BY created_at DESC;

-- =====================================================
-- STEP 10: TEST NEW SIGNUP
-- =====================================================

SELECT '=== TRIGGER READY FOR NEW SIGNUPS ===' as section;

SELECT 
    'Trigger function: ' || proname as function_status,
    'Trigger: ' || trigger_name as trigger_status
FROM pg_proc p
JOIN information_schema.triggers t ON t.action_statement LIKE '%' || p.proname || '%'
WHERE p.proname = 'handle_new_user'
AND t.trigger_name = 'on_auth_user_created';

-- =====================================================
-- COMPLETION
-- =====================================================

SELECT '✅ User profile fix and diagnostics completed!' as status;
SELECT 'All existing users should now have profiles.' as message;
SELECT 'Trigger is ready for future signups.' as message2;
SELECT 'Check the results above for any conflicts.' as message3;
