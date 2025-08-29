-- Update Basic Users Table for Permanent Basic Users
-- Run this in your Supabase SQL Editor

-- Step 1: Alter the expires_at column to allow NULL values
ALTER TABLE basic_users 
ALTER COLUMN expires_at DROP NOT NULL;

-- Step 2: Add a comment to explain the new logic
COMMENT ON COLUMN basic_users.expires_at IS 'When the basic user access expires (NULL = permanent basic user)';

-- Step 3: Update the table comment
COMMENT ON TABLE basic_users IS 'Tracks basic users (permanent basic users, no automatic expiration)';

-- Step 4: Update existing basic users to be permanent (optional)
-- Uncomment the line below if you want to make existing basic users permanent
-- UPDATE basic_users SET expires_at = NULL WHERE expires_at IS NOT NULL AND expires_at > NOW();

-- Step 5: Update the cleanup function to only handle users with expiration dates
CREATE OR REPLACE FUNCTION cleanup_expired_basic_users()
RETURNS void AS $$
BEGIN
    -- Delete expired basic users and their squad members (only those with expiration dates)
    DELETE FROM carnival_squad_members 
    WHERE user_email IN (
        SELECT email FROM basic_users 
        WHERE expires_at IS NOT NULL 
        AND expires_at < NOW() 
        AND is_active = true
    );
    
    -- Delete the expired basic users (only those with expiration dates)
    DELETE FROM basic_users 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() 
    AND is_active = true;
    
    RAISE NOTICE 'Cleaned up expired basic users';
END;
$$ LANGUAGE plpgsql;

-- Step 6: Update the function to check if user is basic and active (permanent or not expired)
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

-- Step 7: Update the function to extend basic user expiration (for temporary users only)
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

-- Step 8: Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'basic_users' 
AND column_name = 'expires_at';

-- Step 9: Show current basic users
SELECT 
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
ORDER BY created_at DESC;
