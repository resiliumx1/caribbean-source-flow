-- 1. ROLE INFRASTRUCTURE ------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'wce_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  UNIQUE (user_id, role)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Read: own roles, or everything for full admins.
CREATE POLICY "user_roles self or admin select"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- Write: FULL ADMINS ONLY. wce_admin cannot grant roles to self or anyone.
CREATE POLICY "user_roles admin insert"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "user_roles admin update"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "user_roles admin delete"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.is_admin());

-- Generic role check (security definer, fixed search_path -> no recursive RLS).
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- WCE access = wce_admin role OR existing full admin. is_admin() is NOT changed.
CREATE OR REPLACE FUNCTION public.has_wce_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role IN ('wce_admin', 'admin')
    )
    OR COALESCE((SELECT is_admin FROM public.profiles WHERE id = _user_id), false);
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_wce_access(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_wce_access(uuid) TO authenticated, service_role;

-- 2. RESCOPE THE SEVEN WCE TABLES ---------------------------------------------
-- wce_leads (no anon SELECT; anon INSERT preserved untouched)
DROP POLICY IF EXISTS "wce_leads admin select" ON public.wce_leads;
DROP POLICY IF EXISTS "wce_leads admin update" ON public.wce_leads;
DROP POLICY IF EXISTS "wce_leads admin delete" ON public.wce_leads;
CREATE POLICY "wce_leads wce select" ON public.wce_leads FOR SELECT TO authenticated
  USING (public.has_wce_access(auth.uid()));
CREATE POLICY "wce_leads wce update" ON public.wce_leads FOR UPDATE TO authenticated
  USING (public.has_wce_access(auth.uid())) WITH CHECK (public.has_wce_access(auth.uid()));
CREATE POLICY "wce_leads wce delete" ON public.wce_leads FOR DELETE TO authenticated
  USING (public.has_wce_access(auth.uid()));

-- wce_speakers
DROP POLICY IF EXISTS "wce_speakers admin write" ON public.wce_speakers;
DROP POLICY IF EXISTS "wce_speakers public read" ON public.wce_speakers;
CREATE POLICY "wce_speakers wce write" ON public.wce_speakers FOR ALL TO authenticated
  USING (public.has_wce_access(auth.uid())) WITH CHECK (public.has_wce_access(auth.uid()));
CREATE POLICY "wce_speakers public read" ON public.wce_speakers FOR SELECT TO anon, authenticated
  USING (published = true OR public.has_wce_access(auth.uid()));

-- wce_pathways
DROP POLICY IF EXISTS "wce_pathways admin write" ON public.wce_pathways;
CREATE POLICY "wce_pathways wce write" ON public.wce_pathways FOR ALL TO authenticated
  USING (public.has_wce_access(auth.uid())) WITH CHECK (public.has_wce_access(auth.uid()));

-- wce_referral_codes
DROP POLICY IF EXISTS "wce_referral_codes admin write" ON public.wce_referral_codes;
DROP POLICY IF EXISTS "wce_referral_codes public read active" ON public.wce_referral_codes;
CREATE POLICY "wce_referral_codes wce write" ON public.wce_referral_codes FOR ALL TO authenticated
  USING (public.has_wce_access(auth.uid())) WITH CHECK (public.has_wce_access(auth.uid()));
CREATE POLICY "wce_referral_codes public read active" ON public.wce_referral_codes FOR SELECT TO anon, authenticated
  USING (is_active = true OR public.has_wce_access(auth.uid()));

-- wce_faqs
DROP POLICY IF EXISTS "wce_faqs admin write" ON public.wce_faqs;
DROP POLICY IF EXISTS "wce_faqs public read" ON public.wce_faqs;
CREATE POLICY "wce_faqs wce write" ON public.wce_faqs FOR ALL TO authenticated
  USING (public.has_wce_access(auth.uid())) WITH CHECK (public.has_wce_access(auth.uid()));
CREATE POLICY "wce_faqs public read" ON public.wce_faqs FOR SELECT TO anon, authenticated
  USING (published = true OR public.has_wce_access(auth.uid()));

-- wce_media
DROP POLICY IF EXISTS "wce_media admin write" ON public.wce_media;
DROP POLICY IF EXISTS "wce_media public read" ON public.wce_media;
CREATE POLICY "wce_media wce write" ON public.wce_media FOR ALL TO authenticated
  USING (public.has_wce_access(auth.uid())) WITH CHECK (public.has_wce_access(auth.uid()));
CREATE POLICY "wce_media public read" ON public.wce_media FOR SELECT TO anon, authenticated
  USING (published = true OR public.has_wce_access(auth.uid()));

-- wce_settings
DROP POLICY IF EXISTS "wce_settings admin write" ON public.wce_settings;
CREATE POLICY "wce_settings wce write" ON public.wce_settings FOR ALL TO authenticated
  USING (public.has_wce_access(auth.uid())) WITH CHECK (public.has_wce_access(auth.uid()));

-- 3. ORDERS: WCE-SCOPED READ ONLY ---------------------------------------------
CREATE POLICY "orders wce admin select wce only"
  ON public.orders FOR SELECT TO authenticated
  USING (
    public.has_wce_access(auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.order_items oi
      JOIN public.wce_pathways wp ON wp.product_id = oi.product_id
      WHERE oi.order_id = orders.id
    )
  );

CREATE POLICY "order_items wce admin select wce only"
  ON public.order_items FOR SELECT TO authenticated
  USING (
    public.has_wce_access(auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.order_items oi2
      JOIN public.wce_pathways wp ON wp.product_id = oi2.product_id
      WHERE oi2.order_id = order_items.order_id
    )
  );