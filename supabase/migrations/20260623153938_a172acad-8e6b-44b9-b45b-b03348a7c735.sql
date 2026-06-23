-- Replace broad public listing policies with signed-in read policies needed by upload/admin flows.
-- Public buckets still serve images by public URL, but clients cannot anonymously list all files.

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view retreat images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view review images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can view retreat images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can view review images" ON storage.objects;

CREATE POLICY "Authenticated can view product images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated can view retreat images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'retreat-images');

CREATE POLICY "Authenticated can view review images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'review-images');