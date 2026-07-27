CREATE OR REPLACE FUNCTION public.notify_on_failed_order_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (type, title, body)
  VALUES (
    'payment',
    'Payment captured but no order created',
    COALESCE(NEW.customer_name, NEW.customer_email, 'Unknown customer')
      || ' · $' || to_char(COALESCE(NEW.amount_usd, 0), 'FM999999990.00')
      || ' · txn ' || COALESCE(NEW.paypal_capture_id, 'n/a')
      || ' · ' || COALESCE(NEW.error_message, 'order insert failed')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_failed_order_alert ON public.failed_order_alerts;
CREATE TRIGGER trg_notify_failed_order_alert
AFTER INSERT ON public.failed_order_alerts
FOR EACH ROW EXECUTE FUNCTION public.notify_on_failed_order_alert();

CREATE OR REPLACE FUNCTION public.notify_on_payment_attempt_failure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.error_message IS NULL AND NEW.error_name IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (type, title, body)
  VALUES (
    'payment',
    CASE WHEN NEW.stage ILIKE 'webhook%'
      THEN 'Payment webhook failed'
      ELSE 'Payment attempt failed' END,
    COALESCE(NEW.stage, 'unknown stage')
      || COALESCE(' · ' || NEW.customer_email, '')
      || COALESCE(' · ' || NEW.error_name, '')
      || COALESCE(' · ' || NEW.error_message, '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_payment_attempt_failure ON public.payment_attempts;
CREATE TRIGGER trg_notify_payment_attempt_failure
AFTER INSERT ON public.payment_attempts
FOR EACH ROW EXECUTE FUNCTION public.notify_on_payment_attempt_failure();

REVOKE EXECUTE ON FUNCTION public.notify_on_failed_order_alert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_payment_attempt_failure() FROM PUBLIC, anon, authenticated;