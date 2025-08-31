# Supabase Storage Setup for TagYou Profile Avatars

## Overview
This guide explains how to set up Supabase Storage for handling user avatar uploads in the TagYou application.

## Prerequisites
- Supabase project already created
- User profiles table already set up (see `user-profiles-table.sql`)

## Step 1: Create Storage Bucket

### Via Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Configure the bucket:
   - **Name**: `user-avatars`
   - **Public bucket**: ✅ Check this (avatars need to be publicly accessible)
   - **File size limit**: `5 MB` (matches our frontend validation)
   - **Allowed MIME types**: `image/*` (allows JPG, PNG, GIF, etc.)

### Via SQL (Alternative):
```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);
```

## Step 2: Set Up Storage Policies

### RLS Policies for Avatar Storage:

```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Users can upload their own avatars
CREATE POLICY "Users can upload own avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view all avatars (public bucket)
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');

-- Users can update their own avatars
CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own avatars
CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Step 3: Test the Setup

### Test Avatar Upload:
1. Sign in to your TagYou application
2. Click on your avatar to open the dropdown
3. Click **Edit Profile**
4. Try uploading an image file
5. Check the Supabase Storage dashboard to see the uploaded file

### Expected File Structure:
```
user-avatars/
├── {user-id}-{timestamp}.jpg
├── {user-id}-{timestamp}.png
└── ...
```

## Step 4: Environment Variables

Make sure your frontend has access to the Supabase URL and anon key:

```javascript
// In supabase-config-secret.js
window.supabaseConfig = {
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your-anon-key'
};
```

## Troubleshooting

### Common Issues:

1. **"Bucket not found" error**:
   - Ensure the bucket name is exactly `user-avatars`
   - Check that the bucket is created in the correct project

2. **"Permission denied" error**:
   - Verify RLS policies are correctly set up
   - Check that the user is authenticated
   - Ensure the bucket is public

3. **"File too large" error**:
   - Check the file size limit in bucket settings
   - Verify frontend validation (5MB limit)

4. **"Invalid MIME type" error**:
   - Check allowed MIME types in bucket settings
   - Ensure the file is actually an image

### Debug Commands:

```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'user-avatars';

-- Check storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects';

-- Check uploaded files
SELECT * FROM storage.objects WHERE bucket_id = 'user-avatars';
```

## Security Considerations

1. **File Validation**: The frontend validates file size and type, but server-side validation is also important
2. **User Isolation**: Each user can only upload/update/delete their own avatars
3. **Public Access**: Avatars are publicly viewable (necessary for profile display)
4. **File Cleanup**: Consider implementing cleanup for unused avatars

## Performance Optimization

1. **Image Compression**: Consider implementing client-side image compression before upload
2. **CDN**: Supabase Storage automatically serves files via CDN
3. **Caching**: Browser caching is handled automatically
4. **File Size**: Keep avatars under 1MB for optimal performance

## Next Steps

After setting up storage:
1. Test avatar uploads with different file types
2. Verify profile updates work correctly
3. Test avatar display across different pages
4. Monitor storage usage and costs
