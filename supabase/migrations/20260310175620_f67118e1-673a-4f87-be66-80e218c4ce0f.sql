
-- Create conditions table
CREATE TABLE public.product_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_conditions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view conditions" ON public.product_conditions FOR SELECT USING (true);
CREATE POLICY "Admins can insert conditions" ON public.product_conditions FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update conditions" ON public.product_conditions FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete conditions" ON public.product_conditions FOR DELETE USING (is_admin());

-- Junction table for many-to-many product-condition assignments
CREATE TABLE public.product_condition_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  condition_id uuid NOT NULL REFERENCES public.product_conditions(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(product_id, condition_id)
);

-- Enable RLS
ALTER TABLE public.product_condition_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view assignments" ON public.product_condition_assignments FOR SELECT USING (true);
CREATE POLICY "Admins can insert assignments" ON public.product_condition_assignments FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update assignments" ON public.product_condition_assignments FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete assignments" ON public.product_condition_assignments FOR DELETE USING (is_admin());
