CREATE TABLE public.failed_order_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paypal_capture_id text NOT NULL,
  paypal_order_id text,
  customer_email text,
  customer_name text,
  amount_usd numeric,
  error_message text,
  payload jsonb,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.failed_order_alerts TO authenticated;
GRANT ALL ON public.failed_order_alerts TO service_role;

ALTER TABLE public.failed_order_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view failed order alerts"
  ON public.failed_order_alerts FOR SELECT
  TO authenticated USING (is_admin());

CREATE POLICY "Admins update failed order alerts"
  ON public.failed_order_alerts FOR UPDATE
  TO authenticated USING (is_admin());