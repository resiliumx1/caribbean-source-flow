import { useState } from "react";
import { LeafDivider, LotusMark, CornerVine } from "./ornaments";
import { useWceFaqs, useWceSettings } from "./useWceData";
import { Reveal } from "./motion";

const PARTNERS = ["Mount Kailash", "Kamila's Kitchen", "Jah9", "LifeCraft in Jamaica", "The Ubuntu Movement"];

/* ---------------- 9. FAQ ---------------- */
export function WceFaqSection() {
  const { data: faqs } = useWceFaqs();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="px-6 py-24 sm:py-32" style={{ background: "var(--wce-cream-warm)" }}>
      <div className="mx-auto max-w-4xl text-center">
        <Reveal><LotusMark size={34} className="mx-auto" /></Reveal>
        <Reveal index={1}>
        <h2 className="mt-8 text-[clamp(2rem,5vw,3.2rem)]" style={{ color: "var(--wce-forest)" }}>
          Frequently Asked Questions
        </h2>
        <p className="mt-5 text-sm sm:text-base" style={{ color: "rgba(26,26,20,0.7)" }}>
          Choose the pathway that fits your journey.
        </p>
        <LeafDivider className="mt-10" />
        </Reveal>

        <div className="mt-14 space-y-4 text-left">
          {(faqs ?? []).map((f, i) => {
            const isOpen = open === f.id;
            return (
              <Reveal
                key={f.id}
                index={Math.min(i, 5)}
                style={{ background: "var(--wce-cream)", border: "1px solid rgba(201,162,39,0.4)", borderRadius: "3px" }}
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : f.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                    style={{ minHeight: 56, color: "var(--wce-forest)" }}
                  >
                    <span className="text-base sm:text-lg" style={{ fontFamily: "var(--wce-display)" }}>{f.question}</span>
                    <span
                      aria-hidden="true"
                      className={`wce-faq-icon text-lg ${isOpen ? "is-open" : ""}`}
                      style={{ color: "var(--wce-gold-deep)" }}
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div className={`wce-faq-panel ${isOpen ? "is-open" : ""}`}>
                  <div>
                    <p className="px-6 pb-6 text-sm leading-relaxed" style={{ color: "rgba(26,26,20,0.75)" }}>
                      {f.answer}
                    </p>
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
      <div className="mx-auto max-w-4xl">
        <Reveal><LotusMark size={38} className="mx-auto" /></Reveal>
        <Reveal index={1}>
        <h2 className="mt-8 text-[clamp(2rem,5.2vw,3.4rem)] leading-tight" style={{ color: "var(--wce-cream)" }}>
          Choose Your Pathway and Join Us in Saint Lucia
        </h2>
        </Reveal>
        <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
          <Reveal index={0} className="w-full sm:w-auto">
            <a href="#pathways" className="wce-btn wce-btn-gold wce-shimmer-btn w-full sm:w-auto">Book In-Person Symposium</a>
          </Reveal>
          <Reveal index={1} className="w-full sm:w-auto">
            <a href="#pathways" className="wce-btn wce-btn-gold w-full sm:w-auto">Get Online Access</a>
          </Reveal>
          <Reveal index={2} className="w-full sm:w-auto">
            <a href="#apply" className="wce-btn wce-btn-gold w-full sm:w-auto">Apply for the Retreat</a>
          </Reveal>
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
    <footer className="px-6 py-20" style={{ background: "var(--wce-forest-mid)", borderTop: "1px solid rgba(201,162,39,0.3)" }}>
      <div className="mx-auto grid max-w-6xl gap-14 text-center md:grid-cols-3 md:text-left">
        <div>
          <p className="wce-display text-2xl uppercase" style={{ color: "var(--wce-gold-light)", letterSpacing: "0.14em", lineHeight: 1.3 }}>
            Caribbean<br />Wellness<br />Saint Lucia
          </p>
          <p className="wce-eyebrow mt-4" style={{ color: "rgba(245,239,224,0.8)" }}>11–17 October 2026</p>
        </div>

        <address className="not-italic text-sm leading-loose" style={{ color: "rgba(245,239,224,0.8)" }}>
          <a href="tel:+17587223660" className="block hover:underline">1 (758) 722 3660</a>
          <a href="mailto:info@mountkailashlu.com" className="block hover:underline">info@mountkailashlu.com</a>
          <span className="block">Mount Kailash Rejuvenation Centre, St. Lucia</span>
        </address>

        <div>
          <p className="wce-eyebrow" style={{ color: "var(--wce-gold)" }}>Powered by</p>
          <ul className="mt-5 space-y-2 text-xs uppercase" style={{ color: "rgba(245,239,224,0.75)", letterSpacing: "0.18em" }}>
            {PARTNERS.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>
      </div>

      <LeafDivider className="mt-16" />
      <p
        className="mx-auto mt-8 max-w-4xl text-center text-[0.6rem] uppercase leading-loose"
        style={{ color: "rgba(245,239,224,0.6)", letterSpacing: "0.2em" }}
      >
        Clinical Wellness Medicine · Herbal Practice · Volcanic Highlands · Restoration · Food · Herbs · Discipline · Family · Care
      </p>
    </footer>
  );
}
