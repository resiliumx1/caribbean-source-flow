CREATE OR REPLACE FUNCTION public.wce_accept_own_invite()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_count int := 0;
BEGIN
  IF v_email = '' THEN
    RETURN false;
  END IF;

  UPDATE public.wce_organiser_invites
     SET status = 'accepted',
         accepted_at = now()
   WHERE lower(email) = v_email
     AND status <> 'revoked';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.wce_accept_own_invite() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.wce_accept_own_invite() TO authenticated;