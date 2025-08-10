-- Simple Fix for User Profiles Table
-- Run this in your Supabase SQL Editor

-- =====================================================
-- SIMPLE USER PROFILES FIX
-- =====================================================

-- 1. Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Drop existing user_profiles table if it exists
DROP TABLE IF EXISTS user_profiles;

-- 3. Create a simple user_profiles table (no ENUM types)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create basic RLS policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow insert for authenticated users" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 6. Create simple trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role, is_admin)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        CASE 
            WHEN NEW.email = 'admin@tagyou.com' THEN 'admin'
            WHEN NEW.email LIKE '%@admin.com' THEN 'admin'
            ELSE 'user'
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

-- Create profiles for existing users
INSERT INTO user_profiles (id, email, full_name, role, is_admin)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'User'),
    CASE 
        WHEN au.email = 'admin@tagyou.com' THEN 'admin'
        WHEN au.email LIKE '%@admin.com' THEN 'admin'
        ELSE 'user'
    END,
    CASE 
        WHEN au.email = 'admin@tagyou.com' THEN TRUE
        WHEN au.email LIKE '%@admin.com' THEN TRUE
        ELSE FALSE
    END
FROM auth.users au
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check if everything worked
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN is_admin = TRUE THEN 1 END) as admin_profiles,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_roles
FROM user_profiles;

-- Show all users and their roles
SELECT 
    email,
    full_name,
    role,
    is_admin,
    created_at
FROM user_profiles
ORDER BY created_at DESC;

-- =====================================================
-- SIMPLE FIX COMPLETE
-- =====================================================

/*
SIMPLE FIX APPLIED:

1. Dropped all existing triggers, functions, and tables
2. Created a simple user_profiles table with TEXT role column
3. No ENUM types to avoid casting issues
4. Simple trigger function with error handling
5. Basic RLS policies for security
6. Created profiles for all existing users

This should resolve the type casting error and allow
user registration to work properly with the email verification popup.
*/
