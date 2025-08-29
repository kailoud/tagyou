# Correct Added Person Logic

## ✅ **Correct Logic: Added Persons Expire After 1 Hour**

### **🔄 The Correct Flow:**

#### **1. Permanent Basic User (Adder):**
- **Signs in** → Becomes permanent basic user
- **Adds someone to squad** → Added person gets 1-hour expiration
- **Can add multiple people** → Each gets 1-hour expiration

#### **2. Added Person:**
- **Gets added to squad** → Receives 1-hour expiration
- **Signs up** → Becomes permanent basic user (but still expires from squad)
- **After 1 hour** → Gets deleted from squad (even though they already signed up)

#### **3. Premium Upgrade:**
- **Any permanent basic user upgrades** → Gets premium authority
- **Premium users** → Can add unlimited permanent squad members

### **🎯 Key Points:**

#### **✅ What Happens:**
- **Added persons expire after 1 hour** → Even though they already signed up
- **Sign-up doesn't prevent expiration** → They still get deleted from squad
- **Permanent basic users stay** → Only added persons expire
- **Upgrading gives premium authority** → Can add permanent members

#### **❌ What Doesn't Happen:**
- **Added persons don't become permanent in squad** → They always expire
- **Sign-up doesn't save them from expiration** → Still deleted after 1 hour
- **Permanent basic users don't expire** → Only added persons do

### **🔧 Technical Implementation:**

#### **Database Schema:**
```sql
-- Member types in carnival_squad_members
member_type: 'added'     -- Just added, hasn't signed up
member_type: 'signed_up' -- Added and signed up, but still expires
member_type: 'permanent' -- Permanent member (premium users only)
```

#### **JavaScript Logic:**
```javascript
// When adding squad member
{
  expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
  member_type: 'added',
  needs_signin: true
}

// When added person signs up
{
  member_type: 'signed_up', // Still expires after 1 hour
  needs_signin: false,
  signed_in_at: new Date().toISOString()
  // expires_at stays the same - still expires
}
```

#### **Cleanup Logic:**
```sql
-- Delete all added persons after 1 hour (whether they signed up or not)
DELETE FROM carnival_squad_members 
WHERE expires_at < NOW()
AND member_type IN ('added', 'signed_up');
```

### **📊 User Scenarios:**

#### **Scenario 1: Basic User Adds Someone**
1. **Basic user signs in** → Permanent basic user
2. **Adds squad member** → Member gets 1-hour expiration
3. **Added person signs up** → Becomes permanent basic user (but still expires from squad)
4. **After 1 hour** → Added person deleted from squad (even though they signed up)
5. **Basic user can add again** → New member with new expiration

#### **Scenario 2: Premium User Adds Someone**
1. **Premium user signs in** → Has premium authority
2. **Adds squad member** → Member is permanent (no expiration)
3. **Added person signs up** → Becomes permanent basic user
4. **Member stays forever** → No expiration for premium users

#### **Scenario 3: Basic User Upgrades to Premium**
1. **Basic user has squad members** → All expire after 1 hour
2. **User upgrades to premium** → Gets premium authority
3. **Can add permanent members** → No more expiration
4. **Existing members still expire** → Only new ones are permanent

### **🎯 Benefits:**

#### **For Basic Users:**
- ✅ **Can add temporary squad members** → 1-hour tracking
- ✅ **Clear upgrade incentive** → Premium removes expiration
- ✅ **Automatic cleanup** → No manual management
- ✅ **Temporary tracking** → Perfect for short events

#### **For Added Persons:**
- ✅ **Must sign up to become permanent basic user** → Clear onboarding
- ✅ **1-hour grace period** → Time to sign up (but they have already signed up)
- ✅ **Independent account** → Separate from adder
- ✅ **Still expires from squad** → Keeps system clean

#### **For Premium Users:**
- ✅ **Permanent squad members** → No expiration
- ✅ **Unlimited members** → No restrictions
- ✅ **Premium authority** → Can manage permanent members

### **🔍 Testing:**

#### **Global Methods:**
```javascript
// Handle added person sign-up
window.handleAddedPersonSignUp('user@example.com');

// Force cleanup of expired added persons
window.forceSquadCleanup();

// Check current user state
console.log('Premium:', window.carnivalTracker.isPremium);
console.log('Squad members:', window.carnivalTracker.people.length);
```

### **📝 Summary:**

The correct logic ensures:
- ✅ **Added persons always expire after 1 hour**
- ✅ **Sign-up doesn't prevent expiration**
- ✅ **Permanent basic users stay permanent**
- ✅ **Premium upgrade gives authority**
- ✅ **Clean system with automatic cleanup**

This creates a clear distinction between temporary and permanent squad members! 🎉
