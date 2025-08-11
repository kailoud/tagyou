# TagYou Android App - Supabase Setup Guide

## 🚀 Quick Start with Supabase

Follow these steps to get your TagYou Android app running with Supabase:

## **Step 1: Supabase Project Setup**

### 1.1 Create Supabase Project
1. Go to [Supabase Console](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name:** `tagyou-festival-tracker`
   - **Database Password:** Choose a strong password
   - **Region:** Choose closest to your users
5. Click "Create new project"

### 1.2 Get Project Credentials
1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key
3. Update `SupabaseClient.kt` with your credentials:
   ```kotlin
   private const val SUPABASE_URL = "YOUR_PROJECT_URL"
   private const val SUPABASE_ANON_KEY = "YOUR_ANON_KEY"
   ```

## **Step 2: Database Setup**

### 2.1 Run Database Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `supabase_schema.sql`
3. Click "Run" to create all tables and policies

### 2.2 Verify Tables Created
Check that these tables exist in **Table Editor**:
- `users` - User profiles
- `user_locations` - Real-time location tracking
- `food_stalls` - Festival food vendors
- `float_trucks` - Parade floats
- `user_groups` - User groups
- `group_members` - Group membership

## **Step 3: Authentication Setup**

### 3.1 Configure Auth Providers
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure **Google** provider (optional):
   - Get Google OAuth credentials
   - Add Client ID and Secret
   - Add authorized redirect URLs

### 3.2 Email Templates
1. Go to **Authentication** → **Email Templates**
2. Customize email templates for:
   - Confirm signup
   - Reset password
   - Magic link

## **Step 4: Real-time Setup**

### 4.1 Enable Real-time
1. Go to **Database** → **Replication**
2. Ensure real-time is enabled for:
   - `user_locations`
   - `food_stalls`
   - `float_trucks`

### 4.2 Test Real-time
1. Open **Table Editor**
2. Select `user_locations` table
3. Make changes and verify real-time updates

## **Step 5: Storage Setup (Optional)**

### 5.1 Create Storage Buckets
1. Go to **Storage** → **Buckets**
2. Create buckets:
   - `avatars` - User profile pictures
   - `food-images` - Food stall images
   - `float-images` - Float truck images

### 5.2 Set Storage Policies
```sql
-- Allow public read access to food and float images
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id IN ('food-images', 'float-images'));

-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## **Step 6: Build and Test**

### 6.1 Update Android App
1. Replace Firebase dependencies with Supabase
2. Update `SupabaseClient.kt` with your credentials
3. Build the project: `./gradlew assembleDebug`

### 6.2 Test Authentication
1. Run the app on device/emulator
2. Try registering a new account
3. Test login functionality
4. Verify user profile creation

### 6.3 Test Location Tracking
1. Grant location permissions
2. Open the map
3. Verify location updates in Supabase dashboard
4. Test real-time location sharing

## **Step 7: Advanced Features**

### 7.1 Push Notifications
For push notifications, you'll need to:
1. Set up a notification service (OneSignal, Firebase Cloud Messaging)
2. Create Edge Functions for notification logic
3. Integrate with your Android app

### 7.2 Google Maps Integration
1. Get Google Maps API key
2. Update `AndroidManifest.xml`:
   ```xml
   <meta-data
       android:name="com.google.android.geo.API_KEY"
       android:value="YOUR_MAPS_API_KEY" />
   ```

## **Database Schema Overview**

### **Users Table**
```sql
users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    is_pro_user BOOLEAN,
    created_at TIMESTAMP,
    last_active TIMESTAMP
)
```

### **User Locations Table**
```sql
user_locations (
    user_id UUID PRIMARY KEY,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    accuracy FLOAT,
    timestamp TIMESTAMP,
    display_name TEXT
)
```

### **Food Stalls Table**
```sql
food_stalls (
    id UUID PRIMARY KEY,
    name TEXT,
    description TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    image_url TEXT,
    category TEXT
)
```

## **Security Features**

### **Row Level Security (RLS)**
- Users can only view their own profiles
- Anyone can view user locations (for tracking)
- Group members can view group data
- Food stalls and float trucks are publicly readable

### **Authentication**
- Email/password authentication
- Google OAuth (optional)
- Password reset functionality
- Session management

## **Real-time Features**

### **Location Tracking**
- Real-time location updates
- Automatic last_active updates
- Nearby user detection
- Location history

### **Group Management**
- Create and join groups
- Real-time group updates
- Member management

## **Troubleshooting**

### Common Issues:

1. **Authentication Errors**:
   - Check Supabase URL and API key
   - Verify email provider is enabled
   - Check RLS policies

2. **Real-time Not Working**:
   - Ensure real-time is enabled for tables
   - Check network connectivity
   - Verify subscription setup

3. **Location Updates Failing**:
   - Check location permissions
   - Verify RLS policies for user_locations
   - Check database connection

4. **Build Errors**:
   - Sync Gradle files
   - Check Supabase dependencies
   - Verify API credentials

## **Next Steps**

Once basic setup is working:

1. **Add Google OAuth** for easier sign-in
2. **Implement push notifications** for friend alerts
3. **Add group features** for festival groups
4. **Optimize location updates** for battery efficiency
5. **Add admin features** for managing food stalls/floats

## **Support**

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Android SDK Documentation](https://supabase.com/docs/reference/kotlin/introduction)

---

**Happy coding with Supabase! 🚀**
