-- User Tier System Implementation
-- New Sign In → Permanent Basic User
-- Upgrade to Premium → Premium User
-- Premium User → Can add unlimited permanent users
-- Permanent Basic User → Can add 1 Permanent Basic User

-- Step 1: Create user_tiers table to track user levels and permissions
CREATE TABLE IF NOT EXISTS user_tiers (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    tier_type VARCHAR(50) NOT NULL DEFAULT 'basic' CHECK (tier_type IN ('basic', 'premium')),
    tier_status VARCHAR(50) NOT NULL DEFAULT 'permanent' CHECK (tier_status IN ('temporary', 'permanent')),
    users_added_count INTEGER DEFAULT 0,
    max_users_can_add INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    upgraded_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NULL, -- NULL = permanent, timestamp = temporary
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_tiers_email ON user_tiers(email);
CREATE INDEX IF NOT EXISTS idx_user_tiers_tier_type ON user_tiers(tier_type);
CREATE INDEX IF NOT EXISTS idx_user_tiers_tier_status ON user_tiers(tier_status);
CREATE INDEX IF NOT EXISTS idx_user_tiers_active ON user_tiers(is_active);
CREATE INDEX IF NOT EXISTS idx_user_tiers_expires_at ON user_tiers(expires_at);

-- Step 3: Enable RLS
ALTER TABLE user_tiers ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
CREATE POLICY "Users can view their own tier record" ON user_tiers
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own tier record" ON user_tiers
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own tier record" ON user_tiers
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 5: Create user_relationships table to track who added whom
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

-- Step 6: Create indexes for user_relationships
CREATE INDEX IF NOT EXISTS idx_user_relationships_added_by ON user_relationships(added_by_user_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_added_user ON user_relationships(added_user_id);
CREATE INDEX IF NOT EXISTS idx_user_relationships_active ON user_relationships(is_active);

-- Step 7: Enable RLS for user_relationships
ALTER TABLE user_relationships ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for user_relationships
CREATE POLICY "Users can view relationships they're involved in" ON user_relationships
    FOR SELECT USING (auth.uid() = added_by_user_id OR auth.uid() = added_user_id);

CREATE POLICY "Users can insert relationships they create" ON user_relationships
    FOR INSERT WITH CHECK (auth.uid() = added_by_user_id);

CREATE POLICY "Users can update relationships they created" ON user_relationships
    FOR UPDATE USING (auth.uid() = added_by_user_id);

-- Step 9: Update the handle_new_user function to create tier records
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
        1, -- Can add 1 Permanent Basic User (basic user limit)
        NOW(),
        NULL, -- NULL = permanent
        NOW(),
        true
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Function to upgrade user to premium
CREATE OR REPLACE FUNCTION upgrade_user_to_premium(user_email VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Get user ID
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User not found: %', user_email;
    END IF;
    
    -- Update user tier to premium
    UPDATE user_tiers 
    SET 
        tier_type = 'premium',
        tier_status = 'permanent',
        max_users_can_add = 999999, -- Unlimited (practical limit)
        upgraded_at = NOW(),
        last_activity = NOW()
    WHERE id = user_id;
    
    IF FOUND THEN
        RAISE NOTICE 'User % upgraded to premium successfully', user_email;
        RETURN TRUE;
    ELSE
        RAISE NOTICE 'User tier record not found for: %', user_email;
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Function to add a new user (with permission checking)
CREATE OR REPLACE FUNCTION add_new_user(
    new_user_email VARCHAR,
    new_user_name VARCHAR DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    current_user_id UUID;
    current_user_tier user_tiers%ROWTYPE;
    new_user_id UUID;
    result JSON;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not authenticated');
    END IF;
    
    -- Get current user's tier information
    SELECT * INTO current_user_tier FROM user_tiers WHERE id = current_user_id;
    
    IF current_user_tier IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User tier not found');
    END IF;
    
    -- Check if user can add more users
    IF current_user_tier.users_added_count >= current_user_tier.max_users_can_add THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'User limit reached', 
            'current_count', current_user_tier.users_added_count,
            'max_allowed', current_user_tier.max_users_can_add
        );
    END IF;
    
    -- Check if new user email already exists
    IF EXISTS(SELECT 1 FROM auth.users WHERE email = new_user_email) THEN
        RETURN json_build_object('success', false, 'error', 'User with this email already exists');
    END IF;
    
    -- Create new user in auth.users (this will trigger handle_new_user)
    -- Note: In a real implementation, you'd need to handle password creation
    -- For now, we'll just create the tier record manually
    
    -- Generate a new user ID
    new_user_id := gen_random_uuid();
    
    -- Create user tier record for the new user (always creates a Permanent Basic User)
    INSERT INTO user_tiers (id, email, tier_type, tier_status, users_added_count, max_users_can_add, created_at, expires_at, last_activity, is_active)
    VALUES (
        new_user_id,
        new_user_email,
        'basic', -- Always creates a basic user
        'permanent', -- Always creates a permanent user
        0,
        1, -- Can add 1 Permanent Basic User
        NOW(),
        NULL,
        NOW(),
        true
    );
    
    -- Create relationship record
    INSERT INTO user_relationships (added_by_user_id, added_user_id, relationship_type, created_at, expires_at, is_active)
    VALUES (
        current_user_id,
        new_user_id,
        'permanent',
        NOW(),
        NULL,
        true
    );
    
    -- Update the adding user's count
    UPDATE user_tiers 
    SET users_added_count = users_added_count + 1,
        last_activity = NOW()
    WHERE id = current_user_id;
    
    RETURN json_build_object(
        'success', true,
        'new_user_id', new_user_id,
        'new_user_email', new_user_email,
        'added_by', current_user_id,
        'relationship_type', 'permanent'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 12: Function to check user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_email VARCHAR DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    target_user_id UUID;
    user_tier_info user_tiers%ROWTYPE;
    added_users_count INTEGER;
    can_add_users BOOLEAN;
BEGIN
    -- If no email provided, use current user
    IF user_email IS NULL THEN
        target_user_id := auth.uid();
    ELSE
        SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
    END IF;
    
    IF target_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not found');
    END IF;
    
    -- Get user tier information
    SELECT * INTO user_tier_info FROM user_tiers WHERE id = target_user_id;
    
    IF user_tier_info IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User tier not found');
    END IF;
    
    -- Count users added by this user
    SELECT COUNT(*) INTO added_users_count 
    FROM user_relationships 
    WHERE added_by_user_id = target_user_id AND is_active = true;
    
    -- Check if user can add more users
    can_add_users := (added_users_count < user_tier_info.max_users_can_add);
    
    RETURN json_build_object(
        'success', true,
        'user_id', target_user_id,
        'email', user_tier_info.email,
        'tier_type', user_tier_info.tier_type,
        'tier_status', user_tier_info.tier_status,
        'users_added_count', added_users_count,
        'max_users_can_add', user_tier_info.max_users_can_add,
        'can_add_users', can_add_users,
        'is_premium', user_tier_info.tier_type = 'premium',
        'is_permanent', user_tier_info.tier_status = 'permanent'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 13: Create tier records for existing users
INSERT INTO user_tiers (id, email, tier_type, tier_status, users_added_count, max_users_can_add, created_at, expires_at, last_activity, is_active)
SELECT 
    au.id,
    au.email,
    'basic' as tier_type,
    'permanent' as tier_status,
    0 as users_added_count,
    1 as max_users_can_add, -- Can add 1 Permanent Basic User
    au.created_at,
    NULL as expires_at,
    au.created_at as last_activity,
    true as is_active
FROM auth.users au
LEFT JOIN user_tiers ut ON au.id = ut.id
WHERE ut.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 14: Show verification results
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

-- Step 15: Show recent user tiers
SELECT 
    id,
    email,
    tier_type,
    tier_status,
    users_added_count,
    max_users_can_add,
    created_at,
    upgraded_at,
    CASE 
        WHEN tier_type = 'premium' THEN 'Premium User (Unlimited)'
        WHEN tier_type = 'basic' AND tier_status = 'permanent' THEN 'Permanent Basic User (Can add 1 Permanent Basic User)'
        ELSE 'Temporary User'
    END as user_description
FROM user_tiers 
ORDER BY created_at DESC
LIMIT 10;
