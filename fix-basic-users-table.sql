-- Fix Basic Users Table - Add Missing Columns
-- Run this in your Supabase SQL Editor

-- Step 1: Add missing user_type column
ALTER TABLE basic_users 
ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) DEFAULT 'adder';

-- Step 2: Add comment for the new column
COMMENT ON COLUMN basic_users.user_type IS 'Type of user: adder (permanent basic user who can add squad members)';

-- Step 3: Verify the table structure now
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'basic_users' 
ORDER BY ordinal_position;

-- Step 4: Show current basic users with the new column
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

-- Step 5: Test the is_basic_user_active function
SELECT is_basic_user_active('test@example.com');

