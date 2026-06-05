
-- Switch the view back to security_invoker so it respects RLS, then enforce
-- column-level privileges on the underlying table.
DROP VIEW IF EXISTS public.reviews_public;
CREATE VIEW public.reviews_public
WITH (security_invoker = on) AS
SELECT id, product_id, user_name, rating, title, content, images, status,
       helpful_count, is_verified_purchase, created_at
FROM public.reviews
WHERE status = 'approved';

GRANT SELECT ON public.reviews_public TO anon, authenticated;

-- Restore public read access for approved rows, but only on non-sensitive columns.
CREATE POLICY "Anyone can read approved reviews"
ON public.reviews FOR SELECT
USING (status = 'approved');

-- Revoke broad SELECT and re-grant only non-sensitive columns to anon/authenticated.
REVOKE SELECT ON public.reviews FROM anon, authenticated;
GRANT SELECT (id, product_id, user_name, rating, title, content, images, status,
              helpful_count, is_verified_purchase, created_at)
  ON public.reviews TO anon, authenticated;
