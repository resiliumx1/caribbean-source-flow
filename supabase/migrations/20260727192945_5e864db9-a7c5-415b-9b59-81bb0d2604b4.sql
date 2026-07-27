-- =========================
-- PAYMENT PLANS: archive
-- =========================
ALTER TABLE public.payment_plans
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by uuid,
  ADD COLUMN IF NOT EXISTS notes text;

-- =========================
-- PAYMENTS: status/refunds
-- =========================
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'succeeded',
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'payment',
  ADD COLUMN IF NOT EXISTS card_last4 text,
  ADD COLUMN IF NOT EXISTS card_type text,
  ADD COLUMN IF NOT EXISTS refunded_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS parent_payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reason text,
  ADD COLUMN IF NOT EXISTS admin_note text,
  ADD COLUMN IF NOT EXISTS created_by uuid;

-- =========================
-- AUDIT LOG
-- =========================
CREATE TABLE IF NOT EXISTS public.payment_plan_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.payment_plans(id) ON DELETE CASCADE,
  action text NOT NULL,
  changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid,
  actor_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payment_plan_audit TO authenticated;
GRANT ALL ON public.payment_plan_audit TO service_role;
ALTER TABLE public.payment_plan_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read plan audit" ON public.payment_plan_audit
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins write plan audit" ON public.payment_plan_audit
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- =========================
-- BILLING SCHEDULES
-- =========================
CREATE TABLE IF NOT EXISTS public.plan_billing_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.payment_plans(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  cadence text NOT NULL DEFAULT 'monthly',
  status text NOT NULL DEFAULT 'active',
  next_run_date date,
  last_run_at timestamptz,
  failure_count integer NOT NULL DEFAULT 0,
  last_error text,
  authnet_subscription_id text,
  customer_profile_id text,
  payment_profile_id text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_billing_schedules TO authenticated;
GRANT ALL ON public.plan_billing_schedules TO service_role;
ALTER TABLE public.plan_billing_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage billing schedules" ON public.plan_billing_schedules
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_plan_billing_schedules_updated
  BEFORE UPDATE ON public.plan_billing_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- COUPONS
-- =========================
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type text NOT NULL DEFAULT 'percent',
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  min_order_usd numeric NOT NULL DEFAULT 0,
  max_uses integer,
  max_uses_per_customer integer,
  used_count integer NOT NULL DEFAULT 0,
  product_ids uuid[] NOT NULL DEFAULT '{}',
  category_ids uuid[] NOT NULL DEFAULT '{}',
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coupons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active coupons" ON public.coupons
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage coupons" ON public.coupons
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_coupons_updated
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  email text,
  discount_usd numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coupon_redemptions TO authenticated;
GRANT ALL ON public.coupon_redemptions TO service_role;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read redemptions" ON public.coupon_redemptions
  FOR SELECT TO authenticated USING (public.is_admin());

-- =========================
-- ORDER REFUNDS
-- =========================
CREATE TABLE IF NOT EXISTS public.order_refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount_usd numeric NOT NULL CHECK (amount_usd > 0),
  reason text NOT NULL,
  admin_note text,
  transaction_id text,
  refund_transaction_id text,
  kind text NOT NULL DEFAULT 'refund',
  status text NOT NULL DEFAULT 'succeeded',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.order_refunds TO authenticated;
GRANT ALL ON public.order_refunds TO service_role;
ALTER TABLE public.order_refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read order refunds" ON public.order_refunds
  FOR SELECT TO authenticated USING (public.is_admin());

-- =========================
-- ABANDONED CARTS
-- =========================
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text,
  customer_name text,
  phone text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal_usd numeric NOT NULL DEFAULT 0,
  recovered boolean NOT NULL DEFAULT false,
  recovered_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.abandoned_carts TO authenticated;
GRANT ALL ON public.abandoned_carts TO service_role;
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage abandoned carts" ON public.abandoned_carts
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_abandoned_carts_updated
  BEFORE UPDATE ON public.abandoned_carts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- PRODUCTS: inventory
-- =========================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS track_inventory boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5;

-- =========================
-- ORDERS: discount fields
-- =========================
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS discount_usd numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coupon_code text,
  ADD COLUMN IF NOT EXISTS refunded_usd numeric NOT NULL DEFAULT 0;

-- =========================
-- REFUND APPLICATION FN
-- =========================
CREATE OR REPLACE FUNCTION public.apply_plan_refund(p_plan_id uuid, p_amount numeric)
RETURNS public.payment_plans
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_plan public.payment_plans;
BEGIN
  UPDATE public.payment_plans
     SET amount_paid = GREATEST(amount_paid - p_amount, 0),
         balance_remaining = GREATEST(total_amount - GREATEST(amount_paid - p_amount, 0), 0),
         status = CASE
           WHEN (total_amount - GREATEST(amount_paid - p_amount, 0)) > 0 AND status = 'paid' THEN 'active'
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
REVOKE EXECUTE ON FUNCTION public.apply_plan_refund(uuid, numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_plan_refund(uuid, numeric) TO service_role;

-- =========================
-- PLAN RLS: keep admin-only reads working with archive
-- =========================
CREATE INDEX IF NOT EXISTS idx_payments_plan_id ON public.payments(plan_id);
CREATE INDEX IF NOT EXISTS idx_payment_plan_audit_plan ON public.payment_plan_audit(plan_id);
CREATE INDEX IF NOT EXISTS idx_order_refunds_order ON public.order_refunds(order_id);