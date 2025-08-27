# Fix Image Display in Management Table

## Problem
Images uploaded in the edit form are not showing up in the management table rows. This could be due to:

1. **Data not being saved** to the database
2. **Images not being displayed** in the table
3. **Wrong data structure** for image storage
4. **Missing image rendering** in the table

## Diagnostic Steps

### Step 1: Check Database Storage
Run this in Supabase to see what's actually stored:

```sql
-- Check what's in the all_images column
SELECT 
    id,
    name,
    all_images,
    main_image_index
FROM food_stalls
WHERE all_images IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

### Step 2: Check Console for Errors
Open the admin portal console and look for:
- Upload errors
- Save errors
- Image loading errors

### Step 3: Check Network Tab
1. Open DevTools → Network tab
2. Upload an image in the edit form
3. Look for:
   - Upload API calls
   - Save/update API calls
   - Any error responses

## Common Issues and Fixes

### Issue 1: Images Not Being Saved
**Symptoms:** Images upload but disappear after saving
**Fix:** Check the save function

```javascript
// Check if images are included in the save data
console.log('Save data:', saveData);
// Should include: all_images, main_image_index
```

### Issue 2: Images Not Being Displayed
**Symptoms:** Images are saved but not shown in table
**Fix:** Check the table rendering code

```javascript
// Check if table is reading image data
console.log('Table data:', tableData);
// Should show all_images array
```

### Issue 3: Wrong Image Path/URL
**Symptoms:** Images saved but broken links
**Fix:** Check image URL structure

```javascript
// Check image URLs in the data
const foodStalls = window.foodStallsData;
foodStalls.forEach(stall => {
    if (stall.all_images) {
        console.log(`${stall.name} images:`, stall.all_images);
    }
});
```

## Quick Diagnostic Script

Run this in the admin portal console:

```javascript
// Image Display Diagnostic
console.log('🔍 Checking image display issues...');

// Check current data
if (window.foodStallsData) {
    console.log('📊 Food stalls data:', window.foodStallsData.length, 'items');
    
    window.foodStallsData.forEach((stall, index) => {
        console.log(`\n${index + 1}. ${stall.name}:`);
        console.log('   all_images:', stall.all_images);
        console.log('   main_image_index:', stall.main_image_index);
        
        if (stall.all_images && stall.all_images.length > 0) {
            console.log('   ✅ Has images');
            stall.all_images.forEach((img, imgIndex) => {
                console.log(`     Image ${imgIndex}:`, img);
            });
        } else {
            console.log('   ❌ No images');
        }
    });
}

// Check table rendering
const tableRows = document.querySelectorAll('tr, .table-row, [class*="row"]');
console.log('📋 Table rows found:', tableRows.length);

// Look for image elements in table
const tableImages = document.querySelectorAll('img, [class*="image"], [class*="img"]');
console.log('🖼️ Image elements in table:', tableImages.length);

tableImages.forEach((img, index) => {
    console.log(`Image ${index}:`, img.src || img.dataset.src || 'No src');
});
```

## Fix Options

### Option 1: Fix Table Rendering
If images are saved but not displayed, update the table rendering:

```javascript
// Example: Add image display to table rows
function renderTableRow(stall) {
    const imageHtml = stall.all_images && stall.all_images.length > 0 
        ? `<img src="${stall.all_images[0]}" alt="${stall.name}" style="width: 50px; height: 50px; object-fit: cover;">`
        : '<div style="width: 50px; height: 50px; background: #f0f0f0; display: flex; align-items: center; justify-content: center;">No Image</div>';
    
    return `
        <tr>
            <td>${imageHtml}</td>
            <td>${stall.name}</td>
            <td>${stall.cuisine}</td>
            <!-- other columns -->
        </tr>
    `;
}
```

### Option 2: Fix Save Function
If images aren't being saved, update the save function:

```javascript
// Example: Ensure images are included in save
function saveFoodStall(formData) {
    const saveData = {
        name: formData.name,
        cuisine: formData.cuisine,
        // ... other fields
        all_images: formData.uploadedImages || [], // Make sure this is included
        main_image_index: formData.mainImageIndex || 0
    };
    
    console.log('Saving with images:', saveData);
    return updateFoodStall(saveData);
}
```

### Option 3: Check Image Upload Handler
Ensure the upload handler is working:

```javascript
// Example: Debug image upload
function handleImageUpload(files) {
    console.log('📤 Uploading images:', files.length, 'files');
    
    const uploadedImages = [];
    files.forEach((file, index) => {
        console.log(`File ${index}:`, file.name, file.size);
        // Process upload
        uploadedImages.push(fileUrl);
    });
    
    console.log('✅ Uploaded images:', uploadedImages);
    return uploadedImages;
}
```

## Verification Steps

1. **Upload an image** in the edit form
2. **Check console** for upload/save messages
3. **Check database** to see if images are stored
4. **Refresh the table** to see if images appear
5. **Check network tab** for any failed requests

## Next Steps

1. **Run the diagnostic script** to see what's happening
2. **Check the database** to see if images are being saved
3. **Look at the table rendering code** to see if images are being displayed
4. **Apply the appropriate fix** based on what you find

Let me know what the diagnostic script shows, and I can provide a more specific fix!
