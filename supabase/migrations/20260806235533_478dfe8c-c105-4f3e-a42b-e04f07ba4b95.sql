-- ============ extensions ============
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============ practitioners ============
CREATE TABLE public.consultation_practitioners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text,
  bio text,
  photo_url text,
  timezone text NOT NULL DEFAULT 'America/St_Lucia',
  zoom_user_email text,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.consultation_practitioners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.consultation_practitioners TO authenticated;
GRANT ALL ON public.consultation_practitioners TO service_role;
ALTER TABLE public.consultation_practitioners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active practitioners"
  ON public.consultation_practitioners FOR SELECT
  TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can view all practitioners"
  ON public.consultation_practitioners FOR SELECT
  TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can manage practitioners"
  ON public.consultation_practitioners FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ services ============
CREATE TABLE public.consultation_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  long_description text,
  duration_minutes integer NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
  buffer_before_minutes integer NOT NULL DEFAULT 0 CHECK (buffer_before_minutes >= 0),
  buffer_after_minutes integer NOT NULL DEFAULT 0 CHECK (buffer_after_minutes >= 0),
  price_usd numeric NOT NULL DEFAULT 0 CHECK (price_usd >= 0),
  price_xcd numeric NOT NULL DEFAULT 0 CHECK (price_xcd >= 0),
  mode text NOT NULL DEFAULT 'both' CHECK (mode IN ('in_person','online','both')),
  practitioner_id uuid REFERENCES public.consultation_practitioners(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  image_url text,
  min_notice_hours integer NOT NULL DEFAULT 24 CHECK (min_notice_hours >= 0),
  max_advance_days integer NOT NULL DEFAULT 60 CHECK (max_advance_days > 0),
  max_per_day integer CHECK (max_per_day IS NULL OR max_per_day > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.consultation_services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.consultation_services TO authenticated;
GRANT ALL ON public.consultation_services TO service_role;
ALTER TABLE public.consultation_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active services"
  ON public.consultation_services FOR SELECT
  TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can view all services"
  ON public.consultation_services FOR SELECT
  TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can manage services"
  ON public.consultation_services FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ recurring weekly availability ============
CREATE TABLE public.consultation_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid NOT NULL REFERENCES public.consultation_practitioners(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);
CREATE INDEX consultation_availability_practitioner_idx
  ON public.consultation_availability (practitioner_id, day_of_week);
GRANT SELECT ON public.consultation_availability TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.consultation_availability TO authenticated;
GRANT ALL ON public.consultation_availability TO service_role;
ALTER TABLE public.consultation_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active availability"
  ON public.consultation_availability FOR SELECT
  TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can view all availability"
  ON public.consultation_availability FOR SELECT
  TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can manage availability"
  ON public.consultation_availability FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ date overrides ============
CREATE TABLE public.consultation_availability_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid NOT NULL REFERENCES public.consultation_practitioners(id) ON DELETE CASCADE,
  date date NOT NULL,
  is_available boolean NOT NULL DEFAULT false,
  start_time time,
  end_time time,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX consultation_overrides_practitioner_date_idx
  ON public.consultation_availability_overrides (practitioner_id, date);
GRANT SELECT ON public.consultation_availability_overrides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.consultation_availability_overrides TO authenticated;
GRANT ALL ON public.consultation_availability_overrides TO service_role;
ALTER TABLE public.consultation_availability_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view overrides"
  ON public.consultation_availability_overrides FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage overrides"
  ON public.consultation_availability_overrides FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ intake questions ============
CREATE TABLE public.consultation_intake_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.consultation_services(id) ON DELETE CASCADE,
  question text NOT NULL,
  type text NOT NULL DEFAULT 'text' CHECK (type IN ('text','textarea','select','checkbox')),
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_required boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX consultation_intake_service_idx
  ON public.consultation_intake_questions (service_id, display_order);
GRANT SELECT ON public.consultation_intake_questions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.consultation_intake_questions TO authenticated;
GRANT ALL ON public.consultation_intake_questions TO service_role;
ALTER TABLE public.consultation_intake_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active intake questions"
  ON public.consultation_intake_questions FOR SELECT
  TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can manage intake questions"
  ON public.consultation_intake_questions FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ bookings (rebuilt: table was empty) ============
DROP TABLE IF EXISTS public.consultation_bookings;

CREATE TABLE public.consultation_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  booking_reference text NOT NULL UNIQUE,
  service_id uuid REFERENCES public.consultation_services(id) ON DELETE SET NULL,
  practitioner_id uuid REFERENCES public.consultation_practitioners(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  customer_timezone text NOT NULL DEFAULT 'UTC',
  notes text,
  intake_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  mode text NOT NULL DEFAULT 'online' CHECK (mode IN ('in_person','online')),
  status text NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment','confirmed','completed','cancelled','no_show','rescheduled')),
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  discount_usd numeric NOT NULL DEFAULT 0,
  coupon_code text,
  payment_method text,
  payment_transaction_id text,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  zoom_join_url text,
  zoom_start_url text,
  zoom_meeting_id text,
  zoom_error text,
  manage_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ics_sequence integer NOT NULL DEFAULT 0,
  reminder_24h_sent_at timestamptz,
  reminder_1h_sent_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  rescheduled_from_id uuid REFERENCES public.consultation_bookings(id) ON DELETE SET NULL,
  reschedule_count integer NOT NULL DEFAULT 0,
  internal_notes text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referral_code text,
  landing_path text,
  user_agent text,
  ip_address text,
  CHECK (ends_at > starts_at)
);

CREATE INDEX consultation_bookings_starts_at_idx ON public.consultation_bookings (starts_at);
CREATE INDEX consultation_bookings_status_idx ON public.consultation_bookings (status);
CREATE INDEX consultation_bookings_email_idx ON public.consultation_bookings (lower(customer_email));
CREATE UNIQUE INDEX consultation_bookings_manage_token_idx ON public.consultation_bookings (manage_token);

-- non-negotiable double-booking prevention
ALTER TABLE public.consultation_bookings
  ADD CONSTRAINT consultation_bookings_no_overlap
  EXCLUDE USING gist (
    practitioner_id WITH =,
    tstzrange(starts_at, ends_at) WITH &&
  ) WHERE (status IN ('pending_payment','confirmed'));

-- bookings are never anonymously readable
GRANT SELECT ON public.consultation_bookings TO authenticated;
GRANT UPDATE, DELETE ON public.consultation_bookings TO authenticated;
GRANT ALL ON public.consultation_bookings TO service_role;
ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to consultation bookings"
  ON public.consultation_bookings FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Customers can view their own consultation bookings"
  ON public.consultation_bookings FOR SELECT
  TO authenticated
  USING (lower(customer_email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- ============ booking reference + updated_at ============
CREATE OR REPLACE FUNCTION public.generate_consultation_reference()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.booking_reference IS NULL OR NEW.booking_reference = '' THEN
    NEW.booking_reference := 'MKC' || to_char(now(), 'YYYYMMDD') || '-' ||
      LPAD(CAST(FLOOR(RANDOM() * 10000) AS text), 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_consultation_booking_reference
  BEFORE INSERT ON public.consultation_bookings
  FOR EACH ROW EXECUTE FUNCTION public.generate_consultation_reference();

CREATE TRIGGER consultation_bookings_updated_at
  BEFORE UPDATE ON public.consultation_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER consultation_practitioners_updated_at
  BEFORE UPDATE ON public.consultation_practitioners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER consultation_services_updated_at
  BEFORE UPDATE ON public.consultation_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER consultation_availability_updated_at
  BEFORE UPDATE ON public.consultation_availability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER consultation_overrides_updated_at
  BEFORE UPDATE ON public.consultation_availability_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER consultation_intake_updated_at
  BEFORE UPDATE ON public.consultation_intake_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ release abandoned holds ============
CREATE OR REPLACE FUNCTION public.expire_pending_consultation_bookings()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.consultation_bookings
     SET status = 'cancelled',
         cancelled_at = now(),
         cancellation_reason = 'Payment not completed within 20 minutes'
   WHERE status = 'pending_payment'
     AND created_at < now() - interval '20 minutes';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
REVOKE ALL ON FUNCTION public.expire_pending_consultation_bookings() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_pending_consultation_bookings() TO service_role;

SELECT cron.schedule(
  'expire-pending-consultation-bookings',
  '*/5 * * * *',
  $$SELECT public.expire_pending_consultation_bookings();$$
);

-- ============ seed ============
INSERT INTO public.consultation_practitioners
  (name, title, bio, timezone, is_active, display_order)
VALUES (
  'Rt. Hon. Priest Kailash',
  'Herbal Physician & Founder, Mount Kailash Rejuvenation Centre',
  'Rt. Hon. Priest Kailash is a herbal physician and the founder of Mount Kailash Rejuvenation Centre in Saint Lucia. He has spent decades working with the island''s mineral rich soil and its botanicals, guiding people through fortification and rejuvenation rooted in traditional practice.',
  'America/St_Lucia',
  true,
  0
);

INSERT INTO public.consultation_services
  (name, slug, description, long_description, duration_minutes,
   buffer_before_minutes, buffer_after_minutes, price_usd, price_xcd,
   mode, practitioner_id, is_active, display_order,
   min_notice_hours, max_advance_days)
SELECT
  'Private Consultation with Rt. Hon. Priest Kailash',
  'private-consultation',
  'A private one hour consultation with Rt. Hon. Priest Kailash, in person in Saint Lucia or online.',
  'One full hour with Rt. Hon. Priest Kailash to speak openly about your health. He listens to your history, the symptoms you are living with and what you have already tried, then sets out a herbal path suited to you — which botanicals, in what form, and in what order. You leave with a clear protocol and an understanding of why each part of it matters.',
  60, 0, 15, 300, 810,
  'both', p.id, true, 0, 24, 60
FROM public.consultation_practitioners p
WHERE p.name = 'Rt. Hon. Priest Kailash';

-- Monday to Friday, 9am to 4pm Saint Lucia time
INSERT INTO public.consultation_availability (practitioner_id, day_of_week, start_time, end_time)
SELECT p.id, d, '09:00'::time, '16:00'::time
FROM public.consultation_practitioners p, generate_series(1,5) AS d
WHERE p.name = 'Rt. Hon. Priest Kailash';