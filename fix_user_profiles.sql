-- Fix User Profiles Table and Trigger Issues
-- Run this in your Supabase SQL Editor

-- =====================================================
-- FIX USER PROFILES TABLE
-- =====================================================

-- 1. Drop existing trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create or replace the user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create basic RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow insert for authenticated users" ON user_profiles;
CREATE POLICY "Allow insert for authenticated users" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 6. Create a simpler trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role, is_admin)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        CASE 
            WHEN NEW.email = 'admin@tagyou.com' THEN 'admin'::TEXT
            WHEN NEW.email LIKE '%@admin.com' THEN 'admin'::TEXT
            ELSE 'user'::TEXT
        END,
        CASE 
            WHEN NEW.email = 'admin@tagyou.com' THEN TRUE
            WHEN NEW.email LIKE '%@admin.com' THEN TRUE
            ELSE FALSE
        END
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- CREATE PROFILES FOR EXISTING USERS
-- =====================================================

-- Create profiles for existing users that don't have one
INSERT INTO user_profiles (id, email, full_name, role, is_admin)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'User'),
    CASE 
        WHEN au.email = 'admin@tagyou.com' THEN 'admin'::TEXT
        WHEN au.email LIKE '%@admin.com' THEN 'admin'::TEXT
        ELSE 'user'::TEXT
    END,
    CASE 
        WHEN au.email = 'admin@tagyou.com' THEN TRUE
        WHEN au.email LIKE '%@admin.com' THEN TRUE
        ELSE FALSE
    END
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if user_profiles table exists and has data
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN is_admin = TRUE THEN 1 END) as admin_profiles
FROM user_profiles;

-- Check trigger function
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Check trigger
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- =====================================================
-- TEST USER CREATION
-- =====================================================

-- Test the trigger by creating a test user (optional)
-- INSERT INTO auth.users (
--     instance_id,
--     id,
--     aud,
--     role,
--     email,
--     encrypted_password,
--     email_confirmed_at,
--     recovery_sent_at,
--     last_sign_in_at,
--     raw_app_meta_data,
--     raw_user_meta_data,
--     created_at,
--     updated_at,
--     confirmation_token,
--     email_change,
--     email_change_token_new,
--     recovery_token
-- ) VALUES (
--     '00000000-0000-0000-0000-000000000000',
--     gen_random_uuid(),
--     'authenticated',
--     'authenticated',
--     'test@example.com',
--     crypt('test123', gen_salt('bf')),
--     NOW(),
--     NULL,
--     NOW(),
--     '{"provider": "email", "providers": ["email"]}',
--     '{"full_name": "Test User"}',
--     NOW(),
--     NOW(),
--     '',
--     '',
--     '',
--     ''
-- );

-- =====================================================
-- FIX SUMMARY
-- =====================================================

/*
FIXES APPLIED:

1. Dropped existing trigger and function to avoid conflicts
2. Created user_profiles table with proper structure
3. Enabled Row Level Security (RLS)
4. Created basic RLS policies for security
5. Created a simpler trigger function with error handling
6. Created the trigger to automatically create user profiles
7. Created profiles for existing users

The trigger function now includes error handling that won't fail
the user creation process if profile creation fails.

This should resolve the "Database error saving new user" issue
and allow the email verification popup to work properly.
*/
