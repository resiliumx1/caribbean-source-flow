-- review_helpfulness: votes only readable by admins (site never reads them)
DROP POLICY IF EXISTS "Anyone can read helpfulness" ON public.review_helpfulness;
CREATE POLICY "Admins can read helpfulness" ON public.review_helpfulness FOR SELECT USING (public.is_admin());

-- product_variants: only variants of active products are public
DROP POLICY IF EXISTS "Anyone can view product variants" ON public.product_variants;
CREATE POLICY "Anyone can view variants of active products" ON public.product_variants FOR SELECT
USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_variants.product_id AND p.is_active));

-- store_settings: internal notification/recovery settings admin-only
DROP POLICY IF EXISTS "Anyone can view settings" ON public.store_settings;
CREATE POLICY "Anyone can view public store settings" ON public.store_settings FOR SELECT
USING (key IN ('currency_rate','whatsapp','saint_lucia_phone_1','saint_lucia_phone_2','store_info') OR public.is_admin());

-- webinar_videos / testimonials: only rows with real published content
DROP POLICY IF EXISTS "Anyone can view webinar videos" ON public.webinar_videos;
CREATE POLICY "Anyone can view published webinar videos" ON public.webinar_videos FOR SELECT
USING (public.is_admin() OR (youtube_video_id IS NOT NULL AND (published_at IS NULL OR published_at <= now())));
DROP POLICY IF EXISTS "Anyone can view testimonials" ON public.testimonials;
CREATE POLICY "Anyone can view testimonials with content" ON public.testimonials FOR SELECT
USING (public.is_admin() OR (length(btrim(coalesce(quote,''))) > 0 AND length(btrim(coalesce(author_name,''))) > 0));

-- wholesale_leads: validate public submissions
DROP POLICY IF EXISTS "anyone can submit wholesale lead" ON public.wholesale_leads;
CREATE POLICY "anyone can submit valid wholesale lead" ON public.wholesale_leads FOR INSERT
WITH CHECK (
  length(btrim(coalesce(company_name,''))) BETWEEN 1 AND 200
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND length(email) <= 255
  AND length(coalesce(needs,'')) <= 5000
  AND admin_notes IS NULL
  AND (status IS NULL OR status = 'new')
);

-- Retired WCE event: remove open access rules
DROP POLICY IF EXISTS "wce_leads anon insert" ON public.wce_leads;
DROP POLICY IF EXISTS "wce_leads authenticated insert" ON public.wce_leads;
DROP POLICY IF EXISTS "wce_settings public read" ON public.wce_settings;

-- Review images: uploads must go into the folder of an active product
DROP POLICY IF EXISTS "Anyone can upload review images" ON storage.objects;
CREATE POLICY "Anyone can upload review images for active products" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'review-images'
  AND EXISTS (SELECT 1 FROM public.products p WHERE p.id::text = (storage.foldername(name))[1] AND p.is_active)
  AND COALESCE((metadata->>'size')::bigint, 0) <= 2097152
  AND lower(COALESCE(metadata->>'mimetype','')) = ANY (ARRAY['image/jpeg','image/png','image/webp','image/gif'])
  AND lower(storage.extension(name)) = ANY (ARRAY['jpg','jpeg','png','webp','gif'])
);