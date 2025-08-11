# TagYou Android App

A native Android application for real-time festival group tracking with fast location updates and live map functionality.

## 🚀 Features

### Core Features
- **Real-time Location Tracking** - Fast GPS updates with minimal latency
- **Live Map Integration** - Google Maps with custom markers for friends and groups
- **Group Management** - Create, join, and manage festival groups
- **Authentication** - Firebase Auth with email/password and Google Sign-In
- **Push Notifications** - Instant alerts for friend locations and group updates
- **Background Location Services** - Continuous tracking even when app is minimized

### Advanced Features
- **Offline Support** - Works without internet connection
- **Battery Optimization** - Efficient location tracking to preserve battery
- **Privacy Controls** - Granular location sharing permissions
- **Pro Subscription** - Premium features for power users
- **Admin Portal** - Manage food stalls, float trucks, and user data

## 🏗️ Architecture

### Technology Stack
- **Language**: Kotlin
- **Architecture**: MVVM (Model-View-ViewModel)
- **Backend**: Firebase (Auth, Firestore, Storage, Messaging)
- **Maps**: Google Maps Android API
- **Location**: Google Play Services Location API
- **Database**: Room (local caching)
- **Networking**: Retrofit + OkHttp
- **Image Loading**: Glide
- **UI**: Material Design 3

### Project Structure
```
app/src/main/java/com/tagyou/festivaltracker/
├── MainActivity.kt                 # Main entry point
├── auth/                          # Authentication
│   ├── AuthActivity.kt
│   └── AuthViewModel.kt
├── map/                           # Map functionality
│   ├── MapActivity.kt
│   ├── MapViewModel.kt
│   └── LocationTrackingService.kt
├── groups/                        # Group management
│   ├── GroupsActivity.kt
│   └── GroupsViewModel.kt
├── profile/                       # User profile
│   ├── ProfileActivity.kt
│   └── ProfileViewModel.kt
├── services/                      # Background services
│   ├── LocationTrackingService.kt
│   └── TagYouFirebaseMessagingService.kt
├── viewmodels/                    # ViewModels
│   └── MainViewModel.kt
├── models/                        # Data models
│   ├── UserProfile.kt
│   ├── Group.kt
│   └── Location.kt
└── utils/                         # Utilities
    ├── LocationUtils.kt
    └── PermissionUtils.kt
```

## 🛠️ Setup Instructions

### Prerequisites
- Android Studio Arctic Fox or later
- Android SDK 24+ (API level 24)
- Google Play Services
- Firebase project
- Google Maps API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TagYouAndroid
   ```

2. **Configure Firebase**
   - Create a Firebase project
   - Download `google-services.json` and place it in `app/`
   - Enable Authentication, Firestore, Storage, and Messaging

3. **Configure Google Maps**
   - Get a Google Maps API key from Google Cloud Console
   - Replace `YOUR_MAPS_API_KEY` in `AndroidManifest.xml`

4. **Build and Run**
   ```bash
   ./gradlew build
   ```

### Required Permissions
- `ACCESS_FINE_LOCATION` - Precise location tracking
- `ACCESS_COARSE_LOCATION` - Approximate location
- `ACCESS_BACKGROUND_LOCATION` - Background tracking
- `INTERNET` - Network communication
- `CAMERA` - Profile photos
- `POST_NOTIFICATIONS` - Push notifications

## 🎯 Performance Optimizations

### Location Tracking
- **High-frequency updates** (every 5-10 seconds) when active
- **Battery-optimized updates** (every 30-60 seconds) in background
- **Geofencing** for proximity alerts
- **Location caching** to reduce API calls

### Map Performance
- **Custom markers** with efficient rendering
- **Map tile caching** for offline use
- **Viewport optimization** to show relevant areas
- **Marker clustering** for large groups

### Battery Management
- **Adaptive location intervals** based on movement
- **Wake lock management** for critical operations
- **Background service optimization**
- **Network request batching**

## 🔧 Configuration

### Firebase Configuration
```kotlin
// Enable services in Firebase Console:
// - Authentication (Email/Password, Google)
// - Firestore Database
// - Cloud Storage
// - Cloud Messaging
```

### Google Maps Configuration
```xml
<!-- Add to AndroidManifest.xml -->
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_MAPS_API_KEY" />
```

### Location Services Configuration
```kotlin
// Location request settings
val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY)
    .setIntervalMillis(5000) // 5 seconds
    .setMinUpdateIntervalMillis(2000) // 2 seconds minimum
    .setMaxUpdateDelayMillis(10000) // 10 seconds maximum
    .build()
```

## 📱 Screenshots

*Screenshots will be added here*

## 🚀 Deployment

### Build Variants
- **Debug**: Development with logging and debugging
- **Release**: Production build with optimizations

### Release Process
1. Update version code and name in `build.gradle`
2. Run `./gradlew assembleRelease`
3. Test on multiple devices
4. Upload to Google Play Console

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@tagyou.app

## 🔮 Roadmap

### Version 1.1
- [ ] Offline mode improvements
- [ ] Advanced group features
- [ ] Custom map themes

### Version 1.2
- [ ] AR navigation
- [ ] Social features
- [ ] Event integration

### Version 2.0
- [ ] Cross-platform sync
- [ ] Advanced analytics
- [ ] Enterprise features
