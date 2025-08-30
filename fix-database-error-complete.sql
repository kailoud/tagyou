-- =====================================================
-- COMPLETE FIX FOR "Database error saving new user"
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Create user_tiers table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_tiers (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    tier_type VARCHAR(50) NOT NULL DEFAULT 'basic' CHECK (tier_type IN ('basic', 'premium')),
    tier_status VARCHAR(50) NOT NULL DEFAULT 'permanent' CHECK (tier_status IN ('temporary', 'permanent')),
    users_added_count INTEGER DEFAULT 0,
    max_users_can_add INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    upgraded_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Step 2: Create user_relationships table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    added_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    added_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    relationship_type VARCHAR(50) NOT NULL DEFAULT 'permanent' CHECK (relationship_type IN ('temporary', 'permanent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NULL,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(added_by_user_id, added_user_id)
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_tiers_email ON user_tiers(email);
CREATE INDEX IF NOT EXISTS idx_user_tiers_tier_type ON user_tiers(tier_type);
CREATE INDEX IF NOT EXISTS idx_user_relationships_added_by ON user_relationships(added_by_user_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_added_user ON user_relationships(added_user_id);

-- Step 4: Enable RLS
ALTER TABLE user_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_relationships ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies (only if they don't exist)
DO $$
BEGIN
    -- User tiers policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_tiers' AND policyname = 'Users can view their own tier record') THEN
        CREATE POLICY "Users can view their own tier record" ON user_tiers FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_tiers' AND policyname = 'Users can insert their own tier record') THEN
        CREATE POLICY "Users can insert their own tier record" ON user_tiers FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_tiers' AND policyname = 'Users can update their own tier record') THEN
        CREATE POLICY "Users can update their own tier record" ON user_tiers FOR UPDATE USING (auth.uid() = id);
    END IF;
    
    -- User relationships policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_relationships' AND policyname = 'Users can view relationships they are involved in') THEN
        CREATE POLICY "Users can view relationships they are involved in" ON user_relationships FOR SELECT USING (auth.uid() = added_by_user_id OR auth.uid() = added_user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_relationships' AND policyname = 'Users can insert relationships they create') THEN
        CREATE POLICY "Users can insert relationships they create" ON user_relationships FOR INSERT WITH CHECK (auth.uid() = added_by_user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_relationships' AND policyname = 'Users can update relationships they created') THEN
        CREATE POLICY "Users can update relationships they created" ON user_relationships FOR UPDATE USING (auth.uid() = added_by_user_id);
    END IF;
END $$;

-- Step 6: Update handle_new_user function to create tier records
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
    
    -- Create user tier record (permanent basic user by default)
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create tier records for existing users
INSERT INTO user_tiers (id, email, tier_type, tier_status, users_added_count, max_users_can_add, created_at, expires_at, last_activity, is_active)
SELECT 
    au.id,
    au.email,
    'basic' as tier_type,
    'permanent' as tier_status,
    0 as users_added_count,
    1 as max_users_can_add,
    au.created_at,
    NULL as expires_at,
    au.created_at as last_activity,
    true as is_active
FROM auth.users au
LEFT JOIN user_tiers ut ON au.id = ut.id
WHERE ut.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 8: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Step 9: Show verification results
SELECT 
    'Total auth users' as metric,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Total user tiers' as metric,
    COUNT(*) as count
FROM user_tiers
UNION ALL
SELECT 
    'Basic users' as metric,
    COUNT(*) as count
FROM user_tiers WHERE tier_type = 'basic'
UNION ALL
SELECT 
    'Premium users' as metric,
    COUNT(*) as count
FROM user_tiers WHERE tier_type = 'premium';

-- Step 10: Show recent user tiers
SELECT 
    id,
    email,
    tier_type,
    tier_status,
    users_added_count,
    max_users_can_add,
    created_at,
    CASE 
        WHEN tier_type = 'premium' THEN 'Premium User (Unlimited)'
        WHEN tier_type = 'basic' AND tier_status = 'permanent' THEN 'Permanent Basic User (Can add 1)'
        ELSE 'Temporary User'
    END as user_description
FROM user_tiers 
ORDER BY created_at DESC
LIMIT 10;

-- Step 11: Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database error fix completed successfully!';
    RAISE NOTICE '🔐 User tier system is now properly set up.';
    RAISE NOTICE '👥 New users will be created as Permanent Basic Users.';
    RAISE NOTICE '📊 Check the verification results above.';
END $$;
