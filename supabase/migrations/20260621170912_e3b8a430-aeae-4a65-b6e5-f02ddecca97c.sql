
CREATE TABLE public.payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  package_name TEXT NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount > 0),
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  balance_remaining NUMERIC(12,2) NOT NULL,
  min_payment NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paid','cancelled')),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payment_plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_plans TO authenticated;
GRANT ALL ON public.payment_plans TO service_role;

ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view payment plans"
  ON public.payment_plans FOR SELECT
  USING (true);

CREATE POLICY "Admins manage payment plans"
  ON public.payment_plans FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER update_payment_plans_updated_at
  BEFORE UPDATE ON public.payment_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.payment_plans(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  paypal_capture_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX payments_plan_id_idx ON public.payments(plan_id);

GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.apply_payment(p_plan_id UUID, p_amount NUMERIC)
RETURNS public.payment_plans
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan public.payment_plans;
BEGIN
  UPDATE public.payment_plans
     SET amount_paid = amount_paid + p_amount,
         balance_remaining = GREATEST(total_amount - (amount_paid + p_amount), 0),
         status = CASE
           WHEN (total_amount - (amount_paid + p_amount)) <= 0 THEN 'paid'
           ELSE status
         END,
         updated_at = now()
   WHERE id = p_plan_id
   RETURNING * INTO v_plan;

  IF v_plan.id IS NULL THEN
    RAISE EXCEPTION 'Payment plan % not found', p_plan_id;
  END IF;

  RETURN v_plan;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_payment(UUID, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_payment(UUID, NUMERIC) TO service_role;
