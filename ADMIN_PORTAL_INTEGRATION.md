# TagYou2 Admin Portal Integration Guide

## 🎯 **Integration Complete!**

Your TagYou2 Festival Admin Portal is now fully integrated with the London Map application. The map will automatically pick up and display data from your existing admin portal collections.

---

## 📊 **Collection Mapping**

### **✅ `foodStalls` Collection**
**Admin Portal Fields → Map Application Fields:**
- `name` → `name`
- `location` → `location`
- `rating` → `rating`
- `hours` → `hours`
- `status` → `status`
- `description` → `description`
- `lat` → `lat`
- `lng` → `lng`
- `image` → `image`
- `contact` → `phone` (mapped automatically)

**Auto-generated Fields:**
- `specialties` → Created from `description` if not present
- `priceRange` → Defaults to "££" if not present

### **✅ `artists` Collection**
**Admin Portal Fields → Map Application Fields:**
- `name` → `name`
- `genre` → `genres` (converted to array)
- `performance_time` → `performanceTime`
- `stage` → `stage`
- `rating` → `rating`
- `status` → `status`
- `description` → `description`
- `image` → `image`
- `contact` → `phone` (mapped automatically)

**Auto-generated Fields:**
- `lat` → Defaults to 51.517674 if not present
- `lng` → Defaults to -0.200438 if not present
- `location` → Defaults to "Ladbroke Grove" if not present
- `experience` → Defaults to "Professional performer" if not present

### **✅ `floatTrucks` Collection**
**Admin Portal Fields → Map Application Fields:**
- `name` → `name`
- `type` → `type`
- `route` → `route`
- `time` → `time`
- `status` → `status`
- `description` → `description`
- `image` → `image`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`

---

## 🔧 **What Was Updated**

### **1. Firebase Service (`firebase-service.js`)**
- ✅ **Field Mapping**: Added automatic field mapping between admin portal and map application
- ✅ **FloatTrucksService**: New service for float trucks collection
- ✅ **Default Data**: Updated to match your admin portal schema
- ✅ **Error Handling**: Enhanced error handling and logging

### **2. Main Application (`script.js`)**
- ✅ **FloatTrucks Integration**: Added float trucks data loading
- ✅ **Enhanced Debugging**: Detailed console logging for troubleshooting
- ✅ **Data Validation**: Automatic field validation and defaults

### **3. Data Structure Compatibility**
- ✅ **Backward Compatibility**: Works with existing admin portal data
- ✅ **Forward Compatibility**: Supports new fields as they're added
- ✅ **Fallback System**: Graceful fallback to hardcoded data if needed

---

## 📋 **Admin Portal Data Requirements**

### **Minimum Required Fields for Food Stalls:**
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

### **Minimum Required Fields for Artists:**
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

### **Minimum Required Fields for Float Trucks:**
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

## 🧪 **Testing Your Integration**

### **Step 1: Check Browser Console**
1. Open your map application (http://localhost:5501)
2. Open browser developer tools (F12)
3. Go to Console tab
4. Refresh the page

### **Step 2: Look for Success Messages**
```
🔥 Loading data from Firebase...
🍽️ Fetching food stalls from Firebase...
✅ Loaded food stalls from Firebase: X
📊 Food stalls data: [...]
🎵 Fetching artists from Firebase...
✅ Loaded artists from Firebase: X
📊 Artists data: [...]
🚛 Fetching float trucks from Firebase...
✅ Loaded float trucks from Firebase: X
📊 Float trucks data: [...]
```

### **Step 3: Test UI Functions**
1. **Click Food Stalls toolbar button**
   - Look for: `🍽️ Showing food stalls...`
   - Check: `🎯 Number of stalls to display: X`

2. **Click Artists toolbar button**
   - Look for: `🎵 Showing artists...`
   - Check: `🎯 Number of artists to display: X`

3. **Click Float Trucks tab in pull-up panel**
   - Should display float trucks from your admin portal

---

## 🚨 **Troubleshooting**

### **If Data Doesn't Load:**
1. **Check Firebase Connection:**
   - Verify `firebase-config-secret.js` has correct credentials
   - Check browser console for Firebase errors

2. **Check Collection Names:**
   - Ensure collections are named exactly: `foodStalls`, `artists`, `floatTrucks`
   - Case-sensitive!

3. **Check Field Names:**
   - Use exact field names from the schema above
   - Required fields must be present

4. **Check Data Status:**
   - Ensure `status` field is set to `"active"`
   - Inactive items won't display

### **Common Issues:**
- **"Firebase initialization failed"** → Check Firebase credentials
- **"Loaded food stalls: 0"** → Check collection name and data
- **"Error fetching data"** → Check Firestore security rules

---

## 📈 **Adding New Data**

### **Via Admin Portal:**
1. Add new food stalls/artists/float trucks through your admin portal
2. Ensure all required fields are filled
3. Set `status` to `"active"`
4. Data will automatically appear on the map

### **Via Firebase Console:**
1. Go to Firebase Console → Firestore Database
2. Navigate to the appropriate collection
3. Add new documents with required fields
4. Map will update automatically

---

## 🎯 **Next Steps**

### **Immediate:**
1. ✅ Test the integration with your existing data
2. ✅ Verify all collections are loading correctly
3. ✅ Check that map markers appear for your data

### **Future Enhancements:**
1. **Real-time Updates**: Data changes in admin portal appear instantly on map
2. **User Authentication**: Secure admin portal access
3. **Advanced Filtering**: Filter by location, rating, type, etc.
4. **Analytics**: Track user interactions with map data

---

## 📞 **Support**

If you encounter issues:
1. Check browser console for detailed error messages
2. Verify your admin portal data structure matches the schema
3. Ensure Firebase credentials are correct
4. Check Firestore security rules allow read access

**Your TagYou2 London Map is now fully integrated with your admin portal!** 🎉
