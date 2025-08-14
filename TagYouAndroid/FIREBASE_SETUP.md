# Firebase Setup Guide for TagYou Android App

## 🚀 Quick Setup

Follow these steps to get Firebase working with your TagYou Android app:

## **Step 1: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it "tagyou-festival-tracker"
4. Enable Google Analytics (optional)
5. Click "Create project"

## **Step 2: Add Android App to Firebase**

1. In Firebase Console, click "Add app" → "Android"
2. Package name: `com.tagyou.festivaltracker`
3. App nickname: "TagYou"
4. Click "Register app"
5. Download `google-services.json`
6. Place it in `app/google-services.json`

## **Step 3: Enable Firebase Services**

### **Authentication**
1. Go to Authentication → Sign-in method
2. Enable "Email/Password"
3. Enable "Google" (add your SHA-1 fingerprint)

### **Firestore Database**
1. Go to Firestore Database
2. Click "Create database"
3. Start in test mode
4. Choose a location close to your users

### **Cloud Storage** (optional)
1. Go to Storage
2. Click "Get started"
3. Start in test mode

### **Cloud Messaging**
1. Go to Cloud Messaging
2. This is automatically enabled

## **Step 4: Get SHA-1 Fingerprint**

Run this command to get your SHA-1 fingerprint:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Add this SHA-1 to your Firebase project for Google Sign-In.

## **Step 5: Build and Test**

1. Sync your project in Android Studio
2. Build the app: `./gradlew build`
3. Run on device/emulator

## **Step 6: Test Firebase Features**

### **Authentication Test**
- Try registering a new account
- Test login with the created account
- Test Google Sign-In (if configured)

### **Location Tracking Test**
- Grant location permissions
- Check Firestore for location updates
- Verify real-time updates

### **Database Structure**

The app will create these Firestore collections:

#### `user_profiles`
```json
{
  "userId": "string",
  "email": "string", 
  "displayName": "string",
  "full_name": "string",
  "avatarUrl": "string",
  "isProUser": "boolean",
  "is_admin": "boolean",
  "createdAt": "timestamp",
  "lastActive": "timestamp"
}
```

#### `user_locations`
```json
{
  "userId": "string",
  "displayName": "string",
  "latitude": "number",
  "longitude": "number", 
  "accuracy": "number",
  "timestamp": "timestamp",
  "lastUpdated": "string"
}
```

#### `groups`
```json
{
  "groupId": "string",
  "name": "string",
  "description": "string",
  "createdBy": "string",
  "createdAt": "timestamp",
  "isActive": "boolean"
}
```

#### `group_members`
```json
{
  "groupId": "string",
  "userId": "string",
  "displayName": "string",
  "joinedAt": "timestamp",
  "isAdmin": "boolean"
}
```

#### `food_stalls`
```json
{
  "name": "string",
  "description": "string",
  "latitude": "number",
  "longitude": "number",
  "image_url": "string",
  "category": "string"
}
```

#### `float_trucks`
```json
{
  "name": "string", 
  "description": "string",
  "latitude": "number",
  "longitude": "number",
  "image_url": "string",
  "route": "string"
}
```

## **Step 7: Security Rules**

Set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles - users can read/write their own profile
    match /user_profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User locations - users can read/write their own location
    match /user_locations/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Groups - authenticated users can read, group admins can write
    match /groups/{groupId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Group members - authenticated users can read/write
    match /group_members/{memberId} {
      allow read, write: if request.auth != null;
    }
    
    // Food stalls and float trucks - public read, admin write
    match /food_stalls/{stallId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /float_trucks/{truckId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## **Step 8: Push Notifications**

To send push notifications:

1. Go to Cloud Messaging in Firebase Console
2. Click "Send your first message"
3. Configure your notification
4. Target specific users or topics

## **Troubleshooting**

### Common Issues:

1. **Build Errors:**
   - Make sure `google-services.json` is in the correct location
   - Verify all dependencies are synced
   - Check that Firebase plugin is applied

2. **Authentication Issues:**
   - Verify SHA-1 fingerprint is added to Firebase
   - Check that Authentication is enabled
   - Ensure Google Services plugin is applied

3. **Database Issues:**
   - Check Firestore rules
   - Verify database is created
   - Check network connectivity

4. **Location Not Working:**
   - Check device location settings
   - Verify location permissions are granted
   - Test on a physical device

## **Next Steps**

Once Firebase is working:

1. **Add Real Data**: Populate Firestore with actual food stalls and float trucks
2. **Test Multi-User**: Have multiple devices test location sharing
3. **Implement Groups**: Add group creation and management
4. **Add Notifications**: Implement friend location alerts
5. **Deploy**: Prepare for Google Play Store release

---

**Happy coding! 🎉**





