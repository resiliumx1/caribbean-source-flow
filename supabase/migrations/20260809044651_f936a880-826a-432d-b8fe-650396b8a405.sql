-- 1. Lock down public reads on internal consultation config / overrides
DROP POLICY IF EXISTS "Anyone can read consultation settings" ON public.consultation_settings;
DROP POLICY IF EXISTS "Anyone can view overrides" ON public.consultation_availability_overrides;
REVOKE SELECT ON public.consultation_settings FROM anon;
REVOKE SELECT ON public.consultation_availability_overrides FROM anon;

CREATE POLICY "Admins read consultation settings"
  ON public.consultation_settings FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins read overrides"
  ON public.consultation_availability_overrides FOR SELECT TO authenticated
  USING (public.is_admin() OR public.has_consultation_access(auth.uid()));

-- 2. Pin search_path on the only function missing it
ALTER FUNCTION public.clean_product_text(text) SET search_path = public;

-- 3. Revoke EXECUTE on SECURITY DEFINER / internal functions that must not be
--    callable from the API. Functions used inside RLS policies (is_admin,
--    has_role, has_wce_access, has_consultation_access, is_order_owner_or_admin,
--    is_wce_order) keep their grants, as policy evaluation needs them.
REVOKE EXECUTE ON FUNCTION public.admin_get_reviews(text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_verified_purchase(text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.clean_product_text(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_consultation_reference() FROM PUBLIC, anon, authenticated;

-- 4. Decide the verified-purchase badge server-side now that clients cannot
--    call check_verified_purchase.
CREATE OR REPLACE FUNCTION public.set_review_verified_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.is_verified_purchase := public.check_verified_purchase(NEW.user_email, NEW.product_id);
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.set_review_verified_purchase() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS set_review_verified_purchase ON public.reviews;
CREATE TRIGGER set_review_verified_purchase
  BEFORE INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_review_verified_purchase();