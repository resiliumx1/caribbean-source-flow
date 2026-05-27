-- 1. Add new columns to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_transaction_id text,
  ADD COLUMN IF NOT EXISTS customer_name text;

CREATE INDEX IF NOT EXISTS idx_orders_payment_transaction_id
  ON public.orders(payment_transaction_id);

-- Backfill customer_name for existing rows, then enforce NOT NULL
UPDATE public.orders SET customer_name = email WHERE customer_name IS NULL;
ALTER TABLE public.orders ALTER COLUMN customer_name SET NOT NULL;

-- 2. Allow guest checkout (anonymous insert when user_id is null)
DROP POLICY IF EXISTS "Guests can create orders without user_id" ON public.orders;
CREATE POLICY "Guests can create orders without user_id"
  ON public.orders FOR INSERT
  WITH CHECK (user_id IS NULL AND auth.uid() IS NULL);

-- Same for order_items belonging to guest orders
DROP POLICY IF EXISTS "Guests can insert items for guest orders" ON public.order_items;
CREATE POLICY "Guests can insert items for guest orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.user_id IS NULL
    )
  );

-- 3. Create order_status_history table
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  previous_status text,
  notes text,
  changed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_osh_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_osh_created_at ON public.order_status_history(created_at DESC);

GRANT SELECT, INSERT ON public.order_status_history TO authenticated;
GRANT ALL ON public.order_status_history TO service_role;

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners and admins view history" ON public.order_status_history;
CREATE POLICY "Owners and admins view history"
  ON public.order_status_history FOR SELECT
  USING (public.is_order_owner_or_admin(order_id));

DROP POLICY IF EXISTS "Admins insert history manually" ON public.order_status_history;
CREATE POLICY "Admins insert history manually"
  ON public.order_status_history FOR INSERT
  WITH CHECK (public.is_admin());

-- 4. Auto-trigger to log status changes
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.order_status_history (order_id, status, previous_status, changed_by)
    VALUES (NEW.id, COALESCE(NEW.status, 'pending'), NULL, auth.uid());
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_status_history (order_id, status, previous_status, changed_by)
    VALUES (NEW.id, NEW.status, OLD.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_order_status_change ON public.orders;
CREATE TRIGGER trg_log_order_status_change
AFTER INSERT OR UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();