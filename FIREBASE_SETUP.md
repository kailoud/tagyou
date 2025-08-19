# Firebase Setup Guide for TagYou2

This guide will help you set up Firebase for your TagYou2 London Map project.

## Prerequisites

- A Google account
- Node.js installed on your system
- Firebase CLI (optional, for advanced features)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "tagyou2-london-map")
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project console, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose the closest to your users)
5. Click "Done"

## Step 3: Get Your Firebase Configuration

1. In the Firebase console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Enter an app nickname (e.g., "TagYou2 Web App")
6. Click "Register app"
7. Copy the configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Step 4: Update Your Configuration

1. Open `firebase-config.js` in your project
2. Replace the placeholder configuration with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-actual-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-actual-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## Step 5: Set Up Firestore Security Rules

1. In the Firebase console, go to Firestore Database
2. Click the "Rules" tab
3. Replace the default rules with these development rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all documents
    match /{document=**} {
      allow read: if true;
      allow write: if true; // For development only
    }
  }
}
```

**⚠️ Important:** These rules allow full access for development. For production, you should implement proper authentication and authorization rules.

## Step 6: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to your app
3. Open the browser's developer console (F12)
4. You should see messages like:
   - "Loading data from Firebase..."
   - "Loaded food stalls: X"
   - "Loaded artists: X"
   - "Default data initialization complete!"

## Step 7: Verify Data in Firebase Console

1. Go to your Firebase console
2. Click "Firestore Database"
3. You should see collections created:
   - `foodStalls` - Contains food stall data
   - `artists` - Contains artist data
   - `userFavorites` - Will contain user favorites (when users interact)

## Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/unauthorized-domain)"**
   - Go to Firebase Console → Project Settings → Authorized domains
   - Add your domain (e.g., `localhost` for development)

2. **"Firebase: Error (auth/invalid-api-key)"**
   - Double-check your API key in `firebase-config.js`
   - Make sure you copied the entire configuration object

3. **"Firebase: Error (permission-denied)"**
   - Check your Firestore security rules
   - Make sure they allow read/write access for development

4. **Module import errors**
   - Make sure you're serving the files through a web server (not opening HTML directly)
   - Use `npm run dev` or `live-server`

### Development vs Production

For development:
- Use test mode security rules
- Allow all read/write operations
- Use localhost as authorized domain

For production:
- Implement proper authentication
- Set up restrictive security rules
- Add your production domain to authorized domains
- Enable Firebase Authentication if needed

## Next Steps

Once Firebase is working:

1. **Add Authentication**: Implement user login/signup
2. **Improve Security Rules**: Add proper authorization
3. **Add Real-time Features**: Implement live updates
4. **Add Offline Support**: Enable offline data persistence
5. **Add Analytics**: Track user behavior and app performance

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Firebase configuration
3. Check the Firebase console for any error logs
4. Ensure your security rules are correct

For more help, refer to the [Firebase Documentation](https://firebase.google.com/docs).
