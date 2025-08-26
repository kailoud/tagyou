-- Temporarily disable RLS for testing premium_users table
-- WARNING: This should only be used for testing, not in production

-- Disable RLS on premium_users table
ALTER TABLE premium_users DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'premium_users';

-- To re-enable RLS later, run:
-- ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;
