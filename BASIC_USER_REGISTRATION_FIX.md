# Basic User Registration Fix

## Problem
When users signed up for the application, they were only being registered in the `auth.users` table and `profiles` table, but **not** in the `basic_users` table. This meant that new users weren't being properly tracked as basic users in the system.

## Root Cause
The `handle_new_user()` database trigger function was only creating records in the `profiles` table, but not in the `basic_users` table. This function is automatically called when a new user signs up via Supabase Auth.

## Solution Implemented

### 1. Updated Database Schema (`supabase-schema.sql`)
- Added `basic_users` table definition to the main schema
- Added RLS policies for the `basic_users` table
- Updated the `handle_new_user()` function to create both profile and basic user records

### 2. Updated Auth Service (`supabase-auth-service.js`)
- Added fallback logic to create basic user records if the database trigger fails
- Enhanced error handling for basic user creation

### 3. Created Fix Script (`fix-basic-user-registration.sql`)
- Comprehensive script to update existing databases
- Creates missing basic user records for existing users
- Updates the trigger function
- Provides verification queries

### 4. Created Test Page (`test-basic-user-registration.html`)
- Interactive test page to verify the fix is working
- Allows testing new user signups
- Shows basic user records in the database

## Files Modified

1. **`supabase-schema.sql`**
   - Added `basic_users` table definition
   - Added RLS policies for `basic_users`
   - Updated `handle_new_user()` function

2. **`supabase-auth-service.js`**
   - Added fallback basic user creation logic
   - Enhanced error handling

3. **`fix-basic-user-registration.sql`** (NEW)
   - Complete fix script for existing databases

4. **`test-basic-user-registration.html`** (NEW)
   - Test page to verify the fix

## How to Apply the Fix

### For New Installations
1. Run the updated `supabase-schema.sql` in your Supabase SQL editor
2. The fix will be automatically applied for all new users

### For Existing Installations
1. Run the `fix-basic-user-registration.sql` script in your Supabase SQL editor
2. This will:
   - Create the `basic_users` table if it doesn't exist
   - Update the `handle_new_user()` function
   - Create basic user records for existing users
   - Show verification results

### Testing the Fix
1. Open `test-basic-user-registration.html` in your browser
2. Try creating a new test account
3. Verify that a basic user record is created in the database

## Expected Behavior After Fix

When a new user signs up:
1. ✅ User is created in `auth.users` (Supabase Auth)
2. ✅ Profile is created in `profiles` table (via trigger)
3. ✅ Basic user record is created in `basic_users` table (via trigger)
4. ✅ User is marked as a permanent basic user (`expires_at = NULL`)

## Verification Queries

After applying the fix, you can run these queries to verify everything is working:

```sql
-- Check total counts
SELECT 
    'Total auth users' as metric,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Total basic users' as metric,
    COUNT(*) as count
FROM basic_users
UNION ALL
SELECT 
    'Total profiles' as metric,
    COUNT(*) as count
FROM profiles;

-- Check recent basic users
SELECT 
    id,
    email,
    created_at,
    expires_at,
    is_active,
    CASE 
        WHEN expires_at IS NULL THEN 'Permanent Basic User'
        WHEN expires_at > NOW() THEN 'Temporary Basic User (Active)'
        ELSE 'Temporary Basic User (Expired)'
    END as user_status
FROM basic_users 
ORDER BY created_at DESC
LIMIT 10;
```

## Notes

- All new users will be created as **permanent basic users** by default
- The `expires_at` field will be `NULL` for permanent basic users
- Existing users will be retroactively created as permanent basic users
- The fix includes both database-level (trigger) and application-level (auth service) solutions for redundancy
