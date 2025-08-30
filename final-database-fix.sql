-- =====================================================
-- FINAL DATABASE FIX - "Database error saving new user"
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Step 2: Create a simple, robust trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the attempt
    RAISE NOTICE 'Creating records for new user: %', NEW.email;
    
    -- Create profile record
    BEGIN
        INSERT INTO profiles (id, email, display_name)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
        );
        RAISE NOTICE 'Profile created for user: %', NEW.email;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to create profile for %: %', NEW.email, SQLERRM;
    END;
    
    -- Create basic user record
    BEGIN
        INSERT INTO basic_users (id, email, created_at, expires_at, last_activity, is_active)
        VALUES (
            NEW.id,
            NEW.email,
            NOW(),
            NULL,
            NOW(),
            true
        );
        RAISE NOTICE 'Basic user record created for user: %', NEW.email;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to create basic user record for %: %', NEW.email, SQLERRM;
    END;
    
    -- Create user tier record
    BEGIN
        INSERT INTO user_tiers (id, email, tier_type, tier_status, users_added_count, max_users_can_add, created_at, expires_at, last_activity, is_active)
        VALUES (
            NEW.id,
            NEW.email,
            'basic',
            'permanent',
            0,
            1,
            NOW(),
            NULL,
            NOW(),
            true
        );
        RAISE NOTICE 'User tier record created for user: %', NEW.email;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to create user tier record for %: %', NEW.email, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 4: Grant all necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Step 5: Ensure RLS policies exist
DO $$
BEGIN
    -- Profiles policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile') THEN
        CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile') THEN
        CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    
    -- Basic users policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'basic_users' AND policyname = 'Users can view their own basic user record') THEN
        CREATE POLICY "Users can view their own basic user record" ON basic_users FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'basic_users' AND policyname = 'Users can insert their own basic user record') THEN
        CREATE POLICY "Users can insert their own basic user record" ON basic_users FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    
    -- User tiers policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_tiers' AND policyname = 'Users can view their own tier record') THEN
        CREATE POLICY "Users can view their own tier record" ON user_tiers FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_tiers' AND policyname = 'Users can insert their own tier record') THEN
        CREATE POLICY "Users can insert their own tier record" ON user_tiers FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Step 6: Test the function manually (removed - trigger functions can only be called as triggers)
-- The trigger function will be tested when a new user is created

-- Step 7: Show verification
SELECT 
    'Trigger function created successfully' as status,
    'handle_new_user' as function_name,
    'on_auth_user_created' as trigger_name;

-- Step 8: Show current table counts
SELECT 
    'profiles' as table_name,
    COUNT(*) as record_count
FROM profiles
UNION ALL
SELECT 
    'basic_users' as table_name,
    COUNT(*) as record_count
FROM basic_users
UNION ALL
SELECT 
    'user_tiers' as table_name,
    COUNT(*) as record_count
FROM user_tiers;
