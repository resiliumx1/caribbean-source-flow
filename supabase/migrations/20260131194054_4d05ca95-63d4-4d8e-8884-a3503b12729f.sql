-- =============================================
-- PHASE 1: RETREAT & CONCIERGE DATABASE SCHEMA
-- =============================================

-- 1. RETREAT TYPES (Group vs Solo configurations)
CREATE TABLE public.retreat_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('group', 'solo')),
  min_nights INTEGER NOT NULL DEFAULT 3,
  max_nights INTEGER NOT NULL DEFAULT 14,
  base_price_usd NUMERIC NOT NULL,
  price_type TEXT NOT NULL CHECK (price_type IN ('per_person', 'per_night')),
  max_capacity INTEGER NOT NULL DEFAULT 10,
  description TEXT,
  includes JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. RETREAT DATES (Available retreat periods)
CREATE TABLE public.retreat_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  retreat_type_id UUID NOT NULL REFERENCES public.retreat_types(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  spots_total INTEGER NOT NULL DEFAULT 10,
  spots_booked INTEGER NOT NULL DEFAULT 0,
  price_override_usd NUMERIC,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date > start_date),
  CONSTRAINT valid_spots CHECK (spots_booked <= spots_total)
);

-- 3. SOLO PRICING TIERS (Tiered nightly rates)
CREATE TABLE public.solo_pricing_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  min_nights INTEGER NOT NULL,
  max_nights INTEGER NOT NULL,
  nightly_rate_usd NUMERIC NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_night_range CHECK (max_nights >= min_nights)
);

-- 4. RETREAT BOOKINGS (Customer reservations)
CREATE TABLE public.retreat_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  retreat_type_id UUID NOT NULL REFERENCES public.retreat_types(id),
  retreat_date_id UUID REFERENCES public.retreat_dates(id),
  user_id UUID REFERENCES public.profiles(id),
  guest_count INTEGER NOT NULL DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_usd NUMERIC NOT NULL,
  deposit_usd NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'deposit_paid', 'full_paid')),
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. TESTIMONIALS (Multi-audience social proof)
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audience TEXT NOT NULL CHECK (audience IN ('b2b', 'b2c', 'retreat')),
  quote TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_title TEXT,
  condition_addressed TEXT,
  results TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. CONCIERGE CONVERSATIONS (AI chat history)
CREATE TABLE public.concierge_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  escalated BOOLEAN NOT NULL DEFAULT false,
  escalation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_retreat_dates_type ON public.retreat_dates(retreat_type_id);
CREATE INDEX idx_retreat_dates_range ON public.retreat_dates(start_date, end_date);
CREATE INDEX idx_retreat_bookings_user ON public.retreat_bookings(user_id);
CREATE INDEX idx_retreat_bookings_status ON public.retreat_bookings(status);
CREATE INDEX idx_testimonials_audience ON public.testimonials(audience);
CREATE INDEX idx_testimonials_featured ON public.testimonials(is_featured) WHERE is_featured = true;
CREATE INDEX idx_concierge_session ON public.concierge_conversations(session_id);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- RETREAT_TYPES: Public read, admin write
ALTER TABLE public.retreat_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active retreat types"
  ON public.retreat_types FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Admins can insert retreat types"
  ON public.retreat_types FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update retreat types"
  ON public.retreat_types FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete retreat types"
  ON public.retreat_types FOR DELETE
  USING (is_admin());

-- RETREAT_DATES: Public read published, admin write
ALTER TABLE public.retreat_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published retreat dates"
  ON public.retreat_dates FOR SELECT
  USING (is_published = true OR is_admin());

CREATE POLICY "Admins can insert retreat dates"
  ON public.retreat_dates FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update retreat dates"
  ON public.retreat_dates FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete retreat dates"
  ON public.retreat_dates FOR DELETE
  USING (is_admin());

-- SOLO_PRICING_TIERS: Public read, admin write
ALTER TABLE public.solo_pricing_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pricing tiers"
  ON public.solo_pricing_tiers FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert pricing tiers"
  ON public.solo_pricing_tiers FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update pricing tiers"
  ON public.solo_pricing_tiers FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete pricing tiers"
  ON public.solo_pricing_tiers FOR DELETE
  USING (is_admin());

-- RETREAT_BOOKINGS: User own data, admin all
ALTER TABLE public.retreat_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON public.retreat_bookings FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Authenticated users can create bookings"
  ON public.retreat_bookings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own pending bookings"
  ON public.retreat_bookings FOR UPDATE
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can delete bookings"
  ON public.retreat_bookings FOR DELETE
  USING (is_admin());

-- TESTIMONIALS: Public read, admin write
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view testimonials"
  ON public.testimonials FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert testimonials"
  ON public.testimonials FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update testimonials"
  ON public.testimonials FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete testimonials"
  ON public.testimonials FOR DELETE
  USING (is_admin());

-- CONCIERGE_CONVERSATIONS: User own data
ALTER TABLE public.concierge_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON public.concierge_conversations FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create conversations"
  ON public.concierge_conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own conversations"
  ON public.concierge_conversations FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE TRIGGER update_retreat_types_updated_at
  BEFORE UPDATE ON public.retreat_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_retreat_dates_updated_at
  BEFORE UPDATE ON public.retreat_dates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_retreat_bookings_updated_at
  BEFORE UPDATE ON public.retreat_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_concierge_conversations_updated_at
  BEFORE UPDATE ON public.concierge_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();