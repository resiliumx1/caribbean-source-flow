-- Public (not signed in) reads must not call has_wce_access(): EXECUTE on that
-- function is intentionally revoked from anon, which was making every public WCE
-- read fail with "permission denied for function has_wce_access".
GRANT EXECUTE ON FUNCTION public.has_wce_access(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.has_wce_access(uuid) FROM anon;

DROP POLICY IF EXISTS "wce_speakers public read" ON public.wce_speakers;
CREATE POLICY "wce_speakers published read" ON public.wce_speakers
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "wce_speakers wce read all" ON public.wce_speakers
  FOR SELECT TO authenticated USING (public.has_wce_access(auth.uid()));

DROP POLICY IF EXISTS "wce_faqs public read" ON public.wce_faqs;
CREATE POLICY "wce_faqs published read" ON public.wce_faqs
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "wce_faqs wce read all" ON public.wce_faqs
  FOR SELECT TO authenticated USING (public.has_wce_access(auth.uid()));

DROP POLICY IF EXISTS "wce_media public read" ON public.wce_media;
CREATE POLICY "wce_media published read" ON public.wce_media
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "wce_media wce read all" ON public.wce_media
  FOR SELECT TO authenticated USING (public.has_wce_access(auth.uid()));

DROP POLICY IF EXISTS "wce_referral_codes public read active" ON public.wce_referral_codes;
CREATE POLICY "wce_referral_codes active read" ON public.wce_referral_codes
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "wce_referral_codes wce read all" ON public.wce_referral_codes
  FOR SELECT TO authenticated USING (public.has_wce_access(auth.uid()));