-- Create jerseys storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'jerseys',
  'jerseys',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Allow public read access to jerseys bucket
CREATE POLICY "Jerseys images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'jerseys');

-- Allow authenticated users to upload jersey images
CREATE POLICY "Authenticated users can upload jersey images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'jerseys');

-- Allow authenticated users to update jersey images
CREATE POLICY "Authenticated users can update jersey images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'jerseys');

-- Allow authenticated users to delete jersey images
CREATE POLICY "Authenticated users can delete jersey images"
ON storage.objects FOR DELETE
USING (bucket_id = 'jerseys');