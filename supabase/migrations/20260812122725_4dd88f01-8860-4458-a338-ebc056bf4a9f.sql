DROP POLICY IF EXISTS "Users see own tracking subscriptions" ON public.tracking_subscriptions;

CREATE POLICY "Users see own tracking subscriptions"
ON public.tracking_subscriptions
FOR SELECT
TO authenticated
USING (lower(contact) = lower(COALESCE(auth.email(), '')));

REVOKE ALL ON public.tracking_subscriptions FROM anon, authenticated;
GRANT ALL ON public.tracking_subscriptions TO service_role;