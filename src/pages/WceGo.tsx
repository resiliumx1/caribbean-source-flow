/** Direct campaign link resolver — /wce-2026/go/:slug and /wce/go/:slug.
 *
 *  Sends paid-social traffic straight to the right action while preserving every
 *  query parameter (utm_* and ref) so attribution reaches the order or lead.
 *
 *  The retreat pathway is application-only: this route must never send anyone to
 *  checkout for it. It lands on the focused application view instead.
 */
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { WceThemeProvider } from "@/components/wce/WceThemeProvider";
import { GoldFlourish } from "@/components/wce/decor";
import { captureAttribution, rememberPathway } from "@/lib/wce-attribution";
import { addProductToExistingCart } from "@/lib/wce-go-cart";
import { pathwayLinkSlug } from "@/lib/wce-links";
import { dataLayerPush } from "@/lib/tracking";
import { trackWceEvent } from "@/components/wce/analytics";
import { WCE_META_EVENTS, wceMetaTrack } from "@/components/wce/meta-events";
import { pathwayCopy } from "@/components/wce/campaign";

export default function WceGo() {
  const { slug } = useParams<{ slug: string }>();
  const { search } = useLocation();
  const navigate = useNavigate();
  const ran = useRef(false);
  const [message, setMessage] = useState("Preparing your place…");

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // Capture utm_* / ref from this URL before we navigate anywhere.
    captureAttribution();
    const params = new URLSearchParams(search);
    const campaignLinkId = params.get("cl");
    if (campaignLinkId) {
      void supabase.rpc("wce_campaign_link_click", { _id: campaignLinkId }).then(() => {}, () => {});
    }
    // The redirect target keeps every parameter, minus our internal link id.
    params.delete("cl");
    const qs = params.toString();
    const suffix = qs ? `?${qs}` : "";

    const fallback = (key?: string) => {
      const fb = new URLSearchParams(qs);
      if (key) fb.set("pathway", key);
      const fq = fb.toString();
      navigate(`/wce-2026${fq ? `?${fq}` : ""}#pathways`, { replace: true });
    };

    (async () => {
      const { data: rows } = await supabase
        .from("wce_pathways")
        .select("key, label, price, currency, product_id, is_open, link_slug")
        .order("display_order");

      const pathways = rows ?? [];
      const p =
        pathways.find((r) => pathwayLinkSlug(r) === slug) ??
        pathways.find((r) => r.key === slug) ??
        null;

      if (!p) { fallback(); return; }

      rememberPathway(p.key);
      const copy = pathwayCopy(p.key);

      /* ---- Retreat: application only. Never checkout. ---- */
      if (p.key === "retreat") {
        setMessage("Opening your application…");
        dataLayerPush("lead_intent", {
          pathway_key: p.key,
          pathway_label: p.label,
          source: "campaign_link",
        });
        trackWceEvent("cta_click", "Campaign link · Retreat application", {
          cta_location: "campaign_link",
          pathway_key: p.key,
        });
        trackWceEvent("campaign_link_click", p.key, {
          pathway_key: p.key,
          pathway_label: p.label,
          destination: "application",
        });
        wceMetaTrack(WCE_META_EVENTS.retreatView, {
          content_name: copy?.title ?? p.label,
          funnel: "retreat",
        });
        navigate(`/wce-2026/apply${suffix}`, { replace: true });
        return;
      }

      /* ---- Symposium tiers: add to the existing cart, then checkout ---- */
      if (!p.is_open || !p.product_id) { fallback(p.key); return; }

      const { data: product } = await supabase
        .from("products")
        .select("id, name, price_usd, is_active")
        .eq("id", p.product_id)
        .maybeSingle();

      if (!product || product.is_active === false) { fallback(p.key); return; }

      const price = Number(p.price);
      dataLayerPush("begin_checkout", {
        pathway_key: p.key,
        source: "campaign_link",
        value: price,
        currency: p.currency || "USD",
        items: [{ item_id: product.id, item_name: p.label, price, quantity: 1 }],
      });
      trackWceEvent("cta_click", `Campaign link · ${p.label}`, {
        cta_location: "campaign_link",
        pathway_key: p.key,
      });
      trackWceEvent("campaign_link_click", p.key, {
        pathway_key: p.key,
        pathway_label: p.label,
        destination: "checkout",
      });
      wceMetaTrack(WCE_META_EVENTS.initiateCheckout, {
        content_name: copy?.title ?? p.label,
        content_ids: [product.id],
        value: price,
        currency: p.currency || "USD",
        funnel: "symposium",
      });

      try {
        await addProductToExistingCart(product.id, 1);
      } catch {
        fallback(p.key);
        return;
      }
      setMessage("Taking you to checkout…");
      navigate(`/checkout${suffix}`, { replace: true });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WceThemeProvider>
      <Helmet>
        <title>Caribbean Wellness Saint Lucia 2026</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <main
        className="wce-surface flex min-h-[70vh] flex-col items-center justify-center px-6 text-center"
        style={{ background: "var(--wce-panel)" }}
        aria-live="polite"
      >
        <GoldFlourish size={58} />
        <p className="wce-eyebrow mt-6" style={{ color: "var(--wce-gold-text)", letterSpacing: "0.3em" }}>
          Caribbean Wellness Saint Lucia 2026
        </p>
        <p
          className="mt-4 text-[1.15rem]"
          style={{ color: "var(--wce-ink-strong)", fontFamily: "var(--wce-display)" }}
        >
          {message}
        </p>
      </main>
    </WceThemeProvider>
  );
}
