# Fix Admin Portal Form Schema Cache Issue

## Problem
The admin portal edit form is still showing the `image_url` field even though it's been removed from the database. This happens because:

1. **Schema Cache**: The application has cached the old database schema
2. **Auto-generated Forms**: The form fields are generated from the cached schema
3. **Field Mapping**: The form has a predefined list of fields that includes `image_url`

## Quick Fixes

### Option 1: Clear Application Cache
```javascript
// Run this in the admin portal browser console
localStorage.clear();
sessionStorage.clear();
console.log('✅ Cache cleared. Refresh the page.');
```

### Option 2: Force Schema Refresh
```javascript
// If the admin portal has a schema refresh function
if (window.refreshSchema) {
  window.refreshSchema();
} else if (window.adminAPI && window.adminAPI.refreshSchema) {
  window.adminAPI.refreshSchema();
}
```

### Option 3: Clear Browser Cache
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use Ctrl+Shift+R (Cmd+Shift+R on Mac)

## Database-Level Fix

### Check for Cached Views or Functions
```sql
-- Check if there are any cached views that reference image_url
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE definition LIKE '%image_url%'
    AND schemaname NOT IN ('information_schema', 'pg_catalog');

-- Check for cached functions
SELECT 
    schemaname,
    proname,
    prosrc
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE prosrc LIKE '%image_url%'
    AND schemaname NOT IN ('information_schema', 'pg_catalog');
```

### Force Database Schema Refresh
```sql
-- Refresh all cached plans
DISCARD PLANS;

-- Refresh statistics
ANALYZE food_stalls;
ANALYZE artists;
ANALYZE float_trucks;
ANALYZE clients;

-- Check current schema
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('food_stalls', 'artists', 'float_trucks', 'clients')
ORDER BY table_name, ordinal_position;
```

## Application-Level Fixes

### If using Supabase/PostgREST
```javascript
// Force refresh the schema cache
const { data, error } = await supabase
  .from('food_stalls')
  .select('*')
  .limit(1);

// Or clear the connection
await supabase.auth.refreshSession();
```

### If using a custom API
```javascript
// Clear any cached schema data
if (window.apiClient) {
  window.apiClient.clearCache();
  window.apiClient.refreshSchema();
}
```

## Form Field Override

### Temporary Fix: Hide the Field
```javascript
// Run this in the admin portal console to hide the image_url field
document.querySelectorAll('input[name="image_url"], input[name*="image"]').forEach(input => {
  input.closest('.form-group, .field-group, .input-group').style.display = 'none';
});

// Also hide labels
document.querySelectorAll('label[for*="image"], label:contains("Image URL")').forEach(label => {
  label.closest('.form-group, .field-group, .input-group').style.display = 'none';
});
```

### Permanent Fix: Update Form Configuration
Look for these files in the admin portal codebase:

1. **Form Configuration Files**:
   - `formConfig.js`
   - `fieldDefinitions.js`
   - `schemaConfig.js`
   - `adminConfig.js`

2. **Remove image_url from field definitions**:
```javascript
// Find and remove this from form configuration
const foodStallFields = [
  'name',
  'cuisine',
  'location',
  // 'image_url', // ← REMOVE THIS LINE
  'description',
  'rating'
];
```

3. **Update schema introspection**:
```javascript
// If using schema introspection, filter out image columns
const getTableFields = (tableName) => {
  return schemaFields.filter(field => 
    !field.name.includes('image') && 
    !field.name.includes('img')
  );
};
```

## Server-Side Fix

### If using Node.js/Express
```javascript
// Clear any cached database connections
if (global.dbConnection) {
  await global.dbConnection.end();
  global.dbConnection = null;
}

// Restart the database connection
global.dbConnection = await createNewConnection();
```

### If using PHP
```php
// Clear any cached database metadata
$pdo->query("DISCARD PLANS");
$pdo->query("ANALYZE food_stalls");
```

## Verification Steps

1. **Clear all caches** (browser, application, database)
2. **Refresh the page**
3. **Check the edit form** - image_url field should be gone
4. **Test form submission** - should work without errors

## Emergency Rollback (if needed)

If the form breaks completely, temporarily add the column back:
```sql
-- Add image_url column back temporarily
ALTER TABLE food_stalls ADD COLUMN image_url TEXT;
ALTER TABLE artists ADD COLUMN image_url TEXT;
ALTER TABLE float_trucks ADD COLUMN image_url TEXT;
ALTER TABLE clients ADD COLUMN image_url TEXT;
```

Then fix the admin portal code and remove the columns again.

## Common Admin Portal Frameworks

### Strapi
```bash
# Restart Strapi to clear schema cache
npm run develop
# or
yarn develop
```

### Directus
```bash
# Clear Directus cache
rm -rf .directus/cache
# Restart Directus
npm run dev
```

### Supabase Dashboard
- Go to Database → Tables
- Click "Refresh" button
- Or restart the Supabase project

### Custom Admin Panel
- Look for a "Refresh Schema" or "Clear Cache" button
- Check for configuration files that define form fields
- Restart the admin application
