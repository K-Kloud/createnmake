-- Create the tryon-results storage bucket for storing virtual try-on generated images
INSERT INTO storage.buckets (id, name, public)
VALUES ('tryon-results', 'tryon-results', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for tryon-results bucket
-- Allow authenticated users to view all try-on results
CREATE POLICY "Allow authenticated users to view try-on results"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'tryon-results');

-- Allow authenticated users to upload their own try-on results
CREATE POLICY "Allow authenticated users to upload try-on results"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tryon-results' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own try-on results
CREATE POLICY "Allow users to delete their own try-on results"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tryon-results' AND auth.uid()::text = (storage.foldername(name))[1]);