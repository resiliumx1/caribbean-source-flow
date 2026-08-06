CREATE TABLE public.consultation_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.consultation_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultation_settings TO authenticated;
GRANT ALL ON public.consultation_settings TO service_role;

ALTER TABLE public.consultation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read consultation settings" ON public.consultation_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage consultation settings" ON public.consultation_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.consultation_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  amount_paid_usd numeric NOT NULL,
  payment_transaction_id text,
  payment_method text DEFAULT 'authorize.net',
  status text NOT NULL DEFAULT 'paid',
  calendly_event_uri text,
  scheduled_at timestamp with time zone,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referral_code text,
  landing_path text,
  user_agent text,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.consultation_bookings TO anon;
GRANT SELECT, INSERT ON public.consultation_bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultation_bookings TO service_role;

ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage consultation bookings" ON public.consultation_bookings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Users can view own consultation bookings by email" ON public.consultation_bookings FOR SELECT USING (auth.jwt() ->> 'email' = email);

CREATE TRIGGER update_consultation_bookings_updated_at BEFORE UPDATE ON public.consultation_bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_consultation_settings_updated_at BEFORE UPDATE ON public.consultation_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default consultation settings
INSERT INTO public.consultation_settings (key, value) VALUES
  ('consultation', '{"fee_usd": 150, "calendly_username": "mountkailashrejuvenationcenter", "calendly_event_slug": "30min", "duration_minutes": 30, "notice_hours": 24, "title": "Private Healing Consultation"}'::jsonb)
ON CONFLICT (key) DO NOTHING;