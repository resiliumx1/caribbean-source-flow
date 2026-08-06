CREATE TABLE public.wce_organiser_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  invited_by uuid,
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wce_organiser_invites_status_check CHECK (status IN ('pending','accepted','revoked'))
);

CREATE UNIQUE INDEX wce_organiser_invites_email_key
  ON public.wce_organiser_invites (lower(email));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wce_organiser_invites TO authenticated;
GRANT ALL ON public.wce_organiser_invites TO service_role;

ALTER TABLE public.wce_organiser_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full admins manage organiser invites"
  ON public.wce_organiser_invites FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER wce_organiser_invites_updated_at
  BEFORE UPDATE ON public.wce_organiser_invites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();