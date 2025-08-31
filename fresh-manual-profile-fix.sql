-- Manual Profile Creation Function
-- This function can be called manually if the trigger fails

-- Function to manually create a user profile
CREATE OR REPLACE FUNCTION create_user_profile_manual(user_email TEXT, user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    user_uuid UUID;
BEGIN
    -- If user_id is not provided, try to find it
    IF user_id IS NULL THEN
        SELECT id INTO user_uuid FROM auth.users WHERE email = user_email;
    ELSE
        user_uuid := user_id;
    END IF;
    
    -- Check if user exists
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User not found: %', user_email;
    END IF;
    
    -- Check if profile already exists
    IF EXISTS (SELECT 1 FROM user_profiles WHERE id = user_uuid) THEN
        RAISE NOTICE 'Profile already exists for user: %', user_email;
        RETURN TRUE;
    END IF;
    
    -- Create the profile
    INSERT INTO user_profiles (id, email, display_name)
    VALUES (
        user_uuid,
        user_email,
        split_part(user_email, '@', 1)
    );
    
    RAISE NOTICE 'Profile created successfully for user: %', user_email;
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to create profile for %: %', user_email, SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_user_profile_manual(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile_manual(TEXT, UUID) TO service_role;

-- Test the function
SELECT 'Manual profile creation function created successfully' as status;
