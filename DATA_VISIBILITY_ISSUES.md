# Firebase Data Visibility Issues - Troubleshooting Guide

## 🔍 **Why Some Firebase Data Isn't Showing on the Web**

Let's systematically identify and fix the issues preventing your Firebase data from displaying on the map.

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: Missing Required Fields**
**Problem:** Data exists but missing required fields for display
**Symptoms:** Data loads but doesn't appear on map

**Required Fields Check:**
- **Food Stalls:** `name`, `location`, `rating`, `hours`, `status`, `description`, `lat`, `lng`, `image`, `contact`
- **Artists:** `name`, `genre`, `performance_time`, `stage`, `rating`, `status`, `description`, `image`, `contact`
- **Float Trucks:** `name`, `type`, `route`, `time`, `status`, `description`, `image`

**Solution:** Add missing fields in your admin portal

### **Issue 2: Status Field Not "active"**
**Problem:** Data exists but status is not set to "active"
**Symptoms:** Data loads but doesn't display

**Solution:** Set `status: "active"` for all items you want to display

### **Issue 3: Missing Coordinates**
**Problem:** Food stalls/artists missing lat/lng coordinates
**Symptoms:** Data loads but no map markers appear

**Solution:** Add `lat` and `lng` fields with valid coordinates

### **Issue 4: Field Name Mismatches**
**Problem:** Admin portal uses different field names than expected
**Symptoms:** Data loads but fields are undefined

**Solution:** Check field mapping in `firebase-service.js`

---

## 🧪 **Diagnostic Steps**

### **Step 1: Run Detailed Check**
The detailed check will automatically run and show:
- All documents in each collection
- Missing required fields
- Status field values
- Coordinate availability

### **Step 2: Check Browser Console**
Look for these messages:
```
🔍 Starting Detailed Firebase Data Check...
📊 Checking Collection: foodStalls
📈 Total documents: X
📋 Document details:
  Document 1 (ID: xxx):
    Fields: name, location, rating, hours, status, description, lat, lng, image, contact
    Data: {...}
    ✅ All required fields present
```

### **Step 3: Check Data Loading**
Look for:
```
🍽️ Testing FoodStallsService...
✅ FoodStallsService returned X items
📋 Sample food stall: {...}
🗺️ Has coordinates: Yes/No
📍 Location: [location name]
🏷️ Status: active/inactive
```

---

## 🔧 **Quick Fixes**

### **Fix 1: Add Missing Coordinates**
If coordinates are missing, add them to your admin portal:

```javascript
// For food stalls and artists
{
  "lat": 51.517871,  // Latitude coordinate
  "lng": -0.205163   // Longitude coordinate
}
```

### **Fix 2: Set Status to Active**
Ensure all items have:
```javascript
{
  "status": "active"
}
```

### **Fix 3: Add Missing Required Fields**
For food stalls, ensure you have:
```javascript
{
  "name": "Food Stall Name",
  "location": "Street Address",
  "rating": 4.8,
  "hours": "11:00 AM - 8:00 PM",
  "status": "active",
  "description": "Description text",
  "lat": 51.517871,
  "lng": -0.205163,
  "image": "https://example.com/image.jpg",
  "contact": "+44 20 7123 4567"
}
```

---

## 📊 **Data Structure Examples**

### **Correct Food Stall Data:**
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
  "image": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
  "contact": "+44 20 7123 4567"
}
```

### **Correct Artist Data:**
```javascript
{
  "name": "DJ Shy FX",
  "genre": "Drum & Bass",
  "performance_time": "3:00 PM - 4:30 PM",
  "stage": "Main Float Route",
  "rating": 4.9,
  "status": "active",
  "description": "Legendary drum & bass and jungle pioneer",
  "image": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
  "contact": "+44 20 7123 4570"
}
```

### **Correct Float Truck Data:**
```javascript
{
  "name": "Circus Float",
  "type": "Circus",
  "route": "Parade Route",
  "time": "2:00 PM",
  "status": "active",
  "description": "Spectacular circus performers on wheels",
  "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
}
```

---

## 🎯 **Testing Steps**

1. **Refresh your browser** (http://localhost:5501)
2. **Wait 5 seconds** for detailed check to run
3. **Check console output** for diagnostic results
4. **Look for specific issues** in the detailed report
5. **Fix issues** in your admin portal
6. **Test again** after making changes

---

## 📞 **Get Help**

Share the detailed check results with me, including:
- Collection document counts
- Missing required fields
- Status field values
- Any error messages

**The detailed check will tell us exactly what's wrong with your data!** 🔧
