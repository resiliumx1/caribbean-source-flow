
-- Tighten review INSERT policy with basic validation
DROP POLICY "Anyone can submit reviews" ON public.reviews;
CREATE POLICY "Anyone can submit reviews with validation"
  ON public.reviews FOR INSERT
  WITH CHECK (
    length(user_name) > 0 AND length(user_name) <= 100
    AND length(user_email) > 0 AND length(user_email) <= 255
    AND length(title) > 0 AND length(title) <= 200
    AND length(content) > 0 AND length(content) <= 5000
    AND status = 'pending'
  );

-- Tighten helpfulness INSERT policy
DROP POLICY "Anyone can vote helpful" ON public.review_helpfulness;
CREATE POLICY "Anyone can vote helpful with validation"
  ON public.review_helpfulness FOR INSERT
  WITH CHECK (
    length(session_id) >= 10 AND length(session_id) <= 100
  );
