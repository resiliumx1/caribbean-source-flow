-- 1. Views run with the caller's privileges (no owner-privilege bypass)
ALTER VIEW public.reviews_public SET (security_invoker = true);
ALTER VIEW public.consultation_practitioners_public SET (security_invoker = true);
GRANT SELECT ON public.reviews_public TO anon, authenticated;
GRANT SELECT ON public.consultation_practitioners_public TO anon, authenticated;

-- 2. reviews: public may read approved rows, non-sensitive columns only
DROP POLICY IF EXISTS "Public can read approved reviews" ON public.reviews;
CREATE POLICY "Public can read approved reviews"
ON public.reviews FOR SELECT TO anon, authenticated
USING (status = 'approved');

REVOKE SELECT ON public.reviews FROM anon, authenticated;
GRANT SELECT (id, product_id, user_name, rating, title, content, images, status,
              helpful_count, is_verified_purchase, created_at)
ON public.reviews TO anon, authenticated;

-- 3. practitioners: public may read active rows, no zoom_user_email
DROP POLICY IF EXISTS "Public can view active practitioners" ON public.consultation_practitioners;
CREATE POLICY "Public can view active practitioners"
ON public.consultation_practitioners FOR SELECT TO anon, authenticated
USING (is_active = true);

REVOKE SELECT ON public.consultation_practitioners FROM anon, authenticated;
GRANT SELECT (id, name, title, bio, photo_url, timezone, is_active, display_order,
              created_at, updated_at)
ON public.consultation_practitioners TO anon, authenticated;

-- 4. consultation_services: hide admin_note from all client roles
REVOKE SELECT ON public.consultation_services FROM anon, authenticated;
GRANT SELECT (id, name, slug, description, long_description, duration_minutes,
              buffer_before_minutes, buffer_after_minutes, price_usd, price_xcd, mode,
              practitioner_id, product_id, is_active, display_order, image_url,
              min_notice_hours, max_advance_days, max_per_day, created_at, updated_at,
              requires_payment, price_needs_confirmation, icon, duration_display_label)
ON public.consultation_services TO anon, authenticated;

-- 5. Internal policy helpers must not be directly callable by clients
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_order_owner_or_admin(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_consultation_access(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_wce_access(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_wce_order(uuid) FROM anon, authenticated;