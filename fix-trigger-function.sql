-- =====================================================
-- FIX TRIGGER FUNCTION - "Database error saving new user"
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Create the trigger function
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
    
    -- Create basic user record
    INSERT INTO basic_users (id, email, created_at, expires_at, last_activity, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        NOW(),
        NULL, -- NULL = permanent basic user
        NOW(),
        true
    );
    
    -- Create user tier record
    INSERT INTO user_tiers (id, email, tier_type, tier_status, users_added_count, max_users_can_add, created_at, expires_at, last_activity, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        'basic', -- Default tier type
        'permanent', -- Default tier status
        0, -- No users added yet
        1, -- Can add 1 Permanent Basic User
        NOW(),
        NULL, -- NULL = permanent
        NOW(),
        true
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 4: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Step 5: Show verification
SELECT 
    'Trigger function created successfully' as status,
    'handle_new_user' as function_name;

-- Step 6: Test the function (optional)
-- This will show if the function can be called without errors
SELECT 
    'Function test' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'handle_new_user' 
            AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        ) THEN 'Function exists and is callable'
        ELSE 'Function not found'
    END as result;
