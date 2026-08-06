CREATE POLICY "Invitee can mark own invite accepted"
ON public.wce_organiser_invites
FOR UPDATE
TO authenticated
USING (lower(email) = lower(COALESCE(auth.jwt() ->> 'email', '')))
WITH CHECK (
  lower(email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
  AND status = 'accepted'
);

GRANT SELECT, UPDATE ON public.wce_organiser_invites TO authenticated;