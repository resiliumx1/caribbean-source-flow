
-- Products: digital flag
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_digital boolean NOT NULL DEFAULT false;

-- Orders: allow 'pickup' as a delivery_type
DO $$
DECLARE
  conname text;
BEGIN
  SELECT c.conname INTO conname
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
  WHERE t.relname = 'orders'
    AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) ILIKE '%delivery_type%';
  IF conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT %I', conname);
  END IF;
END$$;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_delivery_type_check
  CHECK (delivery_type IN ('local','international','pickup'));

-- Retreat bookings: payment option + balance + paypal refs
ALTER TABLE public.retreat_bookings
  ADD COLUMN IF NOT EXISTS payment_option text NOT NULL DEFAULT 'full',
  ADD COLUMN IF NOT EXISTS amount_paid_usd numeric,
  ADD COLUMN IF NOT EXISTS balance_due_usd numeric,
  ADD COLUMN IF NOT EXISTS paypal_order_id text,
  ADD COLUMN IF NOT EXISTS paypal_capture_id text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'retreat_bookings_payment_option_check'
  ) THEN
    ALTER TABLE public.retreat_bookings
      ADD CONSTRAINT retreat_bookings_payment_option_check
      CHECK (payment_option IN ('full','deposit'));
  END IF;
END$$;
