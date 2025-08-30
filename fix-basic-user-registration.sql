-- Fix Basic User Registration Issue
-- This script updates the schema to automatically create basic user records when users sign up
-- and creates basic user records for any existing users who don't have them

-- Step 1: Create basic_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS basic_users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NULL, -- NULL = permanent basic user, timestamp = temporary user
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Step 2: Create indexes for basic_users table
CREATE INDEX IF NOT EXISTS idx_basic_users_expires_at ON basic_users(expires_at);
CREATE INDEX IF NOT EXISTS idx_basic_users_email ON basic_users(email);
CREATE INDEX IF NOT EXISTS idx_basic_users_active ON basic_users(is_active);

-- Step 3: Enable RLS on basic_users table
ALTER TABLE basic_users ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for basic_users table
DROP POLICY IF EXISTS "Users can view their own basic user record" ON basic_users;
CREATE POLICY "Users can view their own basic user record" ON basic_users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own basic user record" ON basic_users;
CREATE POLICY "Users can insert their own basic user record" ON basic_users
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own basic user record" ON basic_users;
CREATE POLICY "Users can update their own basic user record" ON basic_users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own basic user record" ON basic_users;
CREATE POLICY "Users can delete their own basic user record" ON basic_users
    FOR DELETE USING (auth.uid() = id);

-- Step 5: Update the handle_new_user function to create basic user records
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile record
    INSERT INTO profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    
    -- Create basic user record (permanent basic user)
    INSERT INTO basic_users (id, email, created_at, expires_at, last_activity, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        NOW(),
        NULL, -- NULL = permanent basic user
        NOW(),
        true
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create basic user records for existing users who don't have them
INSERT INTO basic_users (id, email, created_at, expires_at, last_activity, is_active)
SELECT 
    au.id,
    au.email,
    au.created_at,
    NULL, -- NULL = permanent basic user
    au.created_at,
    true
FROM auth.users au
LEFT JOIN basic_users bu ON au.id = bu.id
WHERE bu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 7: Show the results
SELECT 
    'Total auth users' as metric,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Total basic users' as metric,
    COUNT(*) as count
FROM basic_users
UNION ALL
SELECT 
    'Total profiles' as metric,
    COUNT(*) as count
FROM profiles;

-- Step 8: Show basic users that were created
SELECT 
    id,
    email,
    created_at,
    expires_at,
    is_active,
    CASE 
        WHEN expires_at IS NULL THEN 'Permanent Basic User'
        WHEN expires_at > NOW() THEN 'Temporary Basic User (Active)'
        ELSE 'Temporary Basic User (Expired)'
    END as user_status
FROM basic_users 
ORDER BY created_at DESC
LIMIT 10;

-- Step 9: Verify the trigger is working
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
