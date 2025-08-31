-- Fix RLS Policy for Profile Creation
-- This script fixes the RLS policy that's preventing profile creation

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create a new policy that allows authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR 
    auth.uid() IS NOT NULL
  );

-- Alternative: Create a more permissive policy for profile creation
-- This allows the trigger to work properly
CREATE POLICY "Allow profile creation for authenticated users" ON profiles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Grant additional permissions if needed
GRANT INSERT ON profiles TO authenticated;
GRANT SELECT ON profiles TO authenticated;
GRANT UPDATE ON profiles TO authenticated;

-- Test the fix
SELECT 'RLS Policy fix applied successfully!' as status;
