ALTER TABLE public.consultation_services
  ADD COLUMN IF NOT EXISTS requires_payment boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS price_needs_confirmation boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS admin_note text;

ALTER TABLE public.consultation_services DROP COLUMN IF EXISTS category_id;
DROP TABLE IF EXISTS public.consultation_categories;

ALTER TABLE public.consultation_bookings
  ADD COLUMN IF NOT EXISTS package_email text,
  ADD COLUMN IF NOT EXISTS needs_verification boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS consultation_bookings_verify_idx
  ON public.consultation_bookings (needs_verification)
  WHERE needs_verification = true;