# Collection Names Mapping - Admin Portal vs Map Application

## 🔍 **Current Collection Names in Map Application**

The map application is currently looking for these collection names:

### **Map Application Collections:**
- `foodStalls` - Food stall data
- `artists` - Artist/band data  
- `floatTrucks` - Float truck data
- `userFavorites` - User favorites
- `artistLocations` - Artist location tracking
- `artistNotifications` - Artist notifications

---

## 📋 **Your Admin Portal Schema Collections**

Based on your admin portal schema, you have these collections:

### **Admin Portal Collections:**
- `foodStalls` - Food stall data ✅ **MATCHES**
- `artists` - Artist/band data ✅ **MATCHES**  
- `floatTrucks` - Float truck data ✅ **MATCHES**
- `users` - User data ❌ **NOT USED BY MAP**
- `clients` - Client data ❌ **NOT USED BY MAP**

---

## ✅ **Good News: Collection Names Match!**

Your admin portal collection names are **exactly the same** as what the map application expects:

| Admin Portal | Map Application | Status |
|--------------|-----------------|---------|
| `foodStalls` | `foodStalls` | ✅ **MATCH** |
| `artists` | `artists` | ✅ **MATCH** |
| `floatTrucks` | `floatTrucks` | ✅ **MATCH** |

---

## 🧪 **How to Verify Collection Names**

### **Option 1: Check Browser Console**
1. Open your map application (http://localhost:5501)
2. Open browser console (F12)
3. Look for these messages:
   ```
   🔥 Loading data from Firebase...
   🍽️ Fetching food stalls from Firebase...
   ✅ Loaded food stalls from Firebase: X
   🎵 Fetching artists from Firebase...
   ✅ Loaded artists from Firebase: X
   🚛 Fetching float trucks from Firebase...
   ✅ Loaded float trucks from Firebase: X
   ```

### **Option 2: Use Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `tagyouapp-b0d30`
3. Go to Firestore Database
4. Check collection names in the left sidebar

### **Option 3: Run Collection Checker**
1. Open browser console (F12)
2. Copy and paste this code:
   ```javascript
   // Check what collections exist
   import('./collection-checker.js').then(module => {
     console.log('Collection checker loaded');
   });
   ```

---

## 🚨 **If Collection Names Don't Match**

If your admin portal uses different collection names, here's how to fix it:

### **Example: If your admin portal uses different names**
```javascript
// Your admin portal collections:
'food_vendors'  // instead of 'foodStalls'
'performers'    // instead of 'artists'
'parade_floats' // instead of 'floatTrucks'
```

### **Solution: Update Firebase Service**
Update `firebase-service.js` to use your actual collection names:

```javascript
// In FoodStallsService.getAllFoodStalls()
const querySnapshot = await getDocs(collection(db, 'food_vendors')); // Your actual name

// In ArtistsService.getAllArtists()
const querySnapshot = await getDocs(collection(db, 'performers')); // Your actual name

// In FloatTrucksService.getAllFloatTrucks()
const querySnapshot = await getDocs(collection(db, 'parade_floats')); // Your actual name
```

---

## 📊 **Expected Data Structure**

### **`foodStalls` Collection**
```javascript
{
  "name": "Caribbean Spice Kitchen",
  "location": "Ladbroke Grove",
  "rating": 4.8,
  "hours": "11:00 AM - 8:00 PM",
  "status": "active",
  "description": "Authentic Jamaican jerk chicken and Caribbean cuisine",
  "lat": 51.517871,
  "lng": -0.205163,
  "image": "https://example.com/image.jpg",
  "contact": "+44 20 7123 4567"
}
```

### **`artists` Collection**
```javascript
{
  "name": "DJ Shy FX",
  "genre": "Drum & Bass",
  "performance_time": "3:00 PM - 4:30 PM",
  "stage": "Main Float Route",
  "rating": 4.9,
  "status": "active",
  "description": "Legendary drum & bass and jungle pioneer",
  "image": "https://example.com/image.jpg",
  "contact": "+44 20 7123 4570"
}
```

### **`floatTrucks` Collection**
```javascript
{
  "name": "Circus Float",
  "type": "Circus",
  "route": "Parade Route",
  "time": "2:00 PM",
  "status": "active",
  "description": "Spectacular circus performers on wheels",
  "image": "https://example.com/image.jpg"
}
```

---

## 🎯 **Next Steps**

1. **Test the integration** - Your collection names should work as-is
2. **Check browser console** for data loading messages
3. **Verify data appears** on the map
4. **If issues persist** - Check field names and data structure

**Your collection names are already correct!** The integration should work with your existing admin portal data. 🎉
