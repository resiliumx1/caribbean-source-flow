
-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_name text NOT NULL,
  user_email text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  content text NOT NULL,
  images jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  helpful_count integer NOT NULL DEFAULT 0,
  is_verified_purchase boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved reviews or admin reads all"
  ON public.reviews FOR SELECT
  USING (status = 'approved' OR is_admin());

CREATE POLICY "Anyone can submit reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can update reviews"
  ON public.reviews FOR UPDATE
  USING (is_admin());

CREATE POLICY "Only admins can delete reviews"
  ON public.reviews FOR DELETE
  USING (is_admin());

-- Review helpfulness tracking
CREATE TABLE public.review_helpfulness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
  session_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(review_id, session_id)
);

ALTER TABLE public.review_helpfulness ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read helpfulness"
  ON public.review_helpfulness FOR SELECT
  USING (true);

CREATE POLICY "Anyone can vote helpful"
  ON public.review_helpfulness FOR INSERT
  WITH CHECK (true);

-- Storage bucket for review images
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true);

CREATE POLICY "Public can read review images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'review-images');

CREATE POLICY "Anyone can upload review images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'review-images' AND (octet_length(COALESCE(encode(''::bytea, 'base64'), '')) <= 2097152));

-- Verified purchase check function
CREATE OR REPLACE FUNCTION public.check_verified_purchase(p_email text, p_product_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.email = p_email
      AND oi.product_id = p_product_id
  );
$$;
