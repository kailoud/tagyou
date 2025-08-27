-- Add featured_image column to artists table
-- Run this in your Supabase SQL Editor

-- Add the featured_image column
ALTER TABLE artists 
ADD COLUMN featured_image TEXT;

-- Add a comment to explain the column
COMMENT ON COLUMN artists.featured_image IS 'Primary/featured image URL for the artist';

-- Update the existing RLS policy to include featured_image
-- (The existing policies should already cover this new column)

-- Optional: Add an index for better performance when querying by featured_image
CREATE INDEX IF NOT EXISTS idx_artists_featured_image ON artists(featured_image) WHERE featured_image IS NOT NULL;
