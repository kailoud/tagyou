-- Supabase Email Configuration Check
-- This script helps identify why confirmation emails are still being sent

-- =====================================================
-- STEP 1: CHECK AUTHENTICATION SETTINGS
-- =====================================================

-- Check current auth settings
SELECT '=== AUTHENTICATION SETTINGS ===' as section;

-- Note: These settings are typically in the Supabase dashboard
-- but we can check if there are any database-level overrides
SELECT 
    'Email confirmations might still be enabled in Dashboard' as note,
    'Go to: Authentication → Settings → Email Auth' as location,
    'Look for "Enable email confirmations"' as setting;

-- =====================================================
-- STEP 2: CHECK EMAIL TEMPLATES
-- =====================================================

-- Check if email templates exist and are configured
SELECT '=== EMAIL TEMPLATES ===' as section;

-- This would show email templates if they exist
-- (Note: This table might not be accessible in all Supabase instances)
SELECT 
    'Email templates might be configured' as note,
    'Go to: Authentication → Email Templates' as location,
    'Check if confirmation template is active' as action;

-- =====================================================
-- STEP 3: CHECK FOR CUSTOM EMAIL FUNCTIONS
-- =====================================================

-- Check if there are any custom functions that might send emails
SELECT '=== CUSTOM EMAIL FUNCTIONS ===' as section;

SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE prosrc ILIKE '%email%' 
   OR prosrc ILIKE '%mail%'
   OR prosrc ILIKE '%send%'
   OR prosrc ILIKE '%confirm%';

-- =====================================================
-- STEP 4: CHECK TRIGGERS THAT MIGHT SEND EMAILS
-- =====================================================

-- Check for triggers that might handle email sending
SELECT '=== EMAIL TRIGGERS ===' as section;

SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.action_statement
FROM information_schema.triggers t
WHERE t.action_statement ILIKE '%email%'
   OR t.action_statement ILIKE '%mail%'
   OR t.action_statement ILIKE '%send%';

-- =====================================================
-- STEP 5: CHECK AUTH USERS TABLE
-- =====================================================

-- Check recent user signups and their confirmation status
SELECT '=== RECENT USER SIGNUPS ===' as section;

SELECT 
    email,
    email_confirmed_at,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed'
        ELSE 'Not Confirmed'
    END as confirmation_status
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- =====================================================
-- STEP 6: CHECK FOR EDGE FUNCTIONS
-- =====================================================

-- Note: Edge functions are in the Supabase dashboard
SELECT '=== EDGE FUNCTIONS ===' as section;

SELECT 
    'Check for email-related edge functions' as note,
    'Go to: Edge Functions in Dashboard' as location,
    'Look for functions that handle auth or email' as action;

-- =====================================================
-- STEP 7: COMPREHENSIVE EMAIL DISABLE SCRIPT
-- =====================================================

SELECT '=== TO COMPLETELY DISABLE EMAILS ===' as section;

SELECT 
    '1. Go to Supabase Dashboard → Authentication → Settings' as step1,
    '2. Disable "Enable email confirmations"' as step2,
    '3. Disable "Enable email change confirmations"' as step3,
    '4. Go to Authentication → Email Templates' as step4,
    '5. Delete or disable all email templates' as step5,
    '6. Check Edge Functions for email logic' as step6;

-- =====================================================
-- STEP 8: TEST CURRENT CONFIGURATION
-- =====================================================

-- Test if we can see what triggers email sending
SELECT '=== EMAIL CONFIGURATION TEST ===' as section;

-- Check if there are any active email-related policies
SELECT 
    'Active email policies found:' as test_result,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE policyname ILIKE '%email%'
   OR policyname ILIKE '%mail%'
   OR policyname ILIKE '%confirm%';

-- =====================================================
-- COMPLETION
-- =====================================================

SELECT '✅ Email configuration check completed!' as status;
SELECT 'Check the results above to identify email sources.' as next_step;
