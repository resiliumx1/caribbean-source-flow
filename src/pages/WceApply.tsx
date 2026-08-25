/** Focused retreat application view — /wce-2026/apply.
 *
 *  The landing target for the retreat campaign link: a compact branded header,
 *  a single line confirming what is being applied for, then the existing
 *  application form. No hero video, no scrolling past sections, and no checkout
 *  route — the retreat is application-only (apply → review → approval → private
 *  checkout link → payment).
 */
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { WceThemeProvider } from "@/components/wce/WceThemeProvider";
import { WceApplicationForm } from "@/components/wce/SectionsMid";
import { DiamondRule, GoldFlourish } from "@/components/wce/decor";
import { WCE_PATHWAY_EVENT } from "@/components/wce/pathway-select";
import { captureAttribution } from "@/lib/wce-attribution";
import { SITE_URL } from "@/lib/site-config";

const PAGE_URL = `${SITE_URL}/wce-2026/apply`;
const OG_IMAGE = `${SITE_URL}/og/wce-2026.jpg`;
const TITLE = "Apply · Caribbean Wellness Fortification Retreat | 12–17 October 2026";
const DESCRIPTION =
  "Apply for the six-day Caribbean Wellness Fortification Retreat at Mount Kailash Rejuvenation Centre, Saint Lucia, 12–17 October 2026. Applications are reviewed personally by the Mount Kailash team.";

export default function WceApply() {
  const { search } = useLocation();

  useEffect(() => {
    captureAttribution();
    // Preselect the retreat in the form's pathway field, without scrolling.
    const t = window.setTimeout(
      () => window.dispatchEvent(new CustomEvent(WCE_PATHWAY_EVENT, { detail: "retreat" })),
      120,
    );
    return () => window.clearTimeout(t);
  }, []);

  return (
    <WceThemeProvider>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Mount Kailash Rejuvenation Centre" />
        <meta property="og:title" content="Apply · Caribbean Wellness Fortification Retreat" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:secure_url" content={OG_IMAGE} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Apply · Caribbean Wellness Fortification Retreat" />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Helmet>

      <header
        className="wce-surface px-6 pt-14 pb-10 text-center"
        style={{ background: "var(--wce-panel-warm)" }}
      >
        <GoldFlourish className="mx-auto" size={50} />
        <p className="wce-eyebrow mt-5" style={{ color: "var(--wce-gold-text)", letterSpacing: "0.3em" }}>
          Caribbean Wellness Saint Lucia 2026
        </p>
        <h1
          className="mt-4 text-[clamp(1.7rem,4.4vw,2.6rem)] leading-[1.12]"
          style={{ color: "var(--wce-ink-strong)", fontFamily: "var(--wce-display)" }}
        >
          Caribbean Wellness Fortification Retreat
        </h1>
        <DiamondRule className="mx-auto mt-6 max-w-[10rem]" />
        <p className="mt-6 text-[0.95rem]" style={{ color: "rgba(var(--wce-ink-rgb), 0.9)" }}>
          You are applying for the six-day retreat, 12–17 October 2026, at Mount Kailash Rejuvenation
          Centre, Saint Lucia. Applications are reviewed personally before any payment is arranged.
        </p>
        <p className="mt-5 text-[0.85rem]">
          <Link
            to={`/wce-2026${search}`}
            className="underline underline-offset-4"
            style={{ color: "var(--wce-gold-text)" }}
          >
            Prefer to read the full programme first?
          </Link>
        </p>
      </header>

      <main>
        <WceApplicationForm />
      </main>
    </WceThemeProvider>
  );
}
