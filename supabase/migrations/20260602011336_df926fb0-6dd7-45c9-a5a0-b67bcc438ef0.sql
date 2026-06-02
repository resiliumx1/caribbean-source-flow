-- 1. Hide reviewer emails from public selects (admin RPC still returns them via SECURITY DEFINER)
REVOKE SELECT (user_email) ON public.reviews FROM anon, authenticated;

-- 2. Remove guest direct-insert policies on orders & order_items
--    (guest checkout uses paypal-checkout / guest-orders edge functions with service role)
DROP POLICY IF EXISTS "Guests can create orders without user_id" ON public.orders;
DROP POLICY IF EXISTS "Guests can insert items for guest orders" ON public.order_items;

-- 3. Restrict product-images storage mutations to admins only
DROP POLICY IF EXISTS "Authenticated can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete product images" ON storage.objects;

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND public.is_admin())
WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images' AND public.is_admin());