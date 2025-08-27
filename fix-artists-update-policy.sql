-- Fix RLS Policy for Artists Table to Allow Updates
-- Run this in your Supabase SQL Editor

-- Add UPDATE policy for artists table
CREATE POLICY "Allow authenticated users to update artists" ON artists
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Also add INSERT policy if you need to create new artists
CREATE POLICY "Allow authenticated users to insert artists" ON artists
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- If you want to allow anonymous users to update (for testing), use this instead:
-- CREATE POLICY "Allow anonymous users to update artists" ON artists
--     FOR UPDATE USING (true);
