
DROP POLICY IF EXISTS "Anyone can read approved reviews via view" ON public.reviews;

-- Recreate the view as SECURITY DEFINER (default) so it reads approved rows with
-- the view owner's privileges. The view still excludes user_email.
DROP VIEW IF EXISTS public.reviews_public;
CREATE VIEW public.reviews_public AS
SELECT id, product_id, user_name, rating, title, content, images, status,
       helpful_count, is_verified_purchase, created_at
FROM public.reviews
WHERE status = 'approved';

GRANT SELECT ON public.reviews_public TO anon, authenticated;
