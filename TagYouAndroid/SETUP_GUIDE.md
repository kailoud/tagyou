# TagYou Android App Setup Guide

## 🚀 Quick Start

Follow these steps to get your TagYou Android app running:

## **Step 1: Firebase Setup**

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it "tagyou-festival-tracker"
4. Enable Google Analytics (optional)
5. Click "Create project"

### 1.2 Add Android App
1. In Firebase Console, click "Add app" → "Android"
2. Package name: `com.tagyou.festivaltracker`
3. App nickname: "TagYou"
4. Click "Register app"
5. Download `google-services.json`
6. Replace the placeholder file in `app/google-services.json`

### 1.3 Enable Firebase Services
1. **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
   - Enable "Google" (add your SHA-1 fingerprint)

2. **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Start in test mode
   - Choose a location close to your users

3. **Cloud Storage** (optional):
   - Go to Storage
   - Click "Get started"
   - Start in test mode

4. **Cloud Messaging**:
   - Go to Cloud Messaging
   - This is automatically enabled

## **Step 2: Google Maps Setup**

### 2.1 Get API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Maps SDK for Android"
4. Go to Credentials → Create Credentials → API Key
5. Copy the API key

### 2.2 Add API Key to App
1. Open `app/src/main/AndroidManifest.xml`
2. Replace `YOUR_MAPS_API_KEY` with your actual API key:
   ```xml
   <meta-data
       android:name="com.google.android.geo.API_KEY"
       android:value="YOUR_ACTUAL_API_KEY_HERE" />
   ```

## **Step 3: Build and Run**

### 3.1 Sync Project
1. In Android Studio, click "Sync Project with Gradle Files"
2. Wait for all dependencies to download

### 3.2 Run on Device/Emulator
1. Connect an Android device or start an emulator
2. Click the "Run" button (green play icon)
3. Select your device/emulator
4. Wait for the app to install and launch

## **Step 4: Test the App**

### 4.1 Authentication Test
1. App should open to login screen
2. Try registering a new account
3. Test login with the created account
4. Test Google Sign-In (if configured)

### 4.2 Location Tracking Test
1. Grant location permissions when prompted
2. Open the map
3. Verify your location appears
4. Check that location updates in real-time

### 4.3 Background Service Test
1. Minimize the app
2. Check notification bar for "TagYou Location Tracking"
3. Verify location continues updating in background

## **Step 5: Firebase Database Structure**

The app expects these Firestore collections:

### `user_profiles`
```json
{
  "userId": "string",
  "email": "string", 
  "displayName": "string",
  "avatarUrl": "string",
  "isProUser": "boolean",
  "createdAt": "timestamp",
  "lastActive": "timestamp"
}
```

### `user_locations`
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

### `food_stalls`
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

### `float_trucks`
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

## **Troubleshooting**

### Common Issues:

1. **Build Errors**:
   - Make sure all dependencies are synced
   - Check that `google-services.json` is in the correct location
   - Verify API keys are properly configured

2. **Location Not Working**:
   - Check device location settings
   - Verify location permissions are granted
   - Test on a physical device (emulator location may not work)

3. **Firebase Connection Issues**:
   - Verify internet connection
   - Check Firebase project settings
   - Ensure Firestore rules allow read/write

4. **Google Sign-In Not Working**:
   - Add SHA-1 fingerprint to Firebase project
   - Verify Google Services plugin is applied
   - Check OAuth client configuration

### Getting SHA-1 Fingerprint:
```bash
# For debug builds
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# For release builds (if you have a keystore)
keytool -list -v -keystore your-keystore.jks -alias your-alias
```

## **Next Steps**

Once the basic app is working:

1. **Add Real Data**: Populate Firestore with actual food stalls and float trucks
2. **Test Multi-User**: Have multiple devices test location sharing
3. **Customize UI**: Modify colors, icons, and layouts as needed
4. **Add Features**: Implement groups, notifications, and admin features
5. **Deploy**: Prepare for Google Play Store release

## **Support**

If you encounter issues:
1. Check the Android Studio logcat for error messages
2. Verify all configuration steps are completed
3. Test on a physical device
4. Check Firebase Console for any service issues

---

**Happy coding! 🎉**
