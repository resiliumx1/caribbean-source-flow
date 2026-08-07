ALTER TABLE public.consultation_calendly_events
  ADD COLUMN IF NOT EXISTS sent_confirmation_at timestamptz;