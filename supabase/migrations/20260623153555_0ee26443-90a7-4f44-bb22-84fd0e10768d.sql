DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload retreat images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update retreat images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete retreat images" ON storage.objects;

CREATE POLICY "Authenticated can upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated can update product images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated can delete product images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated can upload retreat images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'retreat-images');

CREATE POLICY "Authenticated can update retreat images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'retreat-images')
WITH CHECK (bucket_id = 'retreat-images');

CREATE POLICY "Authenticated can delete retreat images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'retreat-images');