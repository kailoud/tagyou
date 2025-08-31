-- Simple Storage Setup for TagYou Avatars
-- This should work with standard Supabase user permissions

-- First, create the storage bucket (if it doesn't exist)
-- You can do this via the dashboard instead of SQL

-- Then, create basic policies for the user-avatars bucket
-- These policies are more permissive and should work with standard permissions

-- Allow anyone to view avatars (public bucket)
CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to update their own avatars (simplified)
CREATE POLICY "Users can update avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-avatars' AND 
    auth.role() = 'authenticated'
  );

-- Allow users to delete avatars (simplified)
CREATE POLICY "Users can delete avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-avatars' AND 
    auth.role() = 'authenticated'
  );
