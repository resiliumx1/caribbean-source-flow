-- Fix storage policies for product, bundle, and retreat image uploads.
-- Supabase Storage upserts/replacements require read access on objects in addition to insert/update/delete.

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view retreat images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view review images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload retreat images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update retreat images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete retreat images" ON storage.objects;

CREATE POLICY "Public can view product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Public can view retreat images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'retreat-images');

CREATE POLICY "Public can view review images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated can upload retreat images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'retreat-images');

CREATE POLICY "Authenticated can update retreat images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'retreat-images')
WITH CHECK (bucket_id = 'retreat-images');

CREATE POLICY "Authenticated can delete retreat images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'retreat-images');