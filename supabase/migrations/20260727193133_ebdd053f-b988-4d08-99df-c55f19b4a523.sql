ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status = ANY (ARRAY['pending','paid','failed','refunded','partially_refunded']));