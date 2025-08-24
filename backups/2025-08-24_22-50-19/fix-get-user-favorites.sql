-- Fix for the get_user_favorites function
-- Run this in your Supabase SQL Editor to fix the type casting error

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_user_favorites(UUID, TEXT);

-- Create the fixed function
CREATE OR REPLACE FUNCTION get_user_favorites(user_uuid UUID, item_type_filter TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    item_type TEXT,
    item_id TEXT,
    item_name TEXT,
    item_description TEXT,
    item_location TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.item_type,
        f.item_id,
        f.item_name,
        f.item_description,
        f.item_location,
        f.created_at
    FROM favorites f
    WHERE f.user_id = user_uuid
        AND (item_type_filter IS NULL OR f.item_type = item_type_filter)
    ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_favorites(UUID, TEXT) TO anon, authenticated;
