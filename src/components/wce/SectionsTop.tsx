import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { dataLayerPush } from "@/lib/tracking";
import { LeafDivider, CornerVine, LotusMark } from "./ornaments";
import { useWcePathways, useWceSpeakers, useWceSettings, pathwayFeatures } from "./useWceData";
import { WceHeroMedia, WceHeroParticles } from "./HeroMedia";
import { Reveal, useCountUp, useInView, useWceReducedMotion } from "./motion";
import { WceCountdown } from "./WceCountdown";
import { selectPathway } from "./pathway-select";
import { PathwayCardsSkeleton, SpeakersSkeleton } from "./Skeletons";

const PARTNERS = [
  "Mount Kailash",
  "Kamila's Kitchen",
  "Jah9",
  "LifeCraft in Jamaica",
  "The Ubuntu Movement",
];

/* ---------------- 1. HERO ---------------- */
export function WceHero() {
  const { data: settings } = useWceSettings();
  const reduced = useWceReducedMotion();
  const dates = settings?.event_dates ?? "11-17 October 2026";
  const venue = settings?.venue ?? "Mount Kailash Rejuvenation Centre, St. Lucia";

  // Stage-in sequence — purely visual, never gates interactivity.
  const stage = (delay: number) =>
    reduced ? undefined : ({ animationDelay: `${delay}s` } as React.CSSProperties);
  const cls = (base: string) => (reduced ? base : `${base} wce-stage`);

  return (
    <section
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center xl:h-[calc(100vw/1.756)] xl:max-h-[100svh] xl:min-h-[780px]"
      style={{ background: "var(--wce-forest)" }}
    >
      <WceHeroMedia />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/3"
        style={{ background: "linear-gradient(to top, #0F2A1D 12%, rgba(15,42,29,0.65) 55%, transparent 100%)" }}
      />
      <WceHeroParticles />
      <CornerVine className="pointer-events-none absolute left-4 top-4 opacity-70 sm:left-10 sm:top-10" />
      <CornerVine flip className="pointer-events-none absolute right-4 top-4 opacity-70 sm:right-10 sm:top-10" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center">
        <div className={cls("mb-10")} style={stage(0)}>
          <LotusMark size={46} />
        </div>

        <h1
          className={cls("wce-display wce-hero-title text-[clamp(1.4rem,4.4vw,2.75rem)] uppercase")}
          style={{ letterSpacing: "0.17em", lineHeight: 1.28, ...stage(0.2) }}
        >
          Caribbean Wellness<br className="sm:hidden" /> Saint Lucia
        </h1>

        <span
          className={`relative mt-6 inline-block ${reduced ? "" : "wce-stage-year"}`}
          style={reduced ? undefined : { animationDelay: "0.45s" }}
        >
          {!reduced && <span aria-hidden="true" className="wce-year-halo" />}
          <span className="wce-year relative inline-block text-[clamp(5.5rem,21vw,14rem)]">
            2026
            {!reduced && <span aria-hidden="true" className="wce-year-shimmer">2026</span>}
          </span>
        </span>

        <p
          className={cls("wce-eyebrow wce-rule-label mt-8")}
          style={{ color: "var(--wce-cream)", letterSpacing: "0.42em", ...stage(0.65) }}
        >
          {dates}
        </p>

        <div className={cls("my-10 w-full max-w-sm")} style={stage(0.72)}>
          <LeafDivider />
        </div>

        <p
          className={cls("max-w-2xl text-[0.78rem] uppercase leading-loose sm:text-sm")}
          style={{ color: "rgba(245,239,224,0.82)", letterSpacing: "0.2em", ...stage(0.78) }}
        >
          Wellness Symposium <span style={{ color: "var(--wce-gold)" }}>|</span> Fortification Retreat{" "}
          <span style={{ color: "var(--wce-gold)" }}>|</span> Lifecraft Experience
        </p>

        <p className={cls("wce-eyebrow mt-10")} style={{ color: "var(--wce-gold)", ...stage(0.9) }}>
          {venue}
        </p>

        <WceCountdown className={cls("mt-10")} />

        {/* CTAs render fully interactive from first paint; only opacity is animated. */}
        <div
          className="mt-14 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row"
          style={
            reduced
              ? undefined
              : { animation: "wce-rise 0.6s cubic-bezier(0.22,1,0.36,1) 1s both" }
          }
        >
          <a href="#pathways" className="wce-btn wce-btn-gold w-full sm:w-auto">Choose Your Pathway</a>
          <a href="#apply" className="wce-btn wce-btn-outline w-full sm:w-auto">Apply for the Retreat</a>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 2. PARTNER STRIP ---------------- */
export function WcePartnerStrip() {
  return (
    <section
      className="px-6 py-10"
      style={{ background: "var(--wce-forest-mid)", borderTop: "1px solid rgba(201,162,39,0.28)", borderBottom: "1px solid rgba(201,162,39,0.28)" }}
      aria-label="Event partners"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
        <Reveal>
          <p className="wce-eyebrow" style={{ color: "var(--wce-gold)", letterSpacing: "0.4em" }}>Powered by</p>
        </Reveal>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {PARTNERS.map((p, i) => (
            <Reveal key={p} as="li" index={i}>
              <span
                className="text-[0.72rem] uppercase sm:text-xs"
                style={{ color: "rgba(245,239,224,0.85)", letterSpacing: "0.24em" }}
              >
                {p}
              </span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- 3. PATHWAYS ---------------- */
function PathwayPrice({ currency, price }: { currency: string; price: number }) {
  const { ref, value } = useCountUp(price);
  return (
    <p
      ref={ref}
      className="mt-2 text-[2.4rem]"
      style={{ fontFamily: "var(--wce-display)", color: "var(--wce-gold-deep)" }}
    >
      {currency} {value.toFixed(0)}
    </p>
  );
}

export function WcePathwaysSection() {
  const { data: pathways, isLoading } = useWcePathways();

  return (
    <section id="pathways" className="relative overflow-hidden px-6 py-24 sm:py-32" style={{ background: "var(--wce-cream)" }}>
      <div className="mx-auto max-w-6xl text-center">
        <Reveal><LotusMark size={38} className="mx-auto" /></Reveal>
        <Reveal index={1}>
          <h2 className="mt-8 text-[clamp(2rem,5vw,3.4rem)]" style={{ color: "var(--wce-forest)" }}>
            Choose Your Experience Pathway
          </h2>
        </Reveal>
        <Reveal index={2}>
          <p className="mt-5 text-sm sm:text-base" style={{ color: "rgba(26,26,20,0.7)" }}>
            Three ways to experience transformation.
          </p>
          <LeafDivider className="mt-10" />
        </Reveal>

        {isLoading && <PathwayCardsSkeleton />}

        {!isLoading && (
        <div className="mt-16 grid gap-8 sm:mt-20 lg:grid-cols-3">
          {(pathways ?? []).map((p, i) => {
            const isRetreat = p.key === "retreat";
            const features = pathwayFeatures(p.features);
            const cta = isRetreat
              ? "Apply for the Retreat"
              : p.key === "online"
              ? "Get Online Access"
              : "Reserve Spot";
            return (
              <Reveal key={p.id} index={i} className="h-full">
                <article
                  className="wce-card relative flex h-full flex-col overflow-hidden px-8 py-12 text-center"
                  style={{
                    background: isRetreat ? "var(--wce-forest)" : "var(--wce-cream-warm)",
                    border: `1px solid ${isRetreat ? "var(--wce-gold)" : "rgba(201,162,39,0.4)"}`,
                    borderRadius: "3px",
                  }}
                >
                  {isRetreat && <span aria-hidden="true" className="wce-breathe" />}
                  {isRetreat && (
                    <div
                      aria-hidden="true"
                      className="absolute -right-12 top-9 w-52 rotate-45 py-1.5 text-center text-[0.55rem] uppercase"
                      style={{ background: "var(--wce-gold)", color: "var(--wce-forest)", letterSpacing: "0.2em", fontWeight: 600 }}
                    >
                      Applications Open
                    </div>
                  )}
                  <CornerVine className="pointer-events-none absolute -left-2 -bottom-2 opacity-40" />

                  <span
                    className="wce-card-badge relative mx-auto flex h-12 w-12 items-center justify-center rounded-full text-lg"
                    style={{
                      fontFamily: "var(--wce-display)",
                      border: "1px solid var(--wce-gold)",
                      background: isRetreat ? "transparent" : "var(--wce-gold)",
                      color: isRetreat ? "var(--wce-gold-light)" : "var(--wce-forest)",
                    }}
                  >
                    {i + 1}
                  </span>

                  <h3
                    className="relative mt-8 text-[1.55rem] leading-snug"
                    style={{ color: isRetreat ? "var(--wce-cream)" : "var(--wce-forest)" }}
                  >
                    {p.label}
                  </h3>

                  <p
                    className="relative mt-6 text-[0.68rem] uppercase"
                    style={{ color: isRetreat ? "var(--wce-gold-light)" : "rgba(26,26,20,0.55)", letterSpacing: "0.24em" }}
                  >
                    {isRetreat ? "Applications Open" : p.key === "in_person" ? "Starting at" : "Full access"}
                  </p>
                  {!isRetreat && (
                    <div className="relative">
                      <PathwayPrice currency={p.currency} price={Number(p.price)} />
                    </div>
                  )}

                  <ul className="relative mx-auto mt-8 space-y-3 text-left text-sm">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-3" style={{ color: isRetreat ? "rgba(245,239,224,0.85)" : "rgba(26,26,20,0.78)" }}>
                        <span aria-hidden="true" style={{ color: "var(--wce-gold)" }}>✦</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#apply"
                    className="wce-btn wce-btn-gold relative mt-10 w-full"
                    onClick={(e) => {
                      e.preventDefault();
                      dataLayerPush("pathway_click", { pathway_key: p.key, pathway_label: p.label });
                      selectPathway(p.key);
                    }}
                  >
                    {cta}
                  </a>
                </article>
              </Reveal>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}
