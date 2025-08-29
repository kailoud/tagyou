-- Check existing columns in carnival_squad_members table
-- Run this first to see what columns exist

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'carnival_squad_members' 
ORDER BY ordinal_position;

-- Also check if there are any email-related columns
SELECT 
    column_name
FROM information_schema.columns 
WHERE table_name = 'carnival_squad_members' 
AND column_name LIKE '%email%';

-- Show a sample of existing data
SELECT * FROM carnival_squad_members LIMIT 5;
