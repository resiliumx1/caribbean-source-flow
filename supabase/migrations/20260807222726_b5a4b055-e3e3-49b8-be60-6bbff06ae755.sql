-- 1. Access helper (SECURITY DEFINER so policies never read RLS-protected tables directly)
CREATE OR REPLACE FUNCTION public.has_consultation_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('consultation_editor', 'admin')
  )
  OR COALESCE((SELECT is_admin FROM public.profiles WHERE id = _user_id), false);
$$;

REVOKE ALL ON FUNCTION public.has_consultation_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_consultation_access(uuid) TO authenticated, service_role;

-- 2. Consultation editor policies on the six consultation surfaces
CREATE POLICY "Consultation editors manage services" ON public.consultation_services
  FOR ALL TO authenticated
  USING (public.has_consultation_access(auth.uid()))
  WITH CHECK (public.has_consultation_access(auth.uid()));

CREATE POLICY "Consultation editors manage practitioners" ON public.consultation_practitioners
  FOR ALL TO authenticated
  USING (public.has_consultation_access(auth.uid()))
  WITH CHECK (public.has_consultation_access(auth.uid()));

CREATE POLICY "Consultation editors manage availability" ON public.consultation_availability
  FOR ALL TO authenticated
  USING (public.has_consultation_access(auth.uid()))
  WITH CHECK (public.has_consultation_access(auth.uid()));

CREATE POLICY "Consultation editors manage overrides" ON public.consultation_availability_overrides
  FOR ALL TO authenticated
  USING (public.has_consultation_access(auth.uid()))
  WITH CHECK (public.has_consultation_access(auth.uid()));

CREATE POLICY "Consultation editors manage bookings" ON public.consultation_bookings
  FOR ALL TO authenticated
  USING (public.has_consultation_access(auth.uid()))
  WITH CHECK (public.has_consultation_access(auth.uid()));

CREATE POLICY "Consultation editors manage intake questions" ON public.consultation_intake_questions
  FOR ALL TO authenticated
  USING (public.has_consultation_access(auth.uid()))
  WITH CHECK (public.has_consultation_access(auth.uid()));

CREATE POLICY "Consultation editors read settings" ON public.consultation_settings
  FOR SELECT TO authenticated
  USING (public.has_consultation_access(auth.uid()));

CREATE POLICY "Consultation editors write settings" ON public.consultation_settings
  FOR ALL TO authenticated
  USING (public.has_consultation_access(auth.uid()))
  WITH CHECK (public.has_consultation_access(auth.uid()));

CREATE POLICY "Consultation editors read Calendly archive" ON public.consultation_calendly_events
  FOR SELECT TO authenticated
  USING (public.has_consultation_access(auth.uid()));

-- 3. Invite records, mirroring the organiser invite pattern
CREATE TABLE public.consultation_editor_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  display_name text,
  invited_by uuid,
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  expires_at timestamptz,
  last_sent_at timestamptz,
  resend_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX consultation_editor_invites_email_key
  ON public.consultation_editor_invites (lower(email));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultation_editor_invites TO authenticated;
GRANT ALL ON public.consultation_editor_invites TO service_role;

ALTER TABLE public.consultation_editor_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full admins manage consultation editor invites"
  ON public.consultation_editor_invites
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER update_consultation_editor_invites_updated_at
  BEFORE UPDATE ON public.consultation_editor_invites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Invitee marks their own invite accepted without needing table access
CREATE OR REPLACE FUNCTION public.consultation_accept_own_invite()
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

  UPDATE public.consultation_editor_invites
     SET status = 'accepted',
         accepted_at = now(),
         expires_at = NULL
   WHERE lower(email) = v_email
     AND status <> 'revoked'
     AND (status = 'accepted' OR expires_at IS NULL OR expires_at > now());

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.consultation_accept_own_invite() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consultation_accept_own_invite() TO authenticated;

-- 5. Consultations notification address, stored not hardcoded
INSERT INTO public.consultation_settings (key, value)
VALUES (
  'consultation_notifications',
  jsonb_build_object(
    'label', 'Consultations notification address',
    'notify_email', 'Mountkailashherbalschool@gmail.com'
  )
)
ON CONFLICT (key) DO UPDATE
  SET value = public.consultation_settings.value
        || jsonb_build_object(
             'label', 'Consultations notification address',
             'notify_email', 'Mountkailashherbalschool@gmail.com'
           ),
      updated_at = now();