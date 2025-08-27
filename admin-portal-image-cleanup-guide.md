# Admin Portal Image URL Cleanup Guide

## Problem Summary
The admin portal at `tagyou.org/admin/` is trying to access `image_url` columns that have been removed from the database, causing errors in the edit forms.

## Error Messages to Look For
- "Could not find the 'image_url' column of 'food_stalls' in the schema cache"
- "column image_url does not exist"
- "Failed to update food stall"

## Files to Check and Fix

### 1. Frontend Form Components
Look for these files in the admin portal codebase:

#### Edit Form Components
- `EditFoodStall.jsx` / `EditFoodStall.vue` / `EditFoodStall.tsx`
- `FoodStallForm.jsx` / `FoodStallForm.vue` / `FoodStallForm.tsx`
- `components/forms/FoodStallEdit.jsx`
- `pages/admin/food-stalls/edit.jsx`

#### Form Fields to Remove
```jsx
// REMOVE THIS SECTION from the edit form:
<div className="form-group">
  <label>Image URL (Quick Setup)</label>
  <input 
    type="text" 
    name="image_url" 
    value={formData.image_url} 
    onChange={handleChange}
    placeholder="https://example.com/image.jpg"
  />
  <small>Direct link to food stall image (for quick setup)</small>
</div>
```

### 2. Form Data Handling
Look for these patterns in form handlers:

#### Remove from Form State
```javascript
// REMOVE image_url from initial form state
const [formData, setFormData] = useState({
  name: '',
  cuisine: '',
  location: '',
  // image_url: '', // ← REMOVE THIS LINE
  description: '',
  // ... other fields
});
```

#### Remove from Form Submission
```javascript
// REMOVE image_url from form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  const submitData = {
    name: formData.name,
    cuisine: formData.cuisine,
    location: formData.location,
    // image_url: formData.image_url, // ← REMOVE THIS LINE
    description: formData.description,
    // ... other fields
  };
  // Submit to API
};
```

### 3. API Service Files
Look for these files:
- `services/foodStallService.js`
- `api/foodStalls.js`
- `utils/api.js`

#### Remove from API Calls
```javascript
// REMOVE image_url from API requests
export const updateFoodStall = async (id, data) => {
  const { image_url, ...cleanData } = data; // ← REMOVE image_url
  return await api.put(`/food-stalls/${id}`, cleanData);
};
```

### 4. Database Schema Files
Check for any remaining references:
- `migrations/` folder
- `schema.sql`
- `database.js`

## Diagnostic Scripts

### 1. Database Column Check
```sql
-- Check what image columns still exist
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('food_stalls', 'artists', 'float_trucks', 'clients')
    AND (column_name LIKE '%image%' OR column_name LIKE '%img%')
ORDER BY table_name, column_name;
```

### 2. View Dependencies Check
```sql
-- Check what views depend on image columns
SELECT 
    dependent_ns.nspname as dependent_schema,
    dependent_view.relname as dependent_object,
    pg_class.relname as table_name,
    pg_attribute.attname as column_name
FROM pg_depend 
JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid 
JOIN pg_class as dependent_view ON pg_rewrite.ev_class = dependent_view.oid 
JOIN pg_class ON pg_depend.refobjid = pg_class.oid 
JOIN pg_attribute ON pg_depend.refobjid = pg_attribute.attrelid 
    AND pg_depend.refobjsubid = pg_attribute.attnum
JOIN pg_namespace dependent_ns ON dependent_view.relnamespace = dependent_ns.oid
WHERE pg_class.relname IN ('food_stalls', 'artists', 'float_trucks', 'clients')
    AND (pg_attribute.attname LIKE '%image%' OR pg_attribute.attname LIKE '%img%');
```

## Step-by-Step Fix Process

### Step 1: Identify the Codebase
1. Access the admin portal codebase (likely a separate repository)
2. Look for frontend framework files (React/Vue/Angular)
3. Find the edit form components

### Step 2: Remove Form Fields
1. Find the edit form component
2. Remove the "Image URL (Quick Setup)" input field
3. Remove any related labels and help text

### Step 3: Update Form Logic
1. Remove `image_url` from form state initialization
2. Remove `image_url` from form submission data
3. Update any form validation to exclude `image_url`

### Step 4: Update API Calls
1. Find API service files
2. Remove `image_url` from request payloads
3. Update any response handling that expects `image_url`

### Step 5: Test the Changes
1. Test the edit form without image URL field
2. Verify form submission works
3. Check that no errors appear in browser console

## Common File Patterns to Search

### Search Terms for Code Files
```bash
# Search for image_url references
grep -r "image_url" ./src/
grep -r "Image URL" ./src/
grep -r "Quick Setup" ./src/

# Search for form field patterns
grep -r "name.*image_url" ./src/
grep -r "value.*image_url" ./src/
```

### React/Vue Component Patterns
```jsx
// React pattern to look for
<input name="image_url" />
<FormField name="image_url" />
{/* Image URL field */}

// Vue pattern to look for
v-model="form.image_url"
:value="form.image_url"
```

## Verification Checklist

- [ ] Image URL field removed from edit form
- [ ] Form state no longer includes image_url
- [ ] API calls don't send image_url
- [ ] No console errors when editing
- [ ] Form submission works without errors
- [ ] Database queries don't reference image_url
- [ ] All image-related columns removed from database

## Rollback Plan

If issues occur, you can temporarily add the column back:
```sql
-- Emergency rollback (if needed)
ALTER TABLE food_stalls ADD COLUMN image_url TEXT;
ALTER TABLE artists ADD COLUMN image_url TEXT;
ALTER TABLE float_trucks ADD COLUMN image_url TEXT;
ALTER TABLE clients ADD COLUMN image_url TEXT;
```

## Support

If you need help identifying specific files or patterns in your admin portal codebase, please share:
1. The framework being used (React/Vue/Angular)
2. The file structure of the admin portal
3. Any specific error messages you're seeing
