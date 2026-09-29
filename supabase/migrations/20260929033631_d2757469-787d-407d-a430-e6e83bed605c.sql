GRANT SELECT (id, product_id, user_name, rating, title, content, images, status, helpful_count, is_verified_purchase, created_at) ON public.reviews TO authenticated;
GRANT UPDATE, DELETE ON public.reviews TO authenticated;

CREATE OR REPLACE FUNCTION public.increment_review_helpful(p_review_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.reviews SET helpful_count = COALESCE(helpful_count,0) + 1
  WHERE id = p_review_id AND status = 'approved';
$$;
REVOKE ALL ON FUNCTION public.increment_review_helpful(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_review_helpful(uuid) TO anon, authenticated;