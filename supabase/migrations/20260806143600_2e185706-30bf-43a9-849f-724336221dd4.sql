ALTER TABLE public.wce_organiser_invites
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS resend_count integer NOT NULL DEFAULT 0;

-- Backfill: existing pending invites get a 12h window from when they were sent.
UPDATE public.wce_organiser_invites
   SET expires_at = COALESCE(expires_at, invited_at + interval '12 hours'),
       last_sent_at = COALESCE(last_sent_at, invited_at)
 WHERE status = 'pending';

CREATE OR REPLACE FUNCTION public.wce_accept_own_invite()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_count int := 0;
BEGIN
  IF v_email = '' THEN
    RETURN false;
  END IF;

  UPDATE public.wce_organiser_invites
     SET status = 'accepted',
         accepted_at = now(),
         expires_at = NULL
   WHERE lower(email) = v_email
     AND status <> 'revoked'
     AND (status = 'accepted' OR expires_at IS NULL OR expires_at > now());

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$function$;