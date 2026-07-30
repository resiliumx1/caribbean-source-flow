-- LEADS
CREATE TABLE public.wce_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  full_name text,
  email text,
  whatsapp text,
  country text,
  pathway_interest text,
  reason text,
  preferred_contact text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referral_code text,
  landing_path text,
  referrer text,
  consent_marketing boolean NOT NULL DEFAULT false,
  consent_timestamp timestamptz,
  ip_address text,
  user_agent text,
  status text NOT NULL DEFAULT 'new',
  notes text
);
GRANT INSERT ON public.wce_leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wce_leads TO authenticated;
GRANT ALL ON public.wce_leads TO service_role;
ALTER TABLE public.wce_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wce_leads anon insert" ON public.wce_leads FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "wce_leads authenticated insert" ON public.wce_leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "wce_leads admin select" ON public.wce_leads FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "wce_leads admin update" ON public.wce_leads FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "wce_leads admin delete" ON public.wce_leads FOR DELETE TO authenticated USING (public.is_admin());

-- SPEAKERS
CREATE TABLE public.wce_speakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  title text,
  theme text,
  bio text,
  portrait_url text,
  session_title text,
  session_time text,
  is_featured boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.wce_speakers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wce_speakers TO authenticated;
GRANT ALL ON public.wce_speakers TO service_role;
ALTER TABLE public.wce_speakers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wce_speakers public read" ON public.wce_speakers FOR SELECT TO anon, authenticated USING (published = true OR public.is_admin());
CREATE POLICY "wce_speakers admin write" ON public.wce_speakers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PATHWAYS
CREATE TABLE public.wce_pathways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  capacity int,
  sold_count int NOT NULL DEFAULT 0,
  is_open boolean NOT NULL DEFAULT true,
  is_highlighted boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.wce_pathways TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wce_pathways TO authenticated;
GRANT ALL ON public.wce_pathways TO service_role;
ALTER TABLE public.wce_pathways ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wce_pathways public read" ON public.wce_pathways FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "wce_pathways admin write" ON public.wce_pathways FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- REFERRAL CODES
CREATE TABLE public.wce_referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  code text NOT NULL UNIQUE,
  owner_name text,
  owner_type text,
  discount_percent numeric NOT NULL DEFAULT 0,
  use_count int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.wce_referral_codes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wce_referral_codes TO authenticated;
GRANT ALL ON public.wce_referral_codes TO service_role;
ALTER TABLE public.wce_referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wce_referral_codes public read active" ON public.wce_referral_codes FOR SELECT TO anon, authenticated USING (is_active = true OR public.is_admin());
CREATE POLICY "wce_referral_codes admin write" ON public.wce_referral_codes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- FAQS
CREATE TABLE public.wce_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  question text NOT NULL,
  answer text,
  display_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.wce_faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wce_faqs TO authenticated;
GRANT ALL ON public.wce_faqs TO service_role;
ALTER TABLE public.wce_faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wce_faqs public read" ON public.wce_faqs FOR SELECT TO anon, authenticated USING (published = true OR public.is_admin());
CREATE POLICY "wce_faqs admin write" ON public.wce_faqs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- MEDIA
CREATE TABLE public.wce_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  title text,
  thumbnail_url text,
  video_url text,
  category text,
  display_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.wce_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wce_media TO authenticated;
GRANT ALL ON public.wce_media TO service_role;
ALTER TABLE public.wce_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wce_media public read" ON public.wce_media FOR SELECT TO anon, authenticated USING (published = true OR public.is_admin());
CREATE POLICY "wce_media admin write" ON public.wce_media FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- SETTINGS
CREATE TABLE public.wce_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  hero_headline text,
  hero_subline text,
  event_dates text,
  venue text,
  popup_enabled boolean NOT NULL DEFAULT false,
  popup_flyer_url text,
  popup_cta_text text
);
GRANT SELECT ON public.wce_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wce_settings TO authenticated;
GRANT ALL ON public.wce_settings TO service_role;
ALTER TABLE public.wce_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wce_settings public read" ON public.wce_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "wce_settings admin write" ON public.wce_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER wce_settings_updated_at BEFORE UPDATE ON public.wce_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SEED
INSERT INTO public.wce_pathways (key, label, price, is_highlighted, display_order) VALUES
  ('in_person', 'Symposium Experience (In Person)', 70, false, 1),
  ('online', 'Symposium Experience (Online)', 50, false, 2),
  ('retreat', '6-Day Fortification Retreat and LifeCraft Experience', 0, true, 3);

INSERT INTO public.wce_speakers (name, title, theme, session_title, is_featured, display_order) VALUES
  ('Rt. Hon. Priest Kailash', NULL, 'Mind & Body', 'How Thoughts Materialize into Disease', true, 1),
  ('Jah9', NULL, 'Event Host', '', false, 2),
  ('Kamila McDonald', NULL, 'Well Fit', 'A session centered on cardio, strength, and joyful movement', false, 3),
  ('Dr. Bobby Price', 'Dr. Holistic', 'Gut Health', 'Parasites, disease and prevention', false, 4),
  ('Karlyn Percil-Mercieca', NULL, 'EQ', 'Focusing on Self Leadership, Cultural and Emotional Intelligence', false, 5),
  ('Ras Dr. Wayne Rose', NULL, 'Historical Roots', 'Past, Present, Future', false, 6),
  ('Bro. Rizza Islam', NULL, 'Call to Action', 'Ritual Closing', false, 7);

INSERT INTO public.wce_settings (event_dates, venue, popup_enabled) VALUES
  ('11-17 October 2026', 'Mount Kailash Rejuvenation Centre, St. Lucia', false);