CREATE TABLE public.powertranz_test_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL,
  card_brand text,
  card_last4 text CHECK (card_last4 ~ '^[0-9]{0,4}$'),
  approved boolean NOT NULL DEFAULT false,
  iso_response_code text,
  response_message text,
  transaction_identifier text,
  amount numeric,
  currency text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.powertranz_test_log TO authenticated;
GRANT ALL ON public.powertranz_test_log TO service_role;
ALTER TABLE public.powertranz_test_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read powertranz test log" ON public.powertranz_test_log
  FOR SELECT TO authenticated USING (public.is_admin());