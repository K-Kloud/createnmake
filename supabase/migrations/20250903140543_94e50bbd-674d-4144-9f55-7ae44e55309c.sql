-- Create storage policies for reference-images bucket

-- First ensure the reference-images bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('reference-images', 'reference-images', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

-- Allow authenticated users to upload reference images
CREATE POLICY "Users can upload reference images" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'reference-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow public read access to reference images
CREATE POLICY "Reference images are publicly accessible" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'reference-images');

-- Allow users to delete their own reference images
CREATE POLICY "Users can delete their own reference images" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'reference-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own reference images
CREATE POLICY "Users can update their own reference images" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'reference-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );