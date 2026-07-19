
CREATE TABLE public.wholesale_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  email text NOT NULL,
  business_type text,
  needs text,
  source text,
  whatsapp_sent boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.wholesale_leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.wholesale_leads TO authenticated;
GRANT ALL ON public.wholesale_leads TO service_role;
ALTER TABLE public.wholesale_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit wholesale lead" ON public.wholesale_leads
  FOR INSERT WITH CHECK (true);
CREATE POLICY "admins can view wholesale leads" ON public.wholesale_leads
  FOR SELECT USING (public.is_admin());
CREATE POLICY "admins can manage wholesale leads" ON public.wholesale_leads
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
