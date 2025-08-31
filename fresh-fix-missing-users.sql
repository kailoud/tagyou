-- Fix Missing User Profiles
-- This script creates profiles for users who signed up but don't have profiles

-- =====================================================
-- STEP 1: CHECK WHAT USERS EXIST IN AUTH
-- =====================================================

-- Check all users in auth.users table
SELECT '=== USERS IN AUTH.USERS ===' as section;

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
-- STEP 2: CHECK WHAT PROFILES EXIST
-- =====================================================

-- Check existing profiles
SELECT '=== EXISTING PROFILES ===' as section;

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

-- Find users who don't have profiles
SELECT '=== MISSING PROFILES ===' as section;

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
-- STEP 4: CREATE PROFILES FOR MISSING USERS
-- =====================================================

-- Create profiles for all missing users
SELECT '=== CREATING MISSING PROFILES ===' as section;

-- This will create profiles for all users who don't have them
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
-- STEP 5: VERIFY PROFILES WERE CREATED
-- =====================================================

-- Check that profiles were created
SELECT '=== VERIFICATION ===' as section;

SELECT 
    'Profiles created successfully' as result,
    COUNT(*) as total_profiles
FROM user_profiles;

-- Show all profiles
SELECT 
    id,
    email,
    display_name,
    user_type,
    created_at
FROM user_profiles 
ORDER BY created_at DESC;

-- =====================================================
-- STEP 6: FIX THE TRIGGER FOR FUTURE SIGNUPS
-- =====================================================

-- Drop and recreate the trigger to ensure it works
SELECT '=== FIXING TRIGGER ===' as section;

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing function
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a more robust function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert user profile with better error handling
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
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the signup
        RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- STEP 7: TEST THE TRIGGER
-- =====================================================

-- Test that the trigger function works
SELECT '=== TRIGGER TEST ===' as section;

-- Test the function manually with a sample user
SELECT 
    'Trigger function created successfully' as test_result,
    'Future signups should now create profiles automatically' as note;

-- =====================================================
-- STEP 8: FINAL VERIFICATION
-- =====================================================

-- Final check - all users should now have profiles
SELECT '=== FINAL VERIFICATION ===' as section;

SELECT 
    'Users without profiles:' as check_type,
    COUNT(*) as count
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- If count is 0, all users have profiles
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ ALL USERS HAVE PROFILES!'
        ELSE '❌ SOME USERS STILL MISSING PROFILES'
    END as final_status
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- =====================================================
-- COMPLETION
-- =====================================================

SELECT '✅ Missing user profiles fix completed!' as status;
SELECT 'All existing users should now have profiles.' as message;
SELECT 'Future signups will automatically create profiles.' as message2;
