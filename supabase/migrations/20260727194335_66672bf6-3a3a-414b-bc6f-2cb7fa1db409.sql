ALTER TABLE public.abandoned_carts
  ADD COLUMN IF NOT EXISTS recovery_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS recovery_sent_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS admin_notes text;

CREATE INDEX IF NOT EXISTS abandoned_carts_last_seen_idx ON public.abandoned_carts (last_seen_at DESC);