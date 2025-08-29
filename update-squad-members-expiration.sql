-- Update Carnival Squad Members Table for Expiration Logic
-- Run this in your Supabase SQL Editor

-- Step 1: Add expires_at column to carnival_squad_members table
ALTER TABLE carnival_squad_members 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE NULL;

-- Step 2: Add member_type column to distinguish between adder and added
ALTER TABLE carnival_squad_members 
ADD COLUMN IF NOT EXISTS member_type VARCHAR(50) DEFAULT 'added';

-- Step 3: Add additional columns for added member tracking
ALTER TABLE carnival_squad_members 
ADD COLUMN IF NOT EXISTS added_by_user_id UUID;

ALTER TABLE carnival_squad_members 
ADD COLUMN IF NOT EXISTS needs_signin BOOLEAN DEFAULT true;

ALTER TABLE carnival_squad_members 
ADD COLUMN IF NOT EXISTS signed_in_at TIMESTAMP WITH TIME ZONE;

-- Step 4: Add comment to explain the new logic
COMMENT ON COLUMN carnival_squad_members.expires_at IS 'When the squad member expires (NULL = permanent, timestamp = expires for added members)';
COMMENT ON COLUMN carnival_squad_members.member_type IS 'Type of member: adder (permanent) or added (needs to sign in)';
COMMENT ON COLUMN carnival_squad_members.added_by_user_id IS 'User ID of the user who added this squad member';
COMMENT ON COLUMN carnival_squad_members.needs_signin IS 'Whether the added member needs to sign in to become permanent';
COMMENT ON COLUMN carnival_squad_members.signed_in_at IS 'When the added member signed in to become permanent';

-- Step 3: Create index for efficient expiration queries
CREATE INDEX IF NOT EXISTS idx_carnival_squad_members_expires_at ON carnival_squad_members(expires_at);

-- Step 4: Create function to clean up expired squad members
CREATE OR REPLACE FUNCTION cleanup_expired_squad_members()
RETURNS void AS $$
BEGIN
    -- Delete expired added persons (whether they signed up or not)
    DELETE FROM carnival_squad_members 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW()
    AND member_type IN ('added', 'signed_up'); -- Delete both added and signed_up members
    
    RAISE NOTICE 'Cleaned up expired added persons';
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create function to extend squad member expiration
CREATE OR REPLACE FUNCTION extend_squad_member_expiration(member_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE carnival_squad_members 
    SET expires_at = NOW() + INTERVAL '1 hour'
    WHERE id = member_id 
    AND expires_at IS NOT NULL
    AND member_type = 'added'; -- Only extend added members
    
    IF FOUND THEN
        RAISE NOTICE 'Extended expiration for added squad member: %', member_id;
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'Squad member not found, has no expiration, or is not an added member: %', member_id;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create function to check if squad member is expired
CREATE OR REPLACE FUNCTION is_squad_member_expired(member_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM carnival_squad_members 
        WHERE id = member_id 
        AND expires_at IS NOT NULL 
        AND expires_at < NOW()
        AND member_type = 'added' -- Only check added members
    );
END;
$$ LANGUAGE plpgsql;

-- Step 7: Update existing squad members to have no expiration (for premium users)
-- This assumes existing squad members belong to premium users
-- Uncomment if you want to make existing squad members permanent
-- UPDATE carnival_squad_members SET expires_at = NULL WHERE expires_at IS NULL;

-- Step 8: Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'carnival_squad_members' 
AND column_name = 'expires_at';

-- Step 9: Show current squad members with expiration status
SELECT 
    id,
    name,
    phone,
    created_at,
    expires_at,
    member_type,
    CASE 
        WHEN expires_at IS NULL AND member_type = 'permanent' THEN 'Permanent (Premium User)'
        WHEN expires_at IS NULL AND member_type IN ('added', 'signed_up') THEN 'Permanent (Basic User - Added by Premium)'
        WHEN expires_at > NOW() THEN 'Temporary (Basic User - Active)'
        ELSE 'Temporary (Basic User - Expired)'
    END as member_status
FROM carnival_squad_members 
ORDER BY created_at DESC
LIMIT 20;

-- Step 10: Create a cron job to run cleanup every 5 minutes (optional)
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-expired-squad-members', '*/5 * * * *', 'SELECT cleanup_expired_squad_members();');
