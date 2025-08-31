-- Simple Premium User Fix
-- This script fixes premium user inconsistencies without complex functions

-- =====================================================
-- STEP 1: CHECK CURRENT STATE
-- =====================================================

SELECT '=== CURRENT PREMIUM USERS ===' as section;

-- Show all users marked as premium in profiles
SELECT 
    up.id,
    up.email,
    up.user_type,
    up.created_at,
    CASE 
        WHEN pu.user_id IS NOT NULL THEN '✅ HAS PREMIUM RECORD'
        ELSE '❌ MISSING PREMIUM RECORD'
    END as status
FROM user_profiles up
LEFT JOIN premium_users pu ON up.id = pu.user_id
WHERE up.user_type = 'premium'
ORDER BY up.created_at DESC;

-- =====================================================
-- STEP 2: FIND INCONSISTENT USERS
-- =====================================================

SELECT '=== INCONSISTENT USERS ===' as section;

-- Find users who are premium but missing from premium_users
SELECT 
    up.id,
    up.email,
    'MISSING PREMIUM RECORD' as issue
FROM user_profiles up
LEFT JOIN premium_users pu ON up.id = pu.user_id
WHERE up.user_type = 'premium' 
AND pu.user_id IS NULL;

-- =====================================================
-- STEP 3: FIX THE ISSUE
-- =====================================================

SELECT '=== FIXING INCONSISTENCY ===' as section;

-- Create premium records for users who are marked as premium but don't have them
INSERT INTO premium_users (user_id, email, subscription_status, payment_provider, current_period_start, current_period_end, created_at, updated_at)
SELECT 
    up.id,
    up.email,
    'active',
    'manual_fix',
    NOW(),
    NOW() + INTERVAL '1 month',
    NOW(),
    NOW()
FROM user_profiles up
LEFT JOIN premium_users pu ON up.id = pu.user_id
WHERE up.user_type = 'premium' 
AND pu.user_id IS NULL;

-- =====================================================
-- STEP 4: VERIFY THE FIX
-- =====================================================

SELECT '=== VERIFICATION ===' as section;

-- Check if the fix worked
SELECT 
    up.id,
    up.email,
    up.user_type,
    pu.subscription_status,
    CASE 
        WHEN pu.user_id IS NOT NULL THEN '✅ FIXED'
        ELSE '❌ STILL BROKEN'
    END as fix_status
FROM user_profiles up
LEFT JOIN premium_users pu ON up.id = pu.user_id
WHERE up.user_type = 'premium'
ORDER BY up.created_at DESC;

-- =====================================================
-- STEP 5: SUMMARY
-- =====================================================

SELECT '=== SUMMARY ===' as section;

-- Count total premium users
SELECT 
    'Total premium profiles:' as metric,
    COUNT(*) as count
FROM user_profiles 
WHERE user_type = 'premium'

UNION ALL

SELECT 
    'Total premium records:' as metric,
    COUNT(*) as count
FROM premium_users

UNION ALL

SELECT 
    'Consistent premium users:' as metric,
    COUNT(*) as count
FROM user_profiles up
JOIN premium_users pu ON up.id = pu.user_id
WHERE up.user_type = 'premium';

-- =====================================================
-- COMPLETION
-- =====================================================

SELECT '✅ Premium user fix completed!' as status;
SELECT 'Check the results above to verify the fix worked.' as next_step;
