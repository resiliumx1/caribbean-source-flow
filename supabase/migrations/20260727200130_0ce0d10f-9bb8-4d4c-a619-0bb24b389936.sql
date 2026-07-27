ALTER TABLE public.abandoned_carts
  ADD COLUMN IF NOT EXISTS reminder_stage integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_reminder_at timestamptz,
  ADD COLUMN IF NOT EXISTS webhook_synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS webhook_last_status text;

CREATE TABLE IF NOT EXISTS public.abandoned_cart_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid REFERENCES public.abandoned_carts(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  channel text,
  detail text,
  value_usd numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.abandoned_cart_events TO authenticated;
GRANT ALL ON public.abandoned_cart_events TO service_role;

ALTER TABLE public.abandoned_cart_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view cart events"
  ON public.abandoned_cart_events FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS abandoned_cart_events_created_idx
  ON public.abandoned_cart_events (created_at DESC);