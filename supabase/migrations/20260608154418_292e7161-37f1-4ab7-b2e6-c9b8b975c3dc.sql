CREATE TABLE public.payment_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage TEXT NOT NULL,
  error_name TEXT,
  error_message TEXT,
  paypal_debug_id TEXT,
  paypal_order_id TEXT,
  cart_total_usd NUMERIC(10,2),
  customer_email TEXT,
  user_agent TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payment_attempts TO authenticated;
GRANT ALL ON public.payment_attempts TO service_role;

ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read payment attempts"
  ON public.payment_attempts
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE INDEX payment_attempts_created_at_idx ON public.payment_attempts (created_at DESC);