CREATE TABLE public.tracking_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('email','sms')),
  contact text NOT NULL,
  last_known_status text,
  last_known_fulfillment text,
  last_known_tracking text,
  verified boolean NOT NULL DEFAULT false,
  verify_token uuid NOT NULL DEFAULT gen_random_uuid(),
  unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid(),
  active boolean NOT NULL DEFAULT true,
  last_notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX tracking_subs_unique
  ON public.tracking_subscriptions (order_id, channel, lower(contact));
CREATE INDEX tracking_subs_active_verified
  ON public.tracking_subscriptions (active, verified) WHERE active AND verified;
CREATE INDEX tracking_subs_verify_token ON public.tracking_subscriptions (verify_token);
CREATE INDEX tracking_subs_unsub_token ON public.tracking_subscriptions (unsubscribe_token);

GRANT SELECT, INSERT, UPDATE ON public.tracking_subscriptions TO authenticated;
GRANT ALL ON public.tracking_subscriptions TO service_role;

ALTER TABLE public.tracking_subscriptions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can see only their own subscriptions (matched by email)
CREATE POLICY "Users see own tracking subscriptions"
  ON public.tracking_subscriptions FOR SELECT
  TO authenticated
  USING (channel = 'email' AND lower(contact) = lower(coalesce(auth.email(), '')));

-- No anon access; inserts go through service-role edge function.
-- Admins (already covered by service_role from edge functions / dashboards).

CREATE TRIGGER tracking_subs_updated_at
  BEFORE UPDATE ON public.tracking_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
