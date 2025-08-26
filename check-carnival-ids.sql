-- =====================================================
-- CHECK EXISTING CARNIVAL IDs (READ-ONLY)
-- =====================================================

-- Check what carnival IDs exist
SELECT 
    id,
    external_id,
    name,
    location,
    status
FROM carnivals 
ORDER BY id;

-- Check what carnival IDs are referenced in food_stalls
SELECT DISTINCT 
    carnival_id,
    COUNT(*) as food_stall_count
FROM food_stalls 
GROUP BY carnival_id 
ORDER BY carnival_id;

-- Show all food stalls with their carnival info
SELECT 
    fs.id,
    fs.name,
    fs.cuisine,
    fs.carnival_id,
    c.name as carnival_name,
    fs.location,
    fs.status
FROM food_stalls fs
LEFT JOIN carnivals c ON fs.carnival_id = c.id
ORDER BY fs.id;
