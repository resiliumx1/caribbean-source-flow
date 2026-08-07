ALTER TABLE public.consultation_bookings
  ADD COLUMN IF NOT EXISTS package_purchase_email text,
  ADD COLUMN IF NOT EXISTS needs_verification boolean NOT NULL DEFAULT false;