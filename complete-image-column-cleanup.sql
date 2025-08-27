-- Complete Image Column Cleanup Script
-- This script removes all image-related columns and their dependencies

-- Step 1: Check current image columns
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('food_stalls', 'artists', 'float_trucks', 'clients')
    AND (column_name LIKE '%image%' OR column_name LIKE '%img%')
ORDER BY table_name, column_name;

-- Step 2: Check for dependencies
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

-- Step 3: Drop all image columns with CASCADE
-- This will automatically handle any dependent objects (views, triggers, etc.)

-- Food Stalls table
ALTER TABLE food_stalls DROP COLUMN IF EXISTS image_url CASCADE;
ALTER TABLE food_stalls DROP COLUMN IF EXISTS main_image CASCADE;
ALTER TABLE food_stalls DROP COLUMN IF EXISTS all_images CASCADE;
ALTER TABLE food_stalls DROP COLUMN IF EXISTS images CASCADE;
ALTER TABLE food_stalls DROP COLUMN IF EXISTS image CASCADE;

-- Artists table
ALTER TABLE artists DROP COLUMN IF EXISTS image_url CASCADE;
ALTER TABLE artists DROP COLUMN IF EXISTS main_image CASCADE;
ALTER TABLE artists DROP COLUMN IF EXISTS all_images CASCADE;
ALTER TABLE artists DROP COLUMN IF EXISTS images CASCADE;
ALTER TABLE artists DROP COLUMN IF EXISTS image CASCADE;

-- Float Trucks table
ALTER TABLE float_trucks DROP COLUMN IF EXISTS image_url CASCADE;
ALTER TABLE float_trucks DROP COLUMN IF EXISTS main_image CASCADE;
ALTER TABLE float_trucks DROP COLUMN IF EXISTS all_images CASCADE;
ALTER TABLE float_trucks DROP COLUMN IF EXISTS images CASCADE;
ALTER TABLE float_trucks DROP COLUMN IF EXISTS image CASCADE;

-- Clients table
ALTER TABLE clients DROP COLUMN IF EXISTS image_url CASCADE;
ALTER TABLE clients DROP COLUMN IF EXISTS main_image CASCADE;
ALTER TABLE clients DROP COLUMN IF EXISTS all_images CASCADE;
ALTER TABLE clients DROP COLUMN IF EXISTS images CASCADE;
ALTER TABLE clients DROP COLUMN IF EXISTS image CASCADE;

-- Step 4: Remove any indexes on image columns
DROP INDEX IF EXISTS idx_food_stalls_image_url;
DROP INDEX IF EXISTS idx_food_stalls_main_image;
DROP INDEX IF EXISTS idx_food_stalls_all_images;
DROP INDEX IF EXISTS idx_food_stalls_images;
DROP INDEX IF EXISTS idx_food_stalls_image;

DROP INDEX IF EXISTS idx_artists_image_url;
DROP INDEX IF EXISTS idx_artists_main_image;
DROP INDEX IF EXISTS idx_artists_all_images;
DROP INDEX IF EXISTS idx_artists_images;
DROP INDEX IF EXISTS idx_artists_image;

DROP INDEX IF EXISTS idx_float_trucks_image_url;
DROP INDEX IF EXISTS idx_float_trucks_main_image;
DROP INDEX IF EXISTS idx_float_trucks_all_images;
DROP INDEX IF EXISTS idx_float_trucks_images;
DROP INDEX IF EXISTS idx_float_trucks_image;

DROP INDEX IF EXISTS idx_clients_image_url;
DROP INDEX IF EXISTS idx_clients_main_image;
DROP INDEX IF EXISTS idx_clients_all_images;
DROP INDEX IF EXISTS idx_clients_images;
DROP INDEX IF EXISTS idx_clients_image;

-- Step 5: Verify cleanup
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('food_stalls', 'artists', 'float_trucks', 'clients')
    AND (column_name LIKE '%image%' OR column_name LIKE '%img%')
ORDER BY table_name, column_name;

-- Step 6: Check table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('food_stalls', 'artists', 'float_trucks', 'clients')
ORDER BY table_name, ordinal_position;

-- Success message
SELECT '✅ Image column cleanup completed successfully!' as status;
