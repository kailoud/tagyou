-- Check Float Trucks Table Schema
-- Run this in your Supabase SQL Editor to see what columns actually exist

-- Check if the table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'float_trucks'
) as table_exists;

-- Show all columns in the float_trucks table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'float_trucks' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if currentLocation column exists specifically
SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'float_trucks' 
    AND table_schema = 'public'
    AND column_name = 'currentLocation'
) as currentLocation_exists;

-- Show sample data if table exists
SELECT * FROM float_trucks LIMIT 3;
