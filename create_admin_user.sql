-- Create Admin User in Supabase
-- Run this in your Supabase SQL Editor

-- =====================================================
-- CREATE ADMIN USER
-- =====================================================

-- First, check if admin user already exists
DO $$
BEGIN
    -- Check if admin user already exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@tagyou.com') THEN
        -- Insert admin user into auth.users table
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', -- instance_id (default)
            gen_random_uuid(), -- id (generate new UUID)
            'authenticated', -- aud
            'authenticated', -- role
            'admin@tagyou.com', -- email
            crypt('admin123456', gen_salt('bf')), -- encrypted_password (admin123456)
            NOW(), -- email_confirmed_at (confirmed immediately)
            NULL, -- recovery_sent_at
            NOW(), -- last_sign_in_at
            '{"provider": "email", "providers": ["email"]}', -- raw_app_meta_data
            '{"full_name": "Admin User", "admin": true}', -- raw_user_meta_data
            NOW(), -- created_at
            NOW(), -- updated_at
            '', -- confirmation_token
            '', -- email_change
            '', -- email_change_token_new
            '' -- recovery_token
        );
        
        RAISE NOTICE 'Admin user created successfully: admin@tagyou.com';
    ELSE
        RAISE NOTICE 'Admin user already exists: admin@tagyou.com';
    END IF;
END $$;

-- =====================================================
-- ALTERNATIVE: CREATE MULTIPLE ADMIN USERS
-- =====================================================

-- You can also create additional admin users by running similar INSERT statements
-- Just change the email and password for each admin user

-- Example: Create another admin user (uncomment to use)
/*
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'superadmin@tagyou.com') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'superadmin@tagyou.com',
            crypt('superadmin123', gen_salt('bf')),
            NOW(),
            NULL,
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Super Admin", "admin": true}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
        
        RAISE NOTICE 'Super admin user created successfully: superadmin@tagyou.com';
    ELSE
        RAISE NOTICE 'Super admin user already exists: superadmin@tagyou.com';
    END IF;
END $$;
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if admin user was created successfully
SELECT 
    id,
    email,
    email_confirmed_at,
    raw_user_meta_data,
    created_at
FROM auth.users 
WHERE email = 'admin@tagyou.com';

-- List all admin users
SELECT 
    email,
    raw_user_meta_data,
    created_at
FROM auth.users 
WHERE raw_user_meta_data->>'admin' = 'true';

-- =====================================================
-- ADMIN CREDENTIALS
-- =====================================================

/*
Admin User Created:
- Email: admin@tagyou.com
- Password: admin123456
- Status: Email confirmed, ready to use
- Role: Authenticated user with admin privileges

To use this admin account:
1. Go to your GroupTracker app
2. Click "Sign In"
3. Enter: admin@tagyou.com / admin123456
4. You'll have access to the admin portal

Note: This creates a user directly in the database.
For production, consider using Supabase Auth UI or 
the auth.signUp() method instead.
*/
