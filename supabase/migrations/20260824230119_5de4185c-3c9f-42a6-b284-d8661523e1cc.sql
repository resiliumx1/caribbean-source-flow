DROP POLICY IF EXISTS "Organisers and admins can read WCE page events" ON public.wce_page_events;
CREATE POLICY "Organisers and admins can read WCE page events"
ON public.wce_page_events FOR SELECT TO authenticated
USING (public.has_wce_access(auth.uid()));
GRANT SELECT ON public.wce_page_events TO authenticated;
GRANT ALL ON public.wce_page_events TO service_role;