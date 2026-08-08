/** Fortification Retreat closing band. The supporting detail (who it is for,
 *  the 21-day arc, what is included, accommodation & investment) now lives in
 *  the expandable cards in RetreatCards.tsx, directly beneath the CTA band.
 *  The retreat is never presented as purchasable: every CTA leads to the
 *  application form, which the Mount Kailash team reviews before payment. */
import { Reveal, MaskedHeading } from "./motion";
import { CornerVine } from "./ornaments";
import { FlowerOfLifeField, LeafIcon } from "./decor";
import { trackWceCta } from "./cta-tracking";

/* ---------------- Closing band ---------------- */
export function WceFortifiedBanner() {
  return (
    <section
      className="relative overflow-hidden px-6 py-20 text-center sm:py-24"
      style={{ background: "var(--wce-band-mid)", borderTop: "1px solid rgba(var(--wce-gold-rgb), 0.3)" }}
    >
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.05} light />
      <CornerVine className="pointer-events-none absolute left-4 top-4 opacity-45" />
      <CornerVine flip className="pointer-events-none absolute right-4 top-4 opacity-45" />
      <div className="relative mx-auto max-w-3xl">
        <MaskedHeading
          lines={["Ready to Be Fortified?"]}
          className="text-[clamp(1.9rem,5vw,3.1rem)]"
          style={{ color: "var(--wce-cream)" }}
        />
        <Reveal index={1}>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: "rgba(var(--wce-cream-rgb), 0.9)" }}>
            October 12–17, 2026 at Mount Kailash Rejuvenation Centre. Applications are reviewed personally, and
            places are limited.
          </p>
          <a
            href="#apply"
            className="wce-btn wce-btn-gold wce-shimmer-btn mt-10 w-full sm:w-auto"
            onClick={() => trackWceCta("apply", "fortified_banner", "Begin Your Application")}
          >
            <LeafIcon tone="var(--wce-ink-strong)" size={13} />
            <span>Begin Your Application</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}