CREATE TABLE public.wce_partners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  logo_url text,
  url text,
  round boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.wce_partners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wce_partners TO authenticated;
GRANT ALL ON public.wce_partners TO service_role;

ALTER TABLE public.wce_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wce_partners published read" ON public.wce_partners
  FOR SELECT USING (published = true);
CREATE POLICY "wce_partners wce read all" ON public.wce_partners
  FOR SELECT TO authenticated USING (public.has_wce_access(auth.uid()));
CREATE POLICY "wce_partners wce write" ON public.wce_partners
  FOR ALL TO authenticated USING (public.has_wce_access(auth.uid())) WITH CHECK (public.has_wce_access(auth.uid()));

CREATE TRIGGER update_wce_partners_updated_at
  BEFORE UPDATE ON public.wce_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.wce_partners (name, url, round, display_order) VALUES
  ('Mount Kailash', 'https://mountkailashslu.com', true, 1),
  ('Kamila''s Kitchen', NULL, false, 2),
  ('Jah9', NULL, false, 3),
  ('LifeCraft in Jamaica', NULL, false, 4),
  ('The Ubuntu Movement', 'https://theubuntumovement.org/', false, 5);

ALTER TABLE public.wce_speakers ADD COLUMN IF NOT EXISTS bio_links jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.wce_speakers
SET bio_links = '[{"phrase":"The UBUNTU Movement USA, Inc.","url":"https://theubuntumovement.org/"}]'::jsonb
WHERE bio ILIKE '%UBUNTU Movement USA%';