
-- Add new columns to orders (nullable, safe defaults, keep existing)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS fulfillment_status text,
  ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS note text,
  ADD COLUMN IF NOT EXISTS shipping_address jsonb;

-- Backfill fulfillment_status from the legacy `status` field
UPDATE public.orders
SET fulfillment_status = CASE
  WHEN status IN ('shipped') THEN 'shipped'
  WHEN status IN ('delivered') THEN 'delivered'
  WHEN status IN ('cancelled') THEN 'cancelled'
  ELSE 'unfulfilled'
END
WHERE fulfillment_status IS NULL;

-- Normalize payment_status to the new vocabulary (paid/unpaid/refunded)
UPDATE public.orders
SET payment_status = 'unpaid'
WHERE payment_status IS NULL OR payment_status = 'pending';

-- Add unit_price to order_items, backfill from existing per-unit price_usd
ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS unit_price numeric;

UPDATE public.order_items
SET unit_price = price_usd
WHERE unit_price IS NULL;
