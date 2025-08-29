# Basic User Logic Update

## ✅ **Updated Logic: Permanent Basic Users**

### **🔄 What Changed:**

#### **Before (1-Hour Expiration):**
- Basic users automatically deleted after 1 hour
- Squad members deleted when user expires
- Aggressive cleanup every 5 minutes

#### **After (Permanent Basic Users):**
- Basic users remain indefinitely until they upgrade to premium
- Squad members preserved for basic users
- No automatic deletion of basic users
- Only cleanup for users with explicit expiration dates

### **🎯 New User Flow:**

#### **Basic User Registration:**
1. **User signs up** → Added to `basic_users` table with `expires_at = NULL`
2. **User adds squad members** → Stored in `carnival_squad_members` table
3. **User remains basic** → No automatic expiration or deletion
4. **User can upgrade anytime** → Move to premium table, preserve squad members

#### **Premium User Upgrade:**
1. **User upgrades** → Removed from `basic_users`, added to `premium_users`
2. **Squad members preserved** → No data loss during upgrade
3. **Unlimited access** → No expiration, no automatic cleanup

### **🔧 Technical Changes:**

#### **Database Schema:**
```sql
-- expires_at is now NULL for permanent basic users
expires_at TIMESTAMP WITH TIME ZONE NULL, -- NULL = permanent basic user
```

#### **JavaScript Logic:**
```javascript
// No automatic cleanup for basic users
async setupBasicUserCleanup() {
  // Only check current user status on page load
  await this.checkUserExpiration();
}

// Only cleanup users with explicit expiration dates
async cleanupExpiredBasicUsers() {
  // Only find users with expires_at IS NOT NULL
  .not('expires_at', 'is', null)
}
```

#### **User Creation:**
```javascript
// Basic users created with no expiration
await this.addUserToBasicTable(email) {
  expires_at: null, // Permanent basic user
  last_activity: new Date().toISOString()
}
```

### **📊 Database Functions:**

#### **Updated Functions:**
- `cleanup_expired_basic_users()` - Only cleans users with expiration dates
- `extend_basic_user_expiration()` - Only works for users with expiration dates
- `is_basic_user_active()` - Returns true for permanent basic users

#### **New Logic:**
```sql
-- Check if user is basic and active (permanent or not expired)
WHERE email = user_email 
AND is_active = true
AND (expires_at IS NULL OR expires_at > NOW())
```

### **🎯 Benefits:**

#### **For Users:**
- **No data loss** - Squad members preserved indefinitely
- **No time pressure** - Can use basic features without expiration
- **Flexible upgrade** - Can upgrade to premium anytime
- **Stable experience** - No unexpected deletions

#### **For System:**
- **Reduced complexity** - No aggressive cleanup needed
- **Better user retention** - Users don't lose data
- **Simpler logic** - Clear distinction between basic and premium
- **Database efficiency** - Less frequent cleanup operations

### **🔍 Testing:**

#### **Global Methods Available:**
```javascript
// Upgrade user to premium
window.upgradeUserToPremium('user@example.com');

// Downgrade user to basic (permanent)
window.downgradeUserToBasic('user@example.com');

// Check current user state
console.log('Premium:', window.carnivalTracker.isPremium);
console.log('Tier:', window.carnivalTracker.userTier);
```

#### **Expected Behavior:**
- **Basic users** → Stay basic indefinitely
- **Squad members** → Preserved for basic users
- **Upgrade process** → Seamless transition to premium
- **No automatic deletion** → Users control their own destiny

### **📝 Summary:**

The basic user system now provides a **permanent basic tier** where users can:
- ✅ Use basic features indefinitely
- ✅ Keep their squad members forever
- ✅ Upgrade to premium anytime
- ✅ Never lose data due to expiration

This creates a more user-friendly experience while maintaining the premium upgrade incentive!
