
-- 1) Lock down Realtime: only admins may read realtime broadcast/presence messages
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins only can receive realtime" ON realtime.messages;
CREATE POLICY "Admins only can receive realtime"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 2) Explicit SELECT policies on storage.objects for the public buckets,
--    so download access is policy-controlled and survives any future bucket-privacy flip.
DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
CREATE POLICY "Public read product-images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public read retreat-images" ON storage.objects;
CREATE POLICY "Public read retreat-images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'retreat-images');

DROP POLICY IF EXISTS "Public read review-images" ON storage.objects;
CREATE POLICY "Public read review-images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'review-images');
