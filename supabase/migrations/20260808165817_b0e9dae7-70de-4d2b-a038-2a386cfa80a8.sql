CREATE TABLE public.wce_itinerary (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date_label text NOT NULL,
  title text NOT NULL,
  detail text,
  display_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.wce_itinerary TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wce_itinerary TO authenticated;
GRANT ALL ON public.wce_itinerary TO service_role;

ALTER TABLE public.wce_itinerary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wce_itinerary public read" ON public.wce_itinerary
  FOR SELECT TO anon, authenticated USING (published = true);

CREATE POLICY "wce_itinerary wce read all" ON public.wce_itinerary
  FOR SELECT TO authenticated USING (has_wce_access(auth.uid()));

CREATE POLICY "wce_itinerary wce write" ON public.wce_itinerary
  FOR ALL TO authenticated USING (has_wce_access(auth.uid())) WITH CHECK (has_wce_access(auth.uid()));

CREATE TRIGGER update_wce_itinerary_updated_at
  BEFORE UPDATE ON public.wce_itinerary
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.wce_itinerary (date_label, title, detail, display_order) VALUES
  ('Sunday, October 11', 'The Caribbean Wellness Symposium and opening experience', 'The wider Caribbean Wellness Experience begins with the public Symposium, bringing together speakers, practical perspectives, movement, culture and community at Mount Kailash.', 1),
  ('Monday, October 12', 'Arrival, grounding and entering the Mount Kailash environment', NULL, 2),
  ('Tuesday, October 13', 'Breath, body, food and discipline', NULL, 3),
  ('Wednesday, October 14', 'Herbal traditions, reflection and the Chalice experience', NULL, 4),
  ('Thursday, October 15', 'Care, family, community and order', NULL, 5),
  ('Friday, October 16', 'Purpose, responsibility and the continuation plan', NULL, 6),
  ('Saturday, October 17', 'Closing, re-entry and An Evening with Jah9', NULL, 7);

ALTER TABLE public.wce_leads
  ADD COLUMN IF NOT EXISTS participation_notes text,
  ADD COLUMN IF NOT EXISTS dietary_notes text;