
-- =========================================================
-- 1) Reviews: revoke broad SELECT and re-grant excluding user_email
-- =========================================================
REVOKE ALL ON public.reviews FROM anon, authenticated;

GRANT SELECT (
  id, product_id, user_name, rating, title, content,
  images, status, helpful_count, is_verified_purchase, created_at
) ON public.reviews TO anon, authenticated;

-- Insert still allowed (RLS validates content); all columns including user_email
GRANT INSERT ON public.reviews TO anon, authenticated;

-- Admin moderation from dashboard runs as authenticated; RLS restricts to is_admin()
GRANT UPDATE, DELETE ON public.reviews TO authenticated;

GRANT ALL ON public.reviews TO service_role;

-- =========================================================
-- 2) Orders: restrict non-admin UPDATEs to customer_notes only
-- =========================================================
CREATE OR REPLACE FUNCTION public.restrict_customer_order_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service role (edge functions) and admins may change anything
  IF auth.role() = 'service_role' OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Customers may ONLY change customer_notes on their own orders.
  IF NEW.payment_status        IS DISTINCT FROM OLD.payment_status
     OR NEW.status             IS DISTINCT FROM OLD.status
     OR NEW.admin_notes        IS DISTINCT FROM OLD.admin_notes
     OR NEW.whatsapp_notes     IS DISTINCT FROM OLD.whatsapp_notes
     OR NEW.total_usd          IS DISTINCT FROM OLD.total_usd
     OR NEW.total_xcd          IS DISTINCT FROM OLD.total_xcd
     OR NEW.subtotal_usd       IS DISTINCT FROM OLD.subtotal_usd
     OR NEW.subtotal_xcd       IS DISTINCT FROM OLD.subtotal_xcd
     OR NEW.shipping_usd       IS DISTINCT FROM OLD.shipping_usd
     OR NEW.shipping_xcd       IS DISTINCT FROM OLD.shipping_xcd
     OR NEW.currency_used      IS DISTINCT FROM OLD.currency_used
     OR NEW.user_id            IS DISTINCT FROM OLD.user_id
     OR NEW.order_number       IS DISTINCT FROM OLD.order_number
     OR NEW.tracking_number    IS DISTINCT FROM OLD.tracking_number
     OR NEW.tracking_carrier   IS DISTINCT FROM OLD.tracking_carrier
     OR NEW.payment_method     IS DISTINCT FROM OLD.payment_method
     OR NEW.payment_transaction_id IS DISTINCT FROM OLD.payment_transaction_id
     OR NEW.delivery_type      IS DISTINCT FROM OLD.delivery_type
     OR NEW.delivery_zone_id   IS DISTINCT FROM OLD.delivery_zone_id
     OR NEW.shipping_rate_id   IS DISTINCT FROM OLD.shipping_rate_id
     OR NEW.email              IS DISTINCT FROM OLD.email
     OR NEW.customer_name      IS DISTINCT FROM OLD.customer_name
     OR NEW.phone              IS DISTINCT FROM OLD.phone
     OR NEW.address_line1      IS DISTINCT FROM OLD.address_line1
     OR NEW.address_line2      IS DISTINCT FROM OLD.address_line2
     OR NEW.city               IS DISTINCT FROM OLD.city
     OR NEW.state_province     IS DISTINCT FROM OLD.state_province
     OR NEW.postal_code        IS DISTINCT FROM OLD.postal_code
     OR NEW.country            IS DISTINCT FROM OLD.country
  THEN
    RAISE EXCEPTION 'Customers may only update customer_notes on their own orders';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS restrict_customer_order_updates_trigger ON public.orders;
CREATE TRIGGER restrict_customer_order_updates_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.restrict_customer_order_updates();
