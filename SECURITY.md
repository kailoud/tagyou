# Security Guide - Firebase Configuration

## 🔒 **IMPORTANT: Never Expose API Keys**

This guide explains how to securely handle Firebase configuration without exposing sensitive credentials.

## 🚨 **What NOT to Do**

❌ **Never commit API keys to version control**
❌ **Never share Firebase config in public repositories**
❌ **Never hardcode credentials in your code**

## ✅ **Secure Setup Process**

### Step 1: Create Your Secret Configuration File

1. Copy the template file:
   ```bash
   cp firebase-config-secret.template.js firebase-config-secret.js
   ```

2. Edit `firebase-config-secret.js` with your actual Firebase credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-actual-api-key-here",
     authDomain: "your-project-name.firebaseapp.com",
     projectId: "your-project-name",
     storageBucket: "your-project-name.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456"
   };
   ```

### Step 2: Verify .gitignore is Working

The following files should be ignored by Git:
- `firebase-config-secret.js`
- `firebase.env`
- `.env`

Check with:
```bash
git status
```

You should NOT see these files in the output.

### Step 3: Test Your Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Check the browser console for:
   - ✅ "Firebase configuration loaded from secret file"
   - ✅ "Firebase initialized successfully"

## 🔧 **For Production Deployment**

### Option 1: Environment Variables (Recommended)

Set environment variables on your hosting platform:

```bash
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

### Option 2: Firebase Hosting

If using Firebase Hosting, the configuration is automatically handled.

## 🛡️ **Additional Security Measures**

### 1. Firebase Security Rules

Set up proper Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all documents
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users
    }
  }
}
```

### 2. API Key Restrictions

In Firebase Console:
1. Go to Project Settings
2. Under "General" tab, find your API key
3. Click "Restrict key"
4. Add restrictions:
   - HTTP referrers (websites)
   - API restrictions (Firebase services only)

### 3. Domain Restrictions

Add your domains to authorized domains in Firebase Console:
1. Go to Authentication → Settings
2. Add your domains to "Authorized domains"

## 🚨 **If You Accidentally Exposed Credentials**

1. **Immediately rotate your API keys** in Firebase Console
2. **Remove the commit** from Git history:
   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch firebase-config-secret.js' \
   --prune-empty --tag-name-filter cat -- --all
   ```
3. **Force push** to remove from remote repository
4. **Create new API keys** and update your configuration

## 📋 **Checklist**

- [ ] Created `firebase-config-secret.js` from template
- [ ] Added actual Firebase credentials to secret file
- [ ] Verified `.gitignore` excludes secret files
- [ ] Tested that app works with Firebase
- [ ] Set up Firebase security rules
- [ ] Restricted API key usage
- [ ] Added domain restrictions

## 🆘 **Need Help?**

If you encounter issues:
1. Check browser console for error messages
2. Verify your Firebase configuration is correct
3. Ensure secret file is in the right location
4. Check that `.gitignore` is working properly

Remember: **Security first, always!** 🔒
