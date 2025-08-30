-- =====================================================
-- DEBUG TRIGGER ISSUE - "Database error saving new user"
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Check if trigger exists
SELECT 
    'Trigger Check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'on_auth_user_created'
        ) THEN 'Trigger exists'
        ELSE 'Trigger does not exist'
    END as status;

-- Step 2: Check if function exists
SELECT 
    'Function Check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'handle_new_user'
        ) THEN 'Function exists'
        ELSE 'Function does not exist'
    END as status;

-- Step 3: Check table structure
SELECT 
    'Table Structure Check' as check_type,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'basic_users', 'user_tiers')
ORDER BY table_name, ordinal_position;

-- Step 4: Check RLS policies
SELECT 
    'RLS Policy Check' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'basic_users', 'user_tiers', 'user_relationships')
ORDER BY tablename, policyname;

-- Step 5: Check if tables have RLS enabled
SELECT 
    'RLS Status Check' as check_type,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'basic_users', 'user_tiers', 'user_relationships')
ORDER BY tablename;

-- Step 6: Test manual insert to see if it works
-- This will help us see if the issue is with the trigger or the tables themselves
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'test-debug@example.com';
BEGIN
    RAISE NOTICE 'Testing manual insert with user_id: %', test_user_id;
    
    -- Try to insert into profiles
    BEGIN
        INSERT INTO profiles (id, email, display_name)
        VALUES (test_user_id, test_email, 'Test User');
        RAISE NOTICE '✅ Profiles insert successful';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Profiles insert failed: %', SQLERRM;
    END;
    
    -- Try to insert into basic_users
    BEGIN
        INSERT INTO basic_users (id, email, created_at, expires_at, last_activity, is_active)
        VALUES (test_user_id, test_email, NOW(), NULL, NOW(), true);
        RAISE NOTICE '✅ Basic users insert successful';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Basic users insert failed: %', SQLERRM;
    END;
    
    -- Try to insert into user_tiers
    BEGIN
        INSERT INTO user_tiers (id, email, tier_type, tier_status, users_added_count, max_users_can_add, created_at, expires_at, last_activity, is_active)
        VALUES (test_user_id, test_email, 'basic', 'permanent', 0, 1, NOW(), NULL, NOW(), true);
        RAISE NOTICE '✅ User tiers insert successful';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ User tiers insert failed: %', SQLERRM;
    END;
    
    -- Clean up test data
    DELETE FROM user_tiers WHERE id = test_user_id;
    DELETE FROM basic_users WHERE id = test_user_id;
    DELETE FROM profiles WHERE id = test_user_id;
    
    RAISE NOTICE 'Test completed and cleaned up';
END $$;

-- Step 7: Show current trigger definition
SELECT 
    'Current Trigger Definition' as check_type,
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    proname as function_name,
    tgtype,
    tgenabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';
