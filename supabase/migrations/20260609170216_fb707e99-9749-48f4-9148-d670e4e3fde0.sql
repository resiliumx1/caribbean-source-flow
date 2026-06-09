CREATE TABLE IF NOT EXISTS public.legacy_woocommerce_orders (
  order_id bigint PRIMARY KEY,
  order_date timestamptz NOT NULL,
  status text NOT NULL,
  order_total numeric(12,2),
  currency text,
  first_name text,
  last_name text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  postcode text,
  country text,
  payment_method text,
  items text
);
CREATE INDEX IF NOT EXISTS idx_legacy_wc_orders_date ON public.legacy_woocommerce_orders (order_date DESC);
CREATE INDEX IF NOT EXISTS idx_legacy_wc_orders_status ON public.legacy_woocommerce_orders (status);
CREATE INDEX IF NOT EXISTS idx_legacy_wc_orders_email ON public.legacy_woocommerce_orders (email);

GRANT SELECT ON public.legacy_woocommerce_orders TO authenticated;
GRANT ALL ON public.legacy_woocommerce_orders TO service_role;

ALTER TABLE public.legacy_woocommerce_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read legacy orders"
  ON public.legacy_woocommerce_orders
  FOR SELECT
  TO authenticated
  USING (public.is_admin());