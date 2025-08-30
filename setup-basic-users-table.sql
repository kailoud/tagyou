-- Setup Basic Users Table for Permanent Basic Users
-- Run this in your Supabase SQL Editor

-- Step 1: Create basic_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS basic_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NULL, -- NULL = permanent basic user
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    user_type VARCHAR(50) DEFAULT 'adder' -- 'adder' = permanent basic user who can add squad members
);

-- Step 2: Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_basic_users_email ON basic_users(email);
CREATE INDEX IF NOT EXISTS idx_basic_users_expires_at ON basic_users(expires_at);
CREATE INDEX IF NOT EXISTS idx_basic_users_active ON basic_users(is_active);

-- Step 3: Enable Row Level Security (RLS)
ALTER TABLE basic_users ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
-- Policy: Users can only see their own basic user record
CREATE POLICY "Users can view own basic user record" ON basic_users
    FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Policy: Users can insert their own basic user record
CREATE POLICY "Users can insert own basic user record" ON basic_users
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = email);

-- Policy: Users can update their own basic user record
CREATE POLICY "Users can update own basic user record" ON basic_users
    FOR UPDATE USING (auth.jwt() ->> 'email' = email);

-- Policy: Users can delete their own basic user record
CREATE POLICY "Users can delete own basic user record" ON basic_users
    FOR DELETE USING (auth.jwt() ->> 'email' = email);

-- Step 5: Add comments to explain the table structure
COMMENT ON TABLE basic_users IS 'Tracks permanent basic users (no automatic expiration)';
COMMENT ON COLUMN basic_users.email IS 'User email address (unique)';
COMMENT ON COLUMN basic_users.created_at IS 'When the basic user record was created';
COMMENT ON COLUMN basic_users.expires_at IS 'When the basic user access expires (NULL = permanent basic user)';
COMMENT ON COLUMN basic_users.last_activity IS 'Last activity timestamp';
COMMENT ON COLUMN basic_users.is_active IS 'Whether the basic user account is active';
COMMENT ON COLUMN basic_users.user_type IS 'Type of user: adder (permanent basic user who can add squad members)';

-- Step 6: Create function to check if user is basic and active
CREATE OR REPLACE FUNCTION is_basic_user_active(user_email VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM basic_users 
        WHERE email = user_email 
        AND is_active = true
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create function to extend basic user expiration (for temporary users only)
CREATE OR REPLACE FUNCTION extend_basic_user_expiration(user_email VARCHAR)
RETURNS void AS $$
BEGIN
    UPDATE basic_users 
    SET expires_at = NOW() + INTERVAL '1 hour',
        last_activity = NOW()
    WHERE email = user_email 
    AND expires_at IS NOT NULL 
    AND is_active = true;
    
    RAISE NOTICE 'Extended expiration for user: %', user_email;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'basic_users' 
ORDER BY ordinal_position;

-- Step 9: Show current basic users (if any)
SELECT 
    email, 
    created_at, 
    expires_at, 
    is_active,
    user_type,
    CASE 
        WHEN expires_at IS NULL THEN 'Permanent Basic User'
        WHEN expires_at > NOW() THEN 'Temporary Basic User (Active)'
        ELSE 'Temporary Basic User (Expired)'
    END as user_status
FROM basic_users 
ORDER BY created_at DESC;

-- Step 10: Test the is_basic_user_active function
-- SELECT is_basic_user_active('test@example.com');

