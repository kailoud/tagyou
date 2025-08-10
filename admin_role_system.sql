-- Admin Role System for Supabase
-- Run this in your Supabase SQL Editor

-- =====================================================
-- CREATE ADMIN ROLE SYSTEM
-- =====================================================

-- 1. Create a custom type for user roles
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');

-- 2. Create user_profiles table to store additional user info
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'user',
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for user_profiles
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
        )
    );

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND 
        role = (SELECT role FROM user_profiles WHERE id = auth.uid())
    );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
        )
    );

-- 5. Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role, is_admin)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        CASE 
            WHEN NEW.email = 'admin@tagyou.com' THEN 'admin'::user_role
            WHEN NEW.email LIKE '%@admin.com' THEN 'admin'::user_role
            ELSE 'user'::user_role
        END,
        CASE 
            WHEN NEW.email = 'admin@tagyou.com' THEN TRUE
            WHEN NEW.email LIKE '%@admin.com' THEN TRUE
            ELSE FALSE
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Create function to assign admin role
CREATE OR REPLACE FUNCTION assign_admin_role(user_email TEXT, admin_role user_role DEFAULT 'admin')
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
    current_user_role user_role;
BEGIN
    -- Check if current user is admin
    SELECT role INTO current_user_role 
    FROM user_profiles 
    WHERE id = auth.uid();
    
    IF current_user_role NOT IN ('admin', 'super_admin') THEN
        RAISE EXCEPTION 'Only admins can assign admin roles';
    END IF;
    
    -- Get user ID from email
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Update user role
    UPDATE user_profiles 
    SET 
        role = admin_role,
        is_admin = TRUE,
        updated_at = NOW()
    WHERE id = user_id;
    
    RAISE NOTICE 'Admin role assigned to %: %', user_email, admin_role;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to remove admin role
CREATE OR REPLACE FUNCTION remove_admin_role(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
    current_user_role user_role;
BEGIN
    -- Check if current user is super admin
    SELECT role INTO current_user_role 
    FROM user_profiles 
    WHERE id = auth.uid();
    
    IF current_user_role != 'super_admin' THEN
        RAISE EXCEPTION 'Only super admins can remove admin roles';
    END IF;
    
    -- Get user ID from email
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Update user role
    UPDATE user_profiles 
    SET 
        role = 'user',
        is_admin = FALSE,
        updated_at = NOW()
    WHERE id = user_id;
    
    RAISE NOTICE 'Admin role removed from %', user_email;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create function to list all admins
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    role user_role,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    ) THEN
        RAISE EXCEPTION 'Only admins can view admin users';
    END IF;
    
    RETURN QUERY
    SELECT 
        up.id,
        up.email,
        up.full_name,
        up.role,
        up.created_at
    FROM user_profiles up
    WHERE up.is_admin = TRUE OR up.role IN ('admin', 'super_admin')
    ORDER BY up.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = user_id AND (role = 'admin' OR role = 'super_admin' OR is_admin = TRUE)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SETUP EXISTING USERS
-- =====================================================

-- Create profiles for existing users (if any)
INSERT INTO user_profiles (id, email, full_name, role, is_admin)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'User'),
    CASE 
        WHEN au.email = 'admin@tagyou.com' THEN 'admin'::user_role
        WHEN au.email LIKE '%@admin.com' THEN 'admin'::user_role
        ELSE 'user'::user_role
    END,
    CASE 
        WHEN au.email = 'admin@tagyou.com' THEN TRUE
        WHEN au.email LIKE '%@admin.com' THEN TRUE
        ELSE FALSE
    END
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = au.id
);

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Assign admin role to a user
-- SELECT assign_admin_role('user@example.com', 'admin');

-- Assign super admin role to a user
-- SELECT assign_admin_role('superuser@example.com', 'super_admin');

-- Remove admin role from a user
-- SELECT remove_admin_role('user@example.com');

-- List all admin users
-- SELECT * FROM get_admin_users();

-- Check if current user is admin
-- SELECT is_user_admin();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check user_profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- View all users with their roles
SELECT 
    up.email,
    up.full_name,
    up.role,
    up.is_admin,
    up.created_at
FROM user_profiles up
ORDER BY up.created_at DESC;

-- View only admin users
SELECT 
    email,
    full_name,
    role,
    created_at
FROM user_profiles 
WHERE is_admin = TRUE OR role IN ('admin', 'super_admin')
ORDER BY created_at DESC;

-- =====================================================
-- ADMIN ROLE SYSTEM OVERVIEW
-- =====================================================

/*
ADMIN ROLE SYSTEM CREATED:

1. User Roles:
   - 'user': Regular user
   - 'admin': Admin user (can manage other users)
   - 'super_admin': Super admin (can remove admin roles)

2. Functions Available:
   - assign_admin_role(email, role): Assign admin role to user
   - remove_admin_role(email): Remove admin role from user
   - get_admin_users(): List all admin users
   - is_user_admin(user_id): Check if user is admin

3. Automatic Features:
   - New users get 'user' role by default
   - Users with @admin.com email get 'admin' role automatically
   - admin@tagyou.com gets 'admin' role automatically

4. Security:
   - Row Level Security (RLS) enabled
   - Only admins can assign/remove admin roles
   - Only super admins can remove admin roles
   - Users can only view/edit their own profiles

5. Usage in your app:
   - Check admin status: SELECT is_user_admin();
   - List admins: SELECT * FROM get_admin_users();
   - Assign admin: SELECT assign_admin_role('user@example.com');
*/
