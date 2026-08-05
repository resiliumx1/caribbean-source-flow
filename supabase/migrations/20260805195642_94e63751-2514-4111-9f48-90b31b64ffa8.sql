ALTER TABLE public.wce_pathways
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id) ON DELETE SET NULL;

ALTER TABLE public.wce_referral_codes
  ADD COLUMN IF NOT EXISTS last_woo_coupon_found boolean,
  ADD COLUMN IF NOT EXISTS last_used_at timestamptz;

CREATE TABLE IF NOT EXISTS public.wce_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  woo_order_id bigint,
  order_number text,
  email text,
  pathway_key text,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referral_code text,
  status text NOT NULL DEFAULT 'pending'
);

GRANT SELECT ON public.wce_orders TO authenticated;
GRANT ALL ON public.wce_orders TO service_role;

ALTER TABLE public.wce_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view WCE orders"
  ON public.wce_orders FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS wce_orders_created_at_idx ON public.wce_orders (created_at DESC);