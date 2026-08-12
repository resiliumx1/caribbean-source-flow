-- Public-safe view of approved reviews: never exposes user_email.
-- security_invoker = false makes the view run with the view owner's privileges,
-- so it does not depend on a permissive public RLS policy on the underlying table.
CREATE OR REPLACE VIEW public.reviews_public WITH (security_invoker = false) AS
SELECT id,
       product_id,
       user_name,
       rating,
       title,
       content,
       images,
       status,
       helpful_count,
       is_verified_purchase,
       created_at
FROM public.reviews
WHERE status = 'approved';

ALTER VIEW public.reviews_public OWNER TO postgres;
GRANT SELECT ON public.reviews_public TO anon;
GRANT SELECT ON public.reviews_public TO authenticated;

-- Public-safe view of active practitioners: never exposes zoom_user_email.
CREATE OR REPLACE VIEW public.consultation_practitioners_public WITH (security_invoker = false) AS
SELECT id,
       name,
       title,
       bio,
       photo_url,
       timezone,
       is_active,
       display_order
FROM public.consultation_practitioners
WHERE is_active = true;

ALTER VIEW public.consultation_practitioners_public OWNER TO postgres;
GRANT SELECT ON public.consultation_practitioners_public TO anon;
GRANT SELECT ON public.consultation_practitioners_public TO authenticated;

-- Drop the public table policies that exposed sensitive columns.
DROP POLICY IF EXISTS "Anyone can read approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can view active practitioners" ON public.consultation_practitioners;