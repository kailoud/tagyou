# Added Member Sign-In Logic

## ✅ **New Logic: Added Members Must Sign In**

### **🔄 What Changed:**

#### **Before:**
- Basic users could add squad members indefinitely
- Added members were just data entries
- No sign-in requirement for added members

#### **After:**
- **Permanent basic user (adder)** → Can add squad members
- **Added member** → Must sign in from their own mobile to become permanent basic user
- **After 1 hour** → Added member deleted if they haven't signed in
- **If added member signs in** → Becomes permanent basic user

### **🎯 New User Flow:**

#### **Permanent Basic User (Adder):**
1. **Signs in** → Becomes permanent basic user
2. **Adds squad member** → Member gets 1-hour expiration
3. **Added member gets notification** → Must sign in to become permanent
4. **After 1 hour** → Added member deleted if not signed in

#### **Added Member:**
1. **Gets added by someone** → Receives 1-hour expiration
2. **Must sign in from own mobile** → To become permanent basic user
3. **If signs in within 1 hour** → Becomes permanent basic user
4. **If doesn't sign in** → Gets deleted after 1 hour

### **🔧 Technical Implementation:**

#### **Database Schema:**
```sql
-- New columns in carnival_squad_members
expires_at TIMESTAMP WITH TIME ZONE NULL, -- 1 hour for added members
member_type VARCHAR(50) DEFAULT 'added', -- 'added' or 'permanent'
added_by_email VARCHAR(255), -- Who added them
needs_signin BOOLEAN DEFAULT true, -- Whether they need to sign in
signed_in_at TIMESTAMP WITH TIME ZONE -- When they signed in
```

#### **JavaScript Logic:**
```javascript
// When adding squad member
{
  expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
  member_type: 'added',
  added_by_email: this.currentUser.email,
  needs_signin: true
}

// When added member signs in
await this.handleAddedMemberSignIn(email);
```

#### **Authentication Flow:**
```javascript
// Check if current user was added as squad member
async checkIfAddedMember() {
  // If user was added, convert them to permanent basic user
  await this.handleAddedMemberSignIn(this.currentUser.email);
}
```

### **📊 Database Functions:**

#### **Updated Functions:**
- `cleanup_expired_squad_members()` - Only deletes added members who haven't signed in
- `extend_squad_member_expiration()` - Extends time for added members to sign in
- `is_squad_member_expired()` - Checks if added member expired

#### **Cleanup Logic:**
```sql
-- Only delete added members who haven't signed in
DELETE FROM carnival_squad_members 
WHERE expires_at IS NOT NULL 
AND expires_at < NOW()
AND member_type = 'added'
AND needs_signin = true;
```

### **🎯 Benefits:**

#### **For Permanent Basic Users (Adders):**
- ✅ **Can add squad members** - Limited but functional
- ✅ **Clear upgrade incentive** - Premium removes restrictions
- ✅ **Automatic cleanup** - No manual management needed
- ✅ **Temporary tracking** - Can track for 1 hour periods

#### **For Added Members:**
- ✅ **Must sign in to become permanent** - Clear onboarding path
- ✅ **1-hour grace period** - Time to sign in
- ✅ **Becomes permanent basic user** - After signing in
- ✅ **Own account** - Independent from adder

#### **For System:**
- ✅ **Database efficiency** - Automatic cleanup prevents bloat
- ✅ **Clear user journey** - Sign-in requirement creates engagement
- ✅ **Upgrade motivation** - Clear value proposition
- ✅ **Scalable solution** - Handles both user types

### **🔍 Testing:**

#### **Global Methods Available:**
```javascript
// Handle added member sign-in
window.handleAddedMemberSignIn('user@example.com');

// Check if current user was added as member
window.checkIfAddedMember();

// Force cleanup of expired added members
window.forceSquadCleanup();

// Check current user state
console.log('Premium:', window.carnivalTracker.isPremium);
console.log('Squad members:', window.carnivalTracker.people.length);
```

#### **Expected Behavior:**
- **Permanent basic users** → Can add squad members
- **Added members** → Must sign in within 1 hour
- **Sign-in process** → Converts added member to permanent basic user
- **Automatic cleanup** → Deletes unsigned added members

### **📝 User Scenarios:**

#### **Scenario 1: Permanent Basic User Adds Member**
1. **Permanent basic user signs in** → Can add squad members
2. **Adds squad member** → Member gets 1-hour expiration
3. **Added member gets notification** → Must sign in to become permanent
4. **After 1 hour** → Added member deleted if not signed in

#### **Scenario 2: Added Member Signs In**
1. **Added member receives notification** → Has 1 hour to sign in
2. **Signs in from own mobile** → Becomes permanent basic user
3. **Squad member record updated** → No longer expires
4. **Can now add their own squad members** → Independent user

#### **Scenario 3: Added Member Doesn't Sign In**
1. **Added member gets 1-hour expiration** → Must sign in quickly
2. **Doesn't sign in within 1 hour** → Gets automatically deleted
3. **Permanent basic user can add again** → New member with new expiration
4. **No data loss** - Only temporary entries deleted

### **🎯 Summary:**

The added member sign-in system now provides:
- ✅ **Clear user journey** - Added members must sign in
- ✅ **Automatic management** - No manual cleanup needed
- ✅ **User engagement** - Sign-in requirement creates activity
- ✅ **Data preservation** - Only temporary entries deleted
- ✅ **Scalable solution** - Handles both user types efficiently

This creates a compelling user onboarding experience while maintaining system efficiency!
