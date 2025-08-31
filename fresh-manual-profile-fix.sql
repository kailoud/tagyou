-- Comprehensive Database Fix for TagYou
-- This script fixes all permission and RLS issues causing 401/404 errors

-- =====================================================
-- STEP 1: FIX RLS POLICIES
-- =====================================================

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own premium status" ON premium_users;
DROP POLICY IF EXISTS "Service role can manage all premium users" ON premium_users;
DROP POLICY IF EXISTS "Users can view their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can manage their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Service role can manage all favorites" ON user_favorites;
DROP POLICY IF EXISTS "Service role can manage login attempts" ON login_attempts;
DROP POLICY IF EXISTS "Allow authenticated users to read carnivals" ON carnivals;
DROP POLICY IF EXISTS "Allow service role to manage carnivals" ON carnivals;
DROP POLICY IF EXISTS "Allow anonymous users to read carnivals" ON carnivals;

-- =====================================================
-- STEP 2: RECREATE POLICIES WITH PROPER PERMISSIONS
-- =====================================================

-- User profiles policies - Allow authenticated users to manage their own profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles" ON user_profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Premium users policies
CREATE POLICY "Users can view their own premium status" ON premium_users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all premium users" ON premium_users
    FOR ALL USING (auth.role() = 'service_role');

-- User favorites policies
CREATE POLICY "Users can view their own favorites" ON user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" ON user_favorites
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all favorites" ON user_favorites
    FOR ALL USING (auth.role() = 'service_role');

-- Login attempts policies
CREATE POLICY "Service role can manage login attempts" ON login_attempts
    FOR ALL USING (auth.role() = 'service_role');

-- Carnivals policies - Allow public read access
CREATE POLICY "Allow authenticated users to read carnivals" ON carnivals
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to manage carnivals" ON carnivals
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow anonymous users to read carnivals" ON carnivals
    FOR SELECT USING (true);

-- =====================================================
-- STEP 3: FIX USER PROFILE CREATION TRIGGER
-- =====================================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create robust handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert user profile with proper error handling
    INSERT INTO user_profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name', 
            split_part(NEW.email, '@', 1)
        )
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the signup
        RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- STEP 4: CREATE MANUAL PROFILE CREATION FUNCTION
-- =====================================================

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

-- =====================================================
-- STEP 5: GRANT ALL NECESSARY PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT ON premium_users TO authenticated;
GRANT ALL ON user_favorites TO authenticated;
GRANT SELECT ON carnivals TO authenticated;

-- Grant permissions to service role
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON premium_users TO service_role;
GRANT ALL ON user_favorites TO service_role;
GRANT ALL ON login_attempts TO service_role;
GRANT ALL ON carnivals TO service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION create_user_profile_manual(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile_manual(TEXT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION upgrade_to_premium(TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION upgrade_to_premium(TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION is_user_premium(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_premium(TEXT) TO service_role;

-- =====================================================
-- STEP 6: CREATE OR REPLACE VIEWS
-- =====================================================

-- View for active premium users
CREATE OR REPLACE VIEW active_premium_users AS
SELECT 
    up.id,
    up.email,
    up.display_name,
    up.user_type,
    pu.subscription_status,
    pu.current_period_start,
    pu.current_period_end,
    up.created_at,
    up.updated_at
FROM user_profiles up
LEFT JOIN premium_users pu ON up.id = pu.user_id
WHERE up.user_type = 'premium' 
AND up.status = 'active'
AND (pu.subscription_status = 'active' OR pu.subscription_status IS NULL);

-- Grant permissions on view
GRANT SELECT ON active_premium_users TO authenticated;
GRANT SELECT ON active_premium_users TO service_role;

-- =====================================================
-- STEP 7: TEST AND VERIFY
-- =====================================================

-- Test if we can query the tables
SELECT 'Testing user_profiles table access...' as test_step;
SELECT COUNT(*) as user_profiles_count FROM user_profiles;

SELECT 'Testing premium_users table access...' as test_step;
SELECT COUNT(*) as premium_users_count FROM premium_users;

SELECT 'Testing carnivals table access...' as test_step;
SELECT COUNT(*) as carnivals_count FROM carnivals;

-- Verify policies are in place
SELECT 'Verifying RLS policies...' as test_step;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'premium_users', 'user_favorites', 'carnivals');

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT '✅ Database fix completed successfully!' as status;
SELECT 'All RLS policies have been recreated with proper permissions.' as message;
SELECT 'User profile creation trigger has been fixed.' as message2;
SELECT 'Manual profile creation function is available.' as message3;
