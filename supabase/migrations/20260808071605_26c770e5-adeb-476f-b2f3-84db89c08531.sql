-- 1. Settings ---------------------------------------------------------------
ALTER TABLE public.wce_settings
  ADD COLUMN IF NOT EXISTS livestream_provider text,
  ADD COLUMN IF NOT EXISTS livestream_embed_url text,
  ADD COLUMN IF NOT EXISTS livestream_embed_code text,
  ADD COLUMN IF NOT EXISTS livestream_fallback_copy text,
  ADD COLUMN IF NOT EXISTS lifecraft_heading text,
  ADD COLUMN IF NOT EXISTS lifecraft_body text,
  ADD COLUMN IF NOT EXISTS lifecraft_components jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS mailchimp_audience_id text DEFAULT '8d387bfd96',
  ADD COLUMN IF NOT EXISTS mailchimp_server_prefix text DEFAULT 'us8',
  ADD COLUMN IF NOT EXISTS retreat_checkout_expiry_days integer NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS online_product_id uuid,
  ADD COLUMN IF NOT EXISTS retreat_product_id uuid;

-- 2. Retreat application workflow on wce_leads -------------------------------
ALTER TABLE public.wce_leads
  ADD COLUMN IF NOT EXISTS application_status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS declined_at timestamptz,
  ADD COLUMN IF NOT EXISTS decline_reason text,
  ADD COLUMN IF NOT EXISTS checkout_token text,
  ADD COLUMN IF NOT EXISTS checkout_token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS checkout_token_used_at timestamptz,
  ADD COLUMN IF NOT EXISTS checkout_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS order_id uuid,
  ADD COLUMN IF NOT EXISTS meta_event_ids jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS mailchimp_status text,
  ADD COLUMN IF NOT EXISTS mailchimp_error text,
  ADD COLUMN IF NOT EXISTS mailchimp_synced_at timestamptz;

ALTER TABLE public.wce_leads DROP CONSTRAINT IF EXISTS wce_leads_application_status_check;
ALTER TABLE public.wce_leads ADD CONSTRAINT wce_leads_application_status_check
  CHECK (application_status IN ('new','reviewing','approved','declined','checkout_sent','paid'));

CREATE UNIQUE INDEX IF NOT EXISTS wce_leads_checkout_token_key
  ON public.wce_leads (checkout_token) WHERE checkout_token IS NOT NULL;

-- 3. Livestream entitlements -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wce_livestream_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  email text NOT NULL,
  access_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  email_sent_at timestamptz,
  source text NOT NULL DEFAULT 'purchase',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS wce_livestream_entitlements_order_email_key
  ON public.wce_livestream_entitlements (COALESCE(order_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(email));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wce_livestream_entitlements TO authenticated;
GRANT ALL ON public.wce_livestream_entitlements TO service_role;

ALTER TABLE public.wce_livestream_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wce entitlements wce select" ON public.wce_livestream_entitlements
  FOR SELECT TO authenticated USING (public.has_wce_access(auth.uid()));
CREATE POLICY "wce entitlements wce insert" ON public.wce_livestream_entitlements
  FOR INSERT TO authenticated WITH CHECK (public.has_wce_access(auth.uid()));
CREATE POLICY "wce entitlements wce update" ON public.wce_livestream_entitlements
  FOR UPDATE TO authenticated USING (public.has_wce_access(auth.uid()))
  WITH CHECK (public.has_wce_access(auth.uid()));
CREATE POLICY "wce entitlements wce delete" ON public.wce_livestream_entitlements
  FOR DELETE TO authenticated USING (public.has_wce_access(auth.uid()));

CREATE TRIGGER wce_livestream_entitlements_updated_at
  BEFORE UPDATE ON public.wce_livestream_entitlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Auto-grant on purchase of the online symposium product ------------------
CREATE OR REPLACE FUNCTION public.wce_grant_livestream_entitlement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_online_product uuid;
  v_email text;
BEGIN
  SELECT online_product_id INTO v_online_product FROM public.wce_settings LIMIT 1;
  IF v_online_product IS NULL OR NEW.product_id IS DISTINCT FROM v_online_product THEN
    RETURN NEW;
  END IF;

  SELECT email INTO v_email FROM public.orders WHERE id = NEW.order_id;
  IF v_email IS NULL OR btrim(v_email) = '' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.wce_livestream_entitlements (order_id, email, source)
  VALUES (NEW.order_id, lower(btrim(v_email)), 'purchase')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS wce_grant_livestream_entitlement_trg ON public.order_items;
CREATE TRIGGER wce_grant_livestream_entitlement_trg
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.wce_grant_livestream_entitlement();

REVOKE EXECUTE ON FUNCTION public.wce_grant_livestream_entitlement() FROM PUBLIC, anon, authenticated;