import { useState } from "react";
import { LeafDivider, LotusMark, CornerVine } from "./ornaments";
import { useWceFaqs, useWceSettings } from "./useWceData";
import { Reveal, MaskedHeading, useSectionLift } from "./motion";
import { FaqSkeleton } from "./Skeletons";
import { FlowerOfLifeField, FlowerOfLifeMark, BotanicalBackdrop, GoldFlourish, DiamondRule, LeafIcon, EdgeBleed } from "./decor";
import { LoveEmblem } from "./LoveEmblem";
import { WCE_PARTNERS } from "./PartnerMarquee";
import { trackWceCta, WceCtaIntent } from "./cta-tracking";

const FOOTER_NAV = [
  { label: "Pathways", href: "#pathways" },
  { label: "Speakers", href: "#speakers" },
  { label: "Ceremony", href: "#ceremony" },
  { label: "Apply", href: "#apply" },
  { label: "FAQ", href: "#faq" },
];

/* ---------------- 9. FAQ ---------------- */
export function WceFaqSection() {
  const { data: faqs, isLoading } = useWceFaqs();
  const [open, setOpen] = useState<string | null>(null);
  const lift = useSectionLift<HTMLElement>();

  return (
    <section ref={lift.ref} id="faq" className="wce-surface px-6 py-24 sm:py-32" style={{ background: "var(--wce-cream-warm)", ...lift.style }}>
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.04} drift />
      <BotanicalBackdrop intensity={0.9} />
      <div className="mx-auto max-w-5xl text-center">
        <Reveal><GoldFlourish className="mx-auto" size={54} /></Reveal>
        <Reveal><LotusMark size={28} className="mx-auto mt-3" /></Reveal>
        <MaskedHeading
          lines={["Frequently Asked Questions"]}
          className="mt-8 text-[clamp(2rem,5vw,3.2rem)]"
          style={{ color: "var(--wce-forest)" }}
        />
        <Reveal index={1}>
        <p className="mt-5 text-sm sm:text-base" style={{ color: "rgba(26,26,20,0.88)" }}>
          Everything you need to know before you join us in Saint Lucia.
        </p>
        <LeafDivider className="mt-10" />
        </Reveal>

        {isLoading && <FaqSkeleton />}

        <div className="mt-14 grid gap-5 text-left md:grid-cols-2">
          {(faqs ?? []).map((f, i) => {
            const isOpen = open === f.id;
            return (
              <Reveal
                key={f.id}
                index={Math.min(i, 5)}
                className={`wce-faq-card h-full ${isOpen ? "is-open" : ""}`}
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : f.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                    style={{ minHeight: 56, color: "var(--wce-forest)" }}
                  >
                    <span className="text-[1.02rem] leading-snug sm:text-lg" style={{ fontFamily: "var(--wce-display)" }}>{f.question}</span>
                    <span
                      aria-hidden="true"
                      className={`wce-faq-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base ${isOpen ? "is-open" : ""}`}
                      style={{ color: "var(--wce-gold-text)", border: "1px solid rgba(201,162,39,0.85)" }}
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div className={`wce-faq-panel ${isOpen ? "is-open" : ""}`}>
                  <div>
                    <div className="px-6 pb-6">
                      <DiamondRule className="mb-4 max-w-[6rem]" tone="rgba(201,162,39,0.7)" />
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(26,26,20,0.88)" }}>
                        {f.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- 10. FINAL CTA ---------------- */
export function WceFinalCta() {
  const { data: settings } = useWceSettings();
  return (
    <section className="relative overflow-hidden px-6 py-24 text-center sm:py-32" style={{ background: "var(--wce-forest)" }}>
      <EdgeBleed position="top" />
      <CornerVine className="pointer-events-none absolute left-4 top-4 opacity-50" />
      <CornerVine flip className="pointer-events-none absolute right-4 top-4 opacity-50" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <FlowerOfLifeMark size={520} opacity={0.06} />
      </span>
      <div className="relative mx-auto max-w-4xl">
        <Reveal><GoldFlourish className="mx-auto" size={58} /></Reveal>
        <Reveal><LotusMark size={30} className="mx-auto mt-3" /></Reveal>
        <MaskedHeading
          lines={["Choose Your Pathway and", "Join Us in Saint Lucia"]}
          className="mt-8 text-[clamp(2rem,5.2vw,3.4rem)] leading-tight"
          style={{ color: "var(--wce-cream)" }}
        />
        <DiamondRule className="mx-auto mt-10 max-w-[13rem]" />
        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
          {[
            { label: "Book In-Person Symposium", href: "#pathways", shimmer: true, intent: "reserve" as WceCtaIntent },
            { label: "Get Online Access", href: "#pathways", shimmer: false, intent: "online" as WceCtaIntent },
            { label: "Begin Your Application", href: "#apply", shimmer: false, intent: "apply" as WceCtaIntent },
          ].map((b, i) => (
            <Reveal key={b.label} index={i} className="w-full">
              <a
                href={b.href}
                className={`wce-btn wce-btn-gold ${b.shimmer ? "wce-shimmer-btn" : ""} h-full w-full text-center`}
                onClick={() => trackWceCta(b.intent, "final_band", b.label)}
              >
                <LeafIcon tone="var(--wce-forest)" size={13} />
                <span>{b.label}</span>
              </a>
            </Reveal>
          ))}
        </div>
        <LeafDivider className="mt-16" />
        <p className="mt-8 text-[0.875rem] uppercase leading-loose" style={{ color: "rgba(245,239,224,0.9)", letterSpacing: "0.22em" }}>
          {(settings?.event_dates ?? "11-17 October 2026").toUpperCase()}{" "}
          <span style={{ color: "var(--wce-gold)" }}>|</span>{" "}
          {(settings?.venue ?? "Mount Kailash Rejuvenation Centre, St. Lucia").toUpperCase()}
        </p>
      </div>
    </section>
  );
}

/* ---------------- 11. FOOTER ---------------- */
export function WceFooter() {
  const { data: settings } = useWceSettings();
  return (
    <footer className="wce-surface px-6 py-20" style={{ background: "var(--wce-forest-mid)", borderTop: "1px solid rgba(201,162,39,0.3)" }}>
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.04} light />

      {/* Emblem band */}
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-6">
        <DiamondRule className="hidden flex-1 sm:block" tone="rgba(201,162,39,0.75)" />
        <LoveEmblem size={220} className="shrink-0" />
        <DiamondRule className="hidden flex-1 sm:block" tone="rgba(201,162,39,0.75)" />
      </div>

      <div className="wce-footer-grid mx-auto mt-16 max-w-6xl">
        {/* Lockup */}
        <div className="wce-footer-col">
          <p className="wce-display text-2xl uppercase" style={{ color: "var(--wce-gold-light)", letterSpacing: "0.14em", lineHeight: 1.3 }}>
            Caribbean<br />Wellness<br />Saint Lucia
          </p>
          <p className="wce-footer-line mt-5">{settings?.event_dates ?? "11–17 October 2026"}</p>
          <p className="wce-footer-line mt-2">{settings?.venue ?? "Mount Kailash Rejuvenation Centre, St. Lucia"}</p>
        </div>

        {/* Navigation */}
        <div className="wce-footer-col">
          <p className="wce-footer-head">The Experience</p>
          <ul className="wce-footer-nav">
            {FOOTER_NAV.map((n) => (
              <li key={n.label}><a href={n.href}>{n.label}</a></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="wce-footer-col">
          <p className="wce-footer-head">Contact</p>
          <address className="wce-footer-contact not-italic">
            <a href="mailto:info@mountkailashlu.com">info@mountkailashlu.com</a>
            <a href="tel:+17587223660">1 (758) 722 3660</a>
          </address>
        </div>

        {/* Partners */}
        <div className="wce-footer-col">
          <p className="wce-footer-head">Proudly Partnered With</p>
          <ul className="wce-footer-partners">
            {WCE_PARTNERS.map((p) => (
              <li key={p.name}>
                {p.logoUrl ? (
                  <img src={p.logoUrl} alt={p.name} loading="lazy" decoding="async" className={p.round ? "is-round" : undefined} />
                ) : (
                  <span>{p.name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="wce-hairline mx-auto mt-16 max-w-6xl" />
      <p className="mt-8 text-center text-[0.875rem]" style={{ color: "rgba(245,239,224,0.9)" }}>
        © 2026 Caribbean Wellness Experience · Mount Kailash Rejuvenation Centre
      </p>
      <p
        className="mx-auto mt-4 max-w-4xl text-center text-[0.875rem] uppercase leading-loose"
        style={{ color: "rgba(201,162,39,0.72)", letterSpacing: "0.26em" }}
      >
        Clinical Wellness Medicine · Herbal Practice · Volcanic Highlands · Restoration · Food · Herbs · Discipline · Family · Care
      </p>
    </footer>
  );
}
