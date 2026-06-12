DROP POLICY IF EXISTS "Anyone can upload review images" ON storage.objects;
CREATE POLICY "Anyone can upload review images" ON storage.objects
FOR INSERT TO public
WITH CHECK (
  bucket_id = 'review-images'
  AND COALESCE((metadata->>'size')::bigint, 0) <= 2097152
  AND (LOWER(COALESCE(metadata->>'mimetype','')) IN ('image/jpeg','image/png','image/webp','image/gif'))
  AND LOWER(storage.extension(name)) IN ('jpg','jpeg','png','webp','gif')
);