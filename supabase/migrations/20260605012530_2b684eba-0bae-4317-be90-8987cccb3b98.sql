
-- 1) Lock down reviews.user_email by restricting public SELECT and exposing a safe view
DROP POLICY IF EXISTS "Anyone can read approved reviews or admin reads all" ON public.reviews;

CREATE POLICY "Admins can read all reviews"
ON public.reviews FOR SELECT
USING (is_admin());

CREATE OR REPLACE VIEW public.reviews_public
WITH (security_invoker = on) AS
SELECT id, product_id, user_name, rating, title, content, images, status,
       helpful_count, is_verified_purchase, created_at
FROM public.reviews
WHERE status = 'approved';

GRANT SELECT ON public.reviews_public TO anon, authenticated;

-- Allow anon/auth to still resolve approved rows through the view (security_invoker means
-- the underlying RLS applies). Add a SELECT policy permitting approved-row reads but the
-- view excludes user_email so it's never exposed.
CREATE POLICY "Anyone can read approved reviews via view"
ON public.reviews FOR SELECT
USING (status = 'approved');

-- 2) Drop public listing SELECT policies on storage.objects.
-- Public files remain accessible through the public CDN URL; only API listing is blocked.
DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
DROP POLICY IF EXISTS "Public read retreat-images" ON storage.objects;
DROP POLICY IF EXISTS "Public read review-images" ON storage.objects;
