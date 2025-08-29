# Squad Member Expiration Logic

## ✅ **New Logic: Squad Members Expire for Basic Users**

### **🔄 What Changed:**

#### **Before:**
- Basic users could add squad members indefinitely
- No expiration for squad members
- All squad members were permanent

#### **After:**
- **Basic users** → Squad members expire after 1 hour
- **Premium users** → Squad members are permanent (no expiration)
- **Automatic cleanup** → Expired squad members deleted every 5 minutes
- **Upgrade benefit** → Squad members preserved when upgrading to premium

### **🎯 New User Flow:**

#### **Basic User Adding Squad Member:**
1. **User adds squad member** → Member gets `expires_at = 1 hour from now`
2. **After 1 hour** → Squad member automatically deleted
3. **User can add again** → New member gets another 1-hour expiration
4. **User upgrades to premium** → All existing squad members become permanent

#### **Premium User Adding Squad Member:**
1. **User adds squad member** → Member gets `expires_at = NULL` (permanent)
2. **Squad member stays forever** → No automatic deletion
3. **Unlimited squad members** → No expiration concerns

### **🔧 Technical Implementation:**

#### **Database Schema:**
```sql
-- Added to carnival_squad_members table
expires_at TIMESTAMP WITH TIME ZONE NULL, -- NULL = permanent, timestamp = expires
```

#### **JavaScript Logic:**
```javascript
// When adding squad member
expires_at: this.isPremium ? null : new Date(Date.now() + 60 * 60 * 1000).toISOString()

// Automatic cleanup every 5 minutes
async cleanupExpiredSquadMembers() {
  // Delete squad members with expires_at < NOW()
}
```

#### **User Experience:**
```javascript
// Basic user adds member
console.log('⏰ Squad member will expire in 1 hour (basic user)');

// Premium user adds member  
console.log('✅ Squad member is permanent (premium user)');
```

### **📊 Database Functions:**

#### **New Functions:**
- `cleanup_expired_squad_members()` - Deletes expired squad members
- `extend_squad_member_expiration(member_id)` - Extends expiration by 1 hour
- `is_squad_member_expired(member_id)` - Checks if member is expired

#### **Cleanup Logic:**
```sql
-- Only delete squad members with expiration dates
DELETE FROM carnival_squad_members 
WHERE expires_at IS NOT NULL 
AND expires_at < NOW();
```

### **🎯 Benefits:**

#### **For Basic Users:**
- ✅ **Can still add squad members** - Limited but functional
- ✅ **Clear upgrade incentive** - Premium removes expiration
- ✅ **Automatic cleanup** - No manual management needed
- ✅ **Temporary tracking** - Can track for 1 hour periods

#### **For Premium Users:**
- ✅ **Permanent squad members** - No expiration concerns
- ✅ **Unlimited members** - No restrictions
- ✅ **Preserved data** - Squad members from basic tier kept
- ✅ **Better experience** - No time pressure

#### **For System:**
- ✅ **Database efficiency** - Automatic cleanup prevents bloat
- ✅ **Clear tier distinction** - Basic vs Premium benefits
- ✅ **Upgrade motivation** - Clear value proposition
- ✅ **Scalable solution** - Handles both user types

### **🔍 Testing:**

#### **Global Methods Available:**
```javascript
// Force cleanup of expired squad members
window.forceSquadCleanup();

// Extend squad member expiration
window.extendSquadMemberExpiration('member-id');

// Check current user state
console.log('Premium:', window.carnivalTracker.isPremium);
console.log('Squad members:', window.carnivalTracker.people.length);
```

#### **Expected Behavior:**
- **Basic users** → Squad members expire after 1 hour
- **Premium users** → Squad members are permanent
- **Upgrade process** → Existing squad members preserved
- **Automatic cleanup** → Runs every 5 minutes

### **📝 User Scenarios:**

#### **Scenario 1: Basic User**
1. **Adds squad member** → Member expires in 1 hour
2. **Uses for 1 hour** → Member automatically deleted
3. **Adds again** → New member with 1-hour expiration
4. **Upgrades to premium** → All future members permanent

#### **Scenario 2: Premium User**
1. **Adds squad member** → Member is permanent
2. **Uses indefinitely** → Member never expires
3. **Adds unlimited members** → All permanent
4. **No time pressure** → Full functionality

#### **Scenario 3: Upgrade Path**
1. **Basic user adds members** → Members expire after 1 hour
2. **User upgrades to premium** → Existing members become permanent
3. **Future members** → All permanent
4. **No data loss** → Seamless transition

### **🎯 Summary:**

The squad member expiration system now provides:
- ✅ **Clear tier benefits** - Basic vs Premium
- ✅ **Automatic management** - No manual cleanup needed
- ✅ **Upgrade motivation** - Clear value proposition
- ✅ **Data preservation** - No loss during upgrades
- ✅ **Scalable solution** - Handles both user types efficiently

This creates a compelling upgrade path while maintaining functionality for basic users!
