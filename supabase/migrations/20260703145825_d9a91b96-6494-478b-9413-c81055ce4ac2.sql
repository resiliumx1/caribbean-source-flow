
-- 1. payment_plans: remove public SELECT policy
DROP POLICY IF EXISTS "Public can view payment plans" ON public.payment_plans;

-- 2. Storage: replace authenticated write policies with admin-only ones on product-images and retreat-images
DROP POLICY IF EXISTS "Authenticated can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can view product images" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated can upload retreat images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update retreat images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete retreat images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can view retreat images" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated can view review images" ON storage.objects;

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

CREATE POLICY "Admins can list product images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can upload retreat images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'retreat-images' AND public.is_admin());

CREATE POLICY "Admins can update retreat images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'retreat-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'retreat-images' AND public.is_admin());

CREATE POLICY "Admins can delete retreat images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'retreat-images' AND public.is_admin());

CREATE POLICY "Admins can list retreat images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'retreat-images' AND public.is_admin());

CREATE POLICY "Admins can list review images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'review-images' AND public.is_admin());

-- 3. Revoke EXECUTE on SECURITY DEFINER functions that are only invoked by
-- triggers or by service-role backend code. Client-callable helpers used from
-- application code or RLS policies (is_admin, is_order_owner_or_admin,
-- check_verified_purchase, admin_get_reviews) keep their grants because
-- revoking them would break authentication-time policy checks or client RPCs.
REVOKE EXECUTE ON FUNCTION public.apply_payment(uuid, numeric) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_admin_flag() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_order_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_order_event() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.restrict_customer_order_updates() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.restrict_customer_booking_updates() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
