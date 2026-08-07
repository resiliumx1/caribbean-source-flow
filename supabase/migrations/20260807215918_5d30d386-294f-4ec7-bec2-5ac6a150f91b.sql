CREATE TABLE public.consultation_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.consultation_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultation_categories TO authenticated;
GRANT ALL ON public.consultation_categories TO service_role;

ALTER TABLE public.consultation_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active consultation categories"
  ON public.consultation_categories FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all consultation categories"
  ON public.consultation_categories FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can manage consultation categories"
  ON public.consultation_categories FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER update_consultation_categories_updated_at
  BEFORE UPDATE ON public.consultation_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.consultation_services
  ADD COLUMN category_id uuid REFERENCES public.consultation_categories(id) ON DELETE SET NULL;

CREATE INDEX idx_consultation_services_category ON public.consultation_services(category_id);