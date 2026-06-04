
-- 1. notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('order','request','payment','stock','message')),
  title text NOT NULL,
  body text,
  is_read boolean NOT NULL DEFAULT false,
  related_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON public.notifications (is_read);

-- 2. Grants
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- 3. RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- No INSERT policy: only service_role / triggers insert.

-- 4. Realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications';
  END IF;
END $$;

-- 5. Trigger function: create notifications from order events
CREATE OR REPLACE FUNCTION public.notify_on_order_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_items text;
  v_count int;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT string_agg(product_name || ' ×' || quantity, ', '), COALESCE(SUM(quantity),0)
      INTO v_items, v_count
      FROM public.order_items WHERE order_id = NEW.id;

    INSERT INTO public.notifications (type, title, body, related_order_id)
    VALUES (
      'order',
      'New order placed',
      COALESCE(NEW.customer_name,'Customer') ||
        ' · ' || COALESCE(v_items,'no items') ||
        ' · $' || to_char(NEW.total_usd, 'FM999999990.00'),
      NEW.id
    );

    IF NEW.payment_status = 'paid' THEN
      INSERT INTO public.notifications (type, title, body, related_order_id)
      VALUES (
        'payment',
        'Payment received',
        COALESCE(NEW.customer_name,'Customer') ||
          ' · $' || to_char(NEW.total_usd, 'FM999999990.00') ||
          ' (' || COALESCE(NEW.payment_method,'unknown') || ')',
        NEW.id
      );
    END IF;

  ELSIF TG_OP = 'UPDATE'
        AND NEW.payment_status IS DISTINCT FROM OLD.payment_status
        AND NEW.payment_status = 'paid' THEN
    INSERT INTO public.notifications (type, title, body, related_order_id)
    VALUES (
      'payment',
      'Payment received',
      COALESCE(NEW.customer_name,'Customer') ||
        ' · $' || to_char(NEW.total_usd, 'FM999999990.00') ||
        ' (' || COALESCE(NEW.payment_method,'unknown') || ')',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_order_insert ON public.orders;
CREATE TRIGGER notify_on_order_insert
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_order_event();

DROP TRIGGER IF EXISTS notify_on_order_payment_update ON public.orders;
CREATE TRIGGER notify_on_order_payment_update
  AFTER UPDATE OF payment_status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_order_event();
