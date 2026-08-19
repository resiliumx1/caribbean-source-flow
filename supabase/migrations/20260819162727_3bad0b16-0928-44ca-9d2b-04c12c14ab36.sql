CREATE TABLE public.wce_page_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  session_id text NOT NULL,
  event_type text NOT NULL,
  event_target text,
  path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referral_code text,
  device_type text,
  country text,
  meta jsonb
);

CREATE INDEX wce_page_events_created_at_idx ON public.wce_page_events (created_at DESC);
CREATE INDEX wce_page_events_type_idx ON public.wce_page_events (event_type, created_at DESC);
CREATE INDEX wce_page_events_session_idx ON public.wce_page_events (session_id);

GRANT SELECT ON public.wce_page_events TO authenticated;
GRANT ALL ON public.wce_page_events TO service_role;

ALTER TABLE public.wce_page_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organisers and admins can read WCE page events"
ON public.wce_page_events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'wce_admin'));

UPDATE public.wce_settings SET
  lifecraft_body = 'A series of guided experiences woven through the Fortification Retreat, designed to support reflection, creative expression, intentional living, and deeper engagement with the week''s themes. LifeCraft activities run in sync with the retreat programme, including access to Chalice Station as a key component of the experience.',
  lifecraft_components = '[{"title": "Chalice Station", "body": "A guided space for stillness, reflection and shared presence within the retreat rhythm."}]'::jsonb
WHERE lifecraft_body ILIKE '%Jah9%' OR lifecraft_components::text ILIKE '%Jah9%';