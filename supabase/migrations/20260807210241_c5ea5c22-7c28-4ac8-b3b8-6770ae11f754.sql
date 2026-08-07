CREATE TABLE public.consultation_calendly_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendly_event_uri text NOT NULL UNIQUE,
  calendly_invitee_uri text,
  organizer_name text,
  organizer_email text,
  event_name text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  invitee_name text,
  invitee_email text,
  invitee_timezone text,
  status text NOT NULL DEFAULT 'active',
  location_type text,
  join_url text,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.consultation_calendly_events TO authenticated;
GRANT ALL ON public.consultation_calendly_events TO service_role;

ALTER TABLE public.consultation_calendly_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view imported Calendly sessions"
ON public.consultation_calendly_events
FOR SELECT TO authenticated
USING (public.is_admin());

CREATE INDEX idx_consultation_calendly_events_starts_at
  ON public.consultation_calendly_events (starts_at DESC);

CREATE TRIGGER update_consultation_calendly_events_updated_at
BEFORE UPDATE ON public.consultation_calendly_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();