
DO $$ BEGIN
  CREATE TYPE public.wholesale_lead_status AS ENUM ('new','contacted','qualified','converted','lost');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.wholesale_leads
  ADD COLUMN IF NOT EXISTS status public.wholesale_lead_status NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS wholesale_leads_status_idx ON public.wholesale_leads(status);
CREATE INDEX IF NOT EXISTS wholesale_leads_created_at_idx ON public.wholesale_leads(created_at DESC);

DROP TRIGGER IF EXISTS wholesale_leads_updated_at ON public.wholesale_leads;
CREATE TRIGGER wholesale_leads_updated_at
  BEFORE UPDATE ON public.wholesale_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
