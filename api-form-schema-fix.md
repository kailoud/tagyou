# Fix API-Based Form Generation Issue

## Problem
The admin portal is using an API to dynamically generate form fields based on the database schema. Even though we removed the `image_url` column from the database, the API is still returning it in the schema, causing the form to show the field.

## Common API Patterns

### 1. Schema Introspection API
The admin portal might be calling an API like:
```
GET /api/schema/food_stalls
GET /api/tables/food_stalls/columns
GET /api/meta/columns?table=food_stalls
```

### 2. PostgREST/Supabase Auto-Generated API
If using Supabase, the API might be:
```
GET /rest/v1/food_stalls?select=*
GET /rest/v1/rpc/get_table_schema?table_name=food_stalls
```

## Quick Diagnostic

### Check API Calls in Browser
1. Open the admin portal
2. Open DevTools (F12)
3. Go to Network tab
4. Open the edit form
5. Look for API calls that return schema/column information

### Common API Response Patterns
```json
// Schema API response (what we need to fix)
{
  "columns": [
    {"name": "id", "type": "uuid"},
    {"name": "name", "type": "text"},
    {"name": "cuisine", "type": "text"},
    {"name": "image_url", "type": "text"}, // ← This needs to be removed
    {"name": "description", "type": "text"}
  ]
}
```

## Database-Level Fixes

### 1. Force Schema Refresh
```sql
-- Clear PostgreSQL query cache
DISCARD PLANS;

-- Refresh table statistics
ANALYZE food_stalls;
ANALYZE artists;
ANALYZE float_trucks;
ANALYZE clients;

-- Check current schema
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'food_stalls'
ORDER BY ordinal_position;
```

### 2. Check for Cached Views/Functions
```sql
-- Check if any views still reference image_url
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

## API-Level Fixes

### 1. Supabase/PostgREST Configuration
If using Supabase, check the RLS policies and API configuration:

```sql
-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('food_stalls', 'artists', 'float_trucks', 'clients');
```

### 2. Custom API Endpoint Fix
If you have a custom API, look for schema generation code:

```javascript
// Example: Remove image_url from schema response
app.get('/api/schema/:table', async (req, res) => {
  const { table } = req.params;
  
  // Get table schema
  const columns = await getTableColumns(table);
  
  // Filter out image columns
  const filteredColumns = columns.filter(col => 
    !col.name.includes('image') && 
    !col.name.includes('img')
  );
  
  res.json({ columns: filteredColumns });
});
```

## Application-Level Fixes

### 1. Frontend Schema Filtering
If the API can't be changed, filter on the frontend:

```javascript
// Filter out image columns from API response
const filterImageColumns = (columns) => {
  return columns.filter(col => 
    !col.name.includes('image') && 
    !col.name.includes('img')
  );
};

// Apply filter to API response
const response = await fetch('/api/schema/food_stalls');
const data = await response.json();
const cleanColumns = filterImageColumns(data.columns);
```

### 2. Form Generation Override
Override the form generation to exclude image fields:

```javascript
// Override form field generation
const generateFormFields = (schema) => {
  return schema.columns
    .filter(col => !col.name.includes('image'))
    .map(col => ({
      name: col.name,
      type: getInputType(col.data_type),
      label: formatLabel(col.name)
    }));
};
```

## Immediate Fix Script

### Browser Console Script
```javascript
// Run this in the admin portal console to intercept API calls
(function() {
  console.log('🔧 Intercepting API calls to filter image columns...');
  
  // Store original fetch
  const originalFetch = window.fetch;
  
  // Override fetch
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    
    // Clone response to modify it
    const clonedResponse = response.clone();
    
    try {
      const data = await clonedResponse.json();
      
      // Check if this is a schema API response
      if (data.columns && Array.isArray(data.columns)) {
        console.log('📋 Found schema API response, filtering image columns...');
        
        // Filter out image columns
        const filteredColumns = data.columns.filter(col => 
          !col.name.includes('image') && 
          !col.name.includes('img')
        );
        
        // Create new response with filtered data
        const newData = { ...data, columns: filteredColumns };
        const newResponse = new Response(JSON.stringify(newData), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
        
        console.log(`✅ Filtered ${data.columns.length - filteredColumns.length} image columns`);
        return newResponse;
      }
    } catch (e) {
      // Not JSON, return original response
    }
    
    return response;
  };
  
  console.log('✅ API interceptor installed');
})();
```

## Verification Steps

1. **Check API Response**: Look at Network tab to see what the schema API returns
2. **Apply Database Fix**: Run the schema refresh SQL
3. **Test Form**: Check if image_url field disappears
4. **Clear Cache**: Hard refresh the admin portal
5. **Monitor API**: Watch for any remaining image_url references

## Common API Endpoints to Check

- `/api/schema/*`
- `/api/tables/*/columns`
- `/api/meta/*`
- `/rest/v1/*` (Supabase)
- `/graphql` (if using GraphQL)

## Next Steps

1. **Identify the API endpoint** that returns the schema
2. **Check if it's cached** at the database level
3. **Apply the appropriate fix** based on your setup
4. **Test the form** to ensure image_url is gone

Let me know what API endpoint you find, and I can provide a more specific fix!
