-- Fix Existing Users Missing Basic User Records
-- Run this in your Supabase SQL editor to fix the current issue

-- Step 1: Create basic_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS basic_users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NULL, -- NULL = permanent basic user
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Step 2: Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_basic_users_expires_at ON basic_users(expires_at);
CREATE INDEX IF NOT EXISTS idx_basic_users_email ON basic_users(email);
CREATE INDEX IF NOT EXISTS idx_basic_users_active ON basic_users(is_active);

-- Step 3: Enable RLS
ALTER TABLE basic_users ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
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

-- Step 5: Create basic user records for all existing auth users who don't have them
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

-- Step 6: Create profile records for any auth users who don't have them
INSERT INTO profiles (id, email, display_name, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    au.created_at,
    au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
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

-- Step 8: Show any users that might still be missing records
SELECT 
    'Users missing basic user records' as issue,
    COUNT(*) as count
FROM auth.users au
LEFT JOIN basic_users bu ON au.id = bu.id
WHERE bu.id IS NULL
UNION ALL
SELECT 
    'Users missing profile records' as issue,
    COUNT(*) as count
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Step 9: Show recent basic users
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
