# User Tier System - Clarified

## User Hierarchy & Permissions

### 🎯 **Permanent Basic User**
- **Default tier** for new signups
- **Can add:** 1 Permanent Basic User
- **Cannot add:** Premium Users or Temporary Users
- **Status:** Permanent (no expiration)

### ⭐ **Premium User** 
- **Upgraded from:** Permanent Basic User
- **Can add:** Unlimited users (any type)
- **Status:** Permanent (no expiration)

## How It Works

### New User Signup Flow:
1. **User signs up** → Automatically becomes **Permanent Basic User**
2. **Permanent Basic User** can add **1 Permanent Basic User**
3. **Premium User** can add **unlimited users** (any type)

### User Addition Rules:
- **Permanent Basic User** → Can only add **Permanent Basic Users**
- **Premium User** → Can add **any type of user** (unlimited)

## Database Structure

### `user_tiers` Table:
```sql
-- Permanent Basic User
tier_type: 'basic'
tier_status: 'permanent'
max_users_can_add: 1
users_added_count: 0 (increments when adding users)

-- Premium User  
tier_type: 'premium'
tier_status: 'permanent'
max_users_can_add: 999999 (unlimited)
users_added_count: 0 (increments when adding users)
```

### `user_relationships` Table:
```sql
-- Tracks who added whom
added_by_user_id: UUID (who added the user)
added_user_id: UUID (who was added)
relationship_type: 'permanent' (always permanent for this system)
```

## Key Functions

### 1. **Add New User** (`add_new_user`)
- Checks user's tier and current count
- **Permanent Basic User:** Limited to 1 addition
- **Premium User:** Unlimited additions
- **Always creates:** Permanent Basic User (regardless of who adds them)

### 2. **Upgrade to Premium** (`upgrade_user_to_premium`)
- Converts Permanent Basic User to Premium User
- Updates `max_users_can_add` to unlimited
- Records upgrade timestamp

### 3. **Check Permissions** (`get_user_permissions`)
- Returns current user's tier information
- Shows how many users they can still add
- Indicates what type of users they can add

## Visual Indicators

### Tier Badges:
- 🔵 **BASIC** - Permanent Basic User
- 🟡 **PREMIUM** - Premium User

### Permission Display:
- **Permanent Basic User:** "Can Add: 1 Permanent Basic User"
- **Premium User:** "Can Add: Unlimited Users"

## Example Scenarios

### Scenario 1: New User
1. John signs up → Becomes **Permanent Basic User**
2. John can add **1 Permanent Basic User**
3. John adds Sarah → Sarah becomes **Permanent Basic User**
4. John cannot add more users (limit reached)

### Scenario 2: Premium Upgrade
1. John upgrades to **Premium User**
2. John can now add **unlimited users**
3. John adds multiple users → All become **Permanent Basic Users**
4. No limit on additions

### Scenario 3: User Chain
1. Premium User adds Basic User A
2. Basic User A adds Basic User B (1/1 used)
3. Basic User A cannot add more users
4. Premium User can continue adding unlimited users

## Important Notes

- **All new users** (whether added by Basic or Premium users) become **Permanent Basic Users**
- **Only Premium Users** can add unlimited users
- **Permanent Basic Users** are limited to exactly **1 addition**
- **No temporary users** in this system - all users are permanent
- **Upgrade path** is one-way: Basic → Premium (no downgrade)

## Testing

Use `test-user-tier-system.html` to:
- Create test accounts
- Verify tier assignments
- Test user addition limits
- Upgrade users to premium
- View user relationships and permissions
