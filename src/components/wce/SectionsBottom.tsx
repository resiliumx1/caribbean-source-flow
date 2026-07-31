import { useState } from "react";
import { LeafDivider, LotusMark, CornerVine } from "./ornaments";
import { useWceFaqs, useWceSettings } from "./useWceData";
import { Reveal } from "./motion";
import { FaqSkeleton } from "./Skeletons";
import { FlowerOfLifeField, FlowerOfLifeMark, EdgeFoliage, GoldFlourish, DiamondRule, LeafIcon } from "./decor";

const PARTNERS = ["Mount Kailash", "Kamila's Kitchen", "Jah9", "LifeCraft in Jamaica", "The Ubuntu Movement"];

/* ---------------- 9. FAQ ---------------- */
export function WceFaqSection() {
  const { data: faqs, isLoading } = useWceFaqs();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id="faq" className="wce-surface px-6 py-24 sm:py-32" style={{ background: "var(--wce-cream-warm)" }}>
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.04} />
      <EdgeFoliage side="right" opacity={0.12} />
      <div className="mx-auto max-w-5xl text-center">
        <Reveal><GoldFlourish className="mx-auto" size={54} /></Reveal>
        <Reveal><LotusMark size={28} className="mx-auto mt-3" /></Reveal>
        <Reveal index={1}>
        <h2 className="mt-8 text-[clamp(2rem,5vw,3.2rem)]" style={{ color: "var(--wce-forest)" }}>
          Frequently Asked Questions
        </h2>
        <p className="mt-5 text-sm sm:text-base" style={{ color: "rgba(26,26,20,0.7)" }}>
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
                      style={{ color: "var(--wce-gold-deep)", border: "1px solid rgba(201,162,39,0.6)" }}
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div className={`wce-faq-panel ${isOpen ? "is-open" : ""}`}>
                  <div>
                    <div className="px-6 pb-6">
                      <DiamondRule className="mb-4 max-w-[6rem]" tone="rgba(201,162,39,0.7)" />
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(26,26,20,0.75)" }}>
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
      <CornerVine className="pointer-events-none absolute left-4 top-4 opacity-50" />
      <CornerVine flip className="pointer-events-none absolute right-4 top-4 opacity-50" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <FlowerOfLifeMark size={520} opacity={0.1} />
      </span>
      <div className="relative mx-auto max-w-4xl">
        <Reveal><GoldFlourish className="mx-auto" size={58} /></Reveal>
        <Reveal><LotusMark size={30} className="mx-auto mt-3" /></Reveal>
        <Reveal index={1}>
        <h2 className="mt-8 text-[clamp(2rem,5.2vw,3.4rem)] leading-tight" style={{ color: "var(--wce-cream)" }}>
          Choose Your Pathway and Join Us in Saint Lucia
        </h2>
        </Reveal>
        <DiamondRule className="mx-auto mt-10 max-w-[13rem]" />
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
          {[
            { label: "Book In-Person Symposium", href: "#pathways", shimmer: true },
            { label: "Get Online Access", href: "#pathways", shimmer: false },
            { label: "Apply for the Retreat", href: "#apply", shimmer: false },
          ].map((b, i) => (
            <Reveal key={b.label} index={i} className="w-full sm:w-auto">
              <a
                href={b.href}
                className={`wce-btn wce-btn-gold ${b.shimmer ? "wce-shimmer-btn" : ""} w-full sm:w-auto`}
              >
                <LeafIcon tone="var(--wce-forest)" size={13} />
                <span>{b.label}</span>
              </a>
            </Reveal>
          ))}
        </div>
        <LeafDivider className="mt-16" />
        <p className="mt-8 text-[0.68rem] uppercase leading-loose" style={{ color: "rgba(245,239,224,0.8)", letterSpacing: "0.22em" }}>
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
  return (
    <footer className="wce-surface px-6 py-20" style={{ background: "var(--wce-forest-mid)", borderTop: "1px solid rgba(201,162,39,0.3)" }}>
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.04} light />

      {/* Partner row */}
      <div className="mx-auto max-w-6xl text-center">
        <p className="wce-eyebrow" style={{ color: "var(--wce-gold)", letterSpacing: "0.4em" }}>Powered by</p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {PARTNERS.map((p) => (
            <li
              key={p}
              className="text-[0.68rem] uppercase"
              style={{ color: "rgba(245,239,224,0.8)", letterSpacing: "0.22em" }}
            >
              {p}
            </li>
          ))}
        </ul>
        <LeafDivider className="mx-auto mt-12 w-full max-w-2xl" />
      </div>

      <div className="mx-auto mt-14 grid max-w-6xl items-start gap-12 text-center md:grid-cols-[1.1fr_1fr_1fr] md:text-left">
        <div>
          <p className="wce-display text-2xl uppercase" style={{ color: "var(--wce-gold-light)", letterSpacing: "0.14em", lineHeight: 1.3 }}>
            Caribbean<br />Wellness<br />Saint Lucia
          </p>
          <p className="wce-eyebrow mt-4" style={{ color: "rgba(245,239,224,0.8)" }}>11–17 October 2026</p>
        </div>

        <div>
          <p className="wce-eyebrow" style={{ color: "var(--wce-gold)" }}>Contact</p>
          <address className="mt-5 not-italic text-sm leading-loose" style={{ color: "rgba(245,239,224,0.8)" }}>
            <a href="tel:+17587223660" className="block hover:underline">1 (758) 722 3660</a>
            <a href="mailto:info@mountkailashlu.com" className="block hover:underline">info@mountkailashlu.com</a>
            <span className="block">Mount Kailash Rejuvenation Centre, St. Lucia</span>
          </address>
        </div>

        <div>
          <p className="wce-eyebrow" style={{ color: "var(--wce-gold)" }}>The Experience</p>
          <ul className="mt-5 space-y-2 text-xs uppercase" style={{ color: "rgba(245,239,224,0.75)", letterSpacing: "0.18em" }}>
            <li><a href="#pathways" className="hover:underline">Pathways</a></li>
            <li><a href="#speakers" className="hover:underline">Visionary Leaders</a></li>
            <li><a href="#activities" className="hover:underline">Activities</a></li>
            <li><a href="#apply" className="hover:underline">Apply</a></li>
            <li><a href="#faq" className="hover:underline">FAQ</a></li>
          </ul>
        </div>
      </div>

      <div className="wce-hairline mx-auto mt-16 max-w-6xl" />
      <p
        className="mx-auto mt-8 max-w-4xl text-center text-[0.6rem] uppercase leading-loose"
        style={{ color: "rgba(245,239,224,0.6)", letterSpacing: "0.2em" }}
      >
        Clinical Wellness Medicine · Herbal Practice · Volcanic Highlands · Restoration · Food · Herbs · Discipline · Family · Care
      </p>
    </footer>
  );
}
