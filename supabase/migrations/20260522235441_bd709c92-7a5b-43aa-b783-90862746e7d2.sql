
-- 1. Protect profiles.is_admin via trigger
DROP TRIGGER IF EXISTS protect_admin_flag_trigger ON public.profiles;
CREATE TRIGGER protect_admin_flag_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_admin_flag();

-- 2. Reviews: hide user_email from public reads, expose to admins via RPC
REVOKE SELECT (user_email) ON public.reviews FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_get_reviews(p_status text DEFAULT 'all', p_sort text DEFAULT 'newest')
RETURNS TABLE (
  id uuid,
  product_id uuid,
  user_name text,
  user_email text,
  rating integer,
  title text,
  content text,
  images jsonb,
  status text,
  helpful_count integer,
  is_verified_purchase boolean,
  created_at timestamptz,
  product_name text,
  product_slug text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  RETURN QUERY
  SELECT r.id, r.product_id, r.user_name, r.user_email, r.rating, r.title, r.content,
         r.images, r.status, r.helpful_count, r.is_verified_purchase, r.created_at,
         p.name AS product_name, p.slug AS product_slug
  FROM public.reviews r
  LEFT JOIN public.products p ON p.id = r.product_id
  WHERE (p_status = 'all' OR r.status = p_status)
  ORDER BY
    CASE WHEN p_sort = 'rating_high' THEN r.rating END DESC,
    CASE WHEN p_sort = 'rating_low' THEN r.rating END ASC,
    CASE WHEN p_sort NOT IN ('rating_high','rating_low') THEN r.created_at END DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_get_reviews(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_get_reviews(text, text) TO authenticated;

-- 3. Retreat bookings INSERT - enforce ownership
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON public.retreat_bookings;
CREATE POLICY "Authenticated users can create bookings"
  ON public.retreat_bookings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- 4. Orders INSERT - enforce authenticated user owns the row
DROP POLICY IF EXISTS "Authenticated users can create own orders" ON public.orders;
CREATE POLICY "Authenticated users can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 5. Concierge conversations - tighten INSERT
DROP POLICY IF EXISTS "Service can create conversations" ON public.concierge_conversations;
CREATE POLICY "Anyone can create own conversations"
  ON public.concierge_conversations FOR INSERT
  WITH CHECK (
    session_id IS NOT NULL
    AND length(session_id) BETWEEN 10 AND 100
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- 6. Review images bucket - fix broken size check
DROP POLICY IF EXISTS "Anyone can upload review images" ON storage.objects;
CREATE POLICY "Anyone can upload review images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'review-images'
    AND COALESCE((metadata->>'size')::bigint, 0) <= 2097152
  );

-- 7. Public buckets - remove broad listing (public URLs still work via public bucket flag)
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view retreat images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read review images" ON storage.objects;

-- 8. Lock down SECURITY DEFINER helpers from direct public calls
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_order_owner_or_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_admin_flag() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM PUBLIC, anon, authenticated;
-- keep check_verified_purchase callable (used by client when submitting reviews)
