-- Fix Admin Privileges Script
-- Run this in your Supabase SQL Editor to manually assign admin privileges

-- =====================================================
-- MANUAL ADMIN ASSIGNMENT
-- =====================================================

-- 1. First, let's see what users exist
SELECT 
    u.id,
    u.email,
    u.created_at,
    up.role,
    up.is_admin,
    up.full_name
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
ORDER BY u.created_at DESC;

-- 2. To assign admin privileges to a specific email, run this:
-- Replace 'your-email@example.com' with your actual email address

-- Option A: Update existing user profile
UPDATE user_profiles 
SET 
    role = 'admin',
    is_admin = TRUE,
    updated_at = NOW()
WHERE email = 'your-email@example.com';

-- Option B: If the user profile doesn't exist, create it
INSERT INTO user_profiles (id, email, full_name, role, is_admin, created_at, updated_at)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', 'Admin User'),
    'admin',
    TRUE,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'your-email@example.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE email = u.email
);

-- 3. Verify the admin assignment
SELECT 
    u.email,
    up.role,
    up.is_admin,
    up.full_name
FROM auth.users u
JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'your-email@example.com';

-- =====================================================
-- QUICK FIX FOR COMMON ISSUES
-- =====================================================

-- If you're still having issues, try these steps:

-- 1. Make sure the user_profiles table exists
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'user',
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Make sure the user_role type exists
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Enable RLS and create policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Admins can read all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
        )
    );

-- =====================================================
-- TROUBLESHOOTING COMMANDS
-- =====================================================

-- Check if your user exists in auth.users
SELECT id, email, created_at FROM auth.users WHERE email = 'your-email@example.com';

-- Check if your profile exists in user_profiles
SELECT * FROM user_profiles WHERE email = 'your-email@example.com';

-- Check all admin users
SELECT 
    u.email,
    up.role,
    up.is_admin,
    up.full_name
FROM auth.users u
JOIN user_profiles up ON u.id = up.id
WHERE up.is_admin = TRUE OR up.role IN ('admin', 'super_admin');

-- =====================================================
-- INSTRUCTIONS
-- =====================================================

/*
TO USE THIS SCRIPT:

1. Replace 'your-email@example.com' with your actual email address
2. Run the script in your Supabase SQL Editor
3. After running, log out and log back in to your application
4. The admin portal should now be visible

If you're still having issues:
1. Check the browser console for any error messages
2. Make sure you're logged in with the correct email
3. Try clearing your browser cache and local storage
4. Check that the Supabase connection is working properly
*/
