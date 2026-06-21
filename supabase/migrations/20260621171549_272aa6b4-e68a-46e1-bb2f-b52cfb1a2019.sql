
-- 1. Hide customer emails on reviews from public/signed-in non-admins via column-level grants.
REVOKE SELECT ON public.reviews FROM anon, authenticated;
GRANT SELECT (
  id, product_id, user_name, rating, title, content,
  images, status, helpful_count, is_verified_purchase, created_at
) ON public.reviews TO anon, authenticated;

-- 2. Restrict customer updates on their own retreat bookings to the customer_notes column only.
CREATE OR REPLACE FUNCTION public.restrict_customer_booking_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.payment_status         IS DISTINCT FROM OLD.payment_status
     OR NEW.status              IS DISTINCT FROM OLD.status
     OR NEW.amount_paid_usd     IS DISTINCT FROM OLD.amount_paid_usd
     OR NEW.balance_due_usd     IS DISTINCT FROM OLD.balance_due_usd
     OR NEW.total_usd           IS DISTINCT FROM OLD.total_usd
     OR NEW.paypal_order_id     IS DISTINCT FROM OLD.paypal_order_id
     OR NEW.paypal_capture_id   IS DISTINCT FROM OLD.paypal_capture_id
     OR NEW.user_id             IS DISTINCT FROM OLD.user_id
     OR NEW.retreat_date_id     IS DISTINCT FROM OLD.retreat_date_id
     OR NEW.retreat_type_id     IS DISTINCT FROM OLD.retreat_type_id
     OR NEW.email               IS DISTINCT FROM OLD.email
     OR NEW.customer_name       IS DISTINCT FROM OLD.customer_name
     OR NEW.phone               IS DISTINCT FROM OLD.phone
     OR NEW.guest_count         IS DISTINCT FROM OLD.guest_count
     OR NEW.deposit_usd         IS DISTINCT FROM OLD.deposit_usd
     OR NEW.admin_notes         IS DISTINCT FROM OLD.admin_notes
  THEN
    RAISE EXCEPTION 'Customers may only update customer_notes on their own retreat bookings';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS restrict_customer_booking_updates_trigger ON public.retreat_bookings;
CREATE TRIGGER restrict_customer_booking_updates_trigger
  BEFORE UPDATE ON public.retreat_bookings
  FOR EACH ROW EXECUTE FUNCTION public.restrict_customer_booking_updates();
