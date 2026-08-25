-- 1. Configurable short-link slug per pathway ------------------------------
ALTER TABLE public.wce_pathways
  ADD COLUMN IF NOT EXISTS link_slug text;

UPDATE public.wce_pathways
   SET link_slug = replace(key, '_', '-')
 WHERE link_slug IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS wce_pathways_link_slug_key
  ON public.wce_pathways (link_slug) WHERE link_slug IS NOT NULL;

-- 2. Saved campaign links --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wce_campaign_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  pathway_key text NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referral_code text,
  click_count integer NOT NULL DEFAULT 0,
  last_clicked_at timestamptz,
  is_active boolean NOT NULL DEFAULT true
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wce_campaign_links TO authenticated;
GRANT ALL ON public.wce_campaign_links TO service_role;

ALTER TABLE public.wce_campaign_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "WCE staff read campaign links" ON public.wce_campaign_links;
CREATE POLICY "WCE staff read campaign links"
  ON public.wce_campaign_links FOR SELECT TO authenticated
  USING (public.has_wce_access(auth.uid()));

DROP POLICY IF EXISTS "WCE staff insert campaign links" ON public.wce_campaign_links;
CREATE POLICY "WCE staff insert campaign links"
  ON public.wce_campaign_links FOR INSERT TO authenticated
  WITH CHECK (public.has_wce_access(auth.uid()));

DROP POLICY IF EXISTS "WCE staff update campaign links" ON public.wce_campaign_links;
CREATE POLICY "WCE staff update campaign links"
  ON public.wce_campaign_links FOR UPDATE TO authenticated
  USING (public.has_wce_access(auth.uid())) WITH CHECK (public.has_wce_access(auth.uid()));

DROP POLICY IF EXISTS "WCE staff delete campaign links" ON public.wce_campaign_links;
CREATE POLICY "WCE staff delete campaign links"
  ON public.wce_campaign_links FOR DELETE TO authenticated
  USING (public.has_wce_access(auth.uid()));

-- 3. Public click counter. Only ever increments a counter — no row is
--    readable through it, so anonymous ad traffic can register a click.
CREATE OR REPLACE FUNCTION public.wce_campaign_link_click(_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.wce_campaign_links
     SET click_count = click_count + 1,
         last_clicked_at = now()
   WHERE id = _id AND is_active;
$$;

REVOKE ALL ON FUNCTION public.wce_campaign_link_click(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wce_campaign_link_click(uuid) TO anon, authenticated, service_role;