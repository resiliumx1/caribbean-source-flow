import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { dataLayerPush } from "@/lib/tracking";
import { trackWceCta } from "./cta-tracking";
import { LeafDivider, CornerVine, LotusMark } from "./ornaments";
import { FlowerOfLifeField, BotanicalBackdrop, DiamondRule, GoldFlourish } from "./decor";
import { useWcePathways, useWceSpeakers, useWceSettings } from "./useWceData";
import { WceHeroMedia, WceHeroParticles } from "./HeroMedia";
import {
  Reveal, useInView, useWceReducedMotion,
  MaskedHeading, ClipReveal, useSectionLift,
} from "./motion";
import { WceHeroTrust } from "./WceCountdown";
import { WceTitleLockup } from "./HeroLockup";
import { WcePartnerMarquee } from "./PartnerMarquee";
import { LoveEmblem } from "./LoveEmblem";
import { PathwayCardsSkeleton, SpeakersSkeleton } from "./Skeletons";
import { PathwayCard } from "./PathwayCard";
import { PATHWAY_COPY } from "./campaign";

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
    <section className="wce-hero-section relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-[168px] pt-[clamp(2.5rem,5vh,4rem)] text-center sm:pb-[200px] xl:pb-[230px]">
      <WceHeroMedia />
      {/* Deeper scrim so the copy and CTAs stay high-contrast over every video frame */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "radial-gradient(115% 85% at 50% 45%, rgba(var(--wce-forest-rgb), 0.62) 0%, rgba(var(--wce-forest-rgb), 0.5) 55%, rgba(var(--wce-forest-rgb), 0.3) 100%)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[72%]"
        style={{ background: "linear-gradient(to top, rgba(var(--wce-forest-rgb), 0.98) 0%, rgba(var(--wce-forest-rgb), 0.92) 26%, rgba(var(--wce-forest-rgb), 0.7) 48%, rgba(var(--wce-forest-rgb), 0.34) 70%, rgba(var(--wce-forest-rgb), 0) 92%)" }}
      />

      <WceHeroParticles />
      <CornerVine className="pointer-events-none absolute left-4 top-4 opacity-70 sm:left-10 sm:top-10" />
      <CornerVine flip className="pointer-events-none absolute right-4 top-4 opacity-70 sm:right-10 sm:top-10" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center pt-[clamp(1.5rem,7vh,5.5rem)]">
        <div className={cls("mb-[clamp(1rem,2.2vh,2.5rem)]")} style={stage(0)}>
          <LotusMark size={40} />
        </div>

        {/* Banner lockup: title | outlined year */}
        <WceTitleLockup reduced={reduced} showDates={false} />

        {/* Symposium + day/time block */}
        <div
          className="wce-hero-symposium mt-[clamp(0.8rem,2vh,1.5rem)]"
          style={reduced ? undefined : { animation: "wce-rise 0.6s cubic-bezier(0.22,1,0.36,1) 1.2s both" }}
        >
          <span className="wce-hero-symposium__title">
            Wellness
            <br className="hidden sm:block" /> Symposium
          </span>
          <span aria-hidden="true" className="wce-hero-symposium__divider" />
          <span className="wce-hero-symposium__when">
            <span className="wce-hero-symposium__day">Sun 11</span>
            <span className="wce-hero-symposium__month">October</span>
            <span aria-hidden="true" className="wce-hero-symposium__bar" />
            <span className="wce-hero-symposium__time">10am to 6pm</span>
          </span>
        </div>

        <p
          className="wce-hero-lead mt-[clamp(0.9rem,2.2vh,1.6rem)]"
          style={reduced ? undefined : { animation: "wce-rise 0.6s cubic-bezier(0.22,1,0.36,1) 1.3s both" }}
        >
          One transformative day of food, herbs, movement and conscious living — with
          Priest Kailash, Jah9, Dr Bobby Price, Rizza Islam and more.
        </p>

        {/* CTAs render fully interactive from first paint; only opacity is animated. */}
        <div className="wce-hero-ctas mt-[clamp(1.5rem,3.2vh,2.5rem)] w-full sm:w-auto">
          <a
            href="/wce-2026/go/in-person"
            className={`wce-btn wce-btn-gold ${reduced ? "" : "wce-hero-cta-enter"}`}
            style={reduced ? undefined : { animationDelay: "1.45s" }}
            onClick={() => trackWceCta("reserve", "hero", "Attend In Person — US$70")}
          >
            Attend In Person — US$70
          </a>
          <a
            href="/wce-2026/go/online"
            className={`wce-btn wce-btn-outline ${reduced ? "" : "wce-hero-cta-enter"}`}
            style={reduced ? undefined : { animationDelay: "1.54s" }}
            onClick={() => trackWceCta("reserve", "hero", "Watch Online — US$50")}
          >
            Watch Online — US$50
          </a>
        </div>

        <a
          href="#retreat-detail"
          className={`wce-hero-retreatlink mt-[clamp(0.9rem,2vh,1.4rem)] ${reduced ? "" : "wce-hero-cta-enter"}`}
          style={reduced ? undefined : { animationDelay: "1.62s" }}
          onClick={() => trackWceCta("explore", "hero", "Explore the 12-17 October retreat")}
        >
          Explore the 12-17 October retreat →
        </a>

        <div
          className="wce-hero-emblem mt-[clamp(1rem,2.4vh,1.8rem)]"
          style={reduced ? undefined : { animation: "wce-rise 0.6s cubic-bezier(0.22,1,0.36,1) 1.7s both" }}
        >
          <LoveEmblem size={168} variant="cream" />
        </div>

        <WceHeroTrust className={cls("mt-[clamp(0.9rem,2.2vh,1.6rem)]")} />

        <p className="wce-banner-venue mt-[clamp(0.6rem,1.4vh,1rem)]">{venue}</p>
      </div>


      <WcePartnerMarquee />
    </section>
  );
}

/* ---------------- 2. PARTNER STRIP ---------------- */
export function WcePartnerStrip() {
  return (
    <section
      className="px-6 py-10"
      style={{ background: "var(--wce-band-mid)", borderTop: "1px solid rgba(var(--wce-gold-rgb), 0.28)", borderBottom: "1px solid rgba(var(--wce-gold-rgb), 0.28)" }}
      aria-label="Event partners"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
        <Reveal gate>
          <p className="wce-eyebrow" style={{ color: "var(--wce-gold)", letterSpacing: "0.4em" }}>Powered by</p>
        </Reveal>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {PARTNERS.map((p, i) => (
            <Reveal key={p} as="li" index={i} gate>
              <span
                className="text-[0.875rem] uppercase sm:text-xs"
                style={{ color: "rgba(var(--wce-cream-rgb), 0.92)", letterSpacing: "0.24em" }}
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
export function WcePathwaysSection() {
  return <PathwaysInner />;
}

function PathwaysInner() {
  const { data: pathways, isLoading } = useWcePathways();
  const lift = useSectionLift<HTMLElement>();
  /* A campaign link whose product is missing or closed falls back here with
     ?pathway=<key> so the visitor still lands on the right card. */
  const highlightKey = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("pathway")
    : null;

  return (
    <section ref={lift.ref} id="pathways" className="wce-surface px-6 py-24 sm:py-32" style={{ background: "var(--wce-panel)", ...lift.style }}>
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.04} drift />
      <BotanicalBackdrop intensity={1.1} />
      <div className="mx-auto max-w-5xl text-center">
        <Reveal><GoldFlourish className="mx-auto" size={58} /></Reveal>
        <Reveal><LotusMark size={30} className="mx-auto mt-3" /></Reveal>
        <MaskedHeading
          lines={["Choose Your Experience Pathway"]}
          className="mt-6 text-[clamp(1.9rem,5vw,3.4rem)] sm:mt-8"
          style={{ color: "var(--wce-ink-strong)" }}
        />
        <Reveal index={2}>
          <p className="mt-5 text-sm sm:text-base" style={{ color: "rgba(var(--wce-ink-rgb), 0.88)" }}>
            Three ways to experience transformation.
          </p>
          <LeafDivider className="mt-8 sm:mt-10" />
        </Reveal>

        {isLoading && <PathwayCardsSkeleton />}

        {!isLoading && (
        <div className="wce-path-row mx-auto mt-14 grid max-w-5xl grid-cols-1 items-stretch gap-6 sm:mt-20 sm:gap-7 md:grid-cols-2 lg:grid-cols-3">
          {(pathways ?? [])
            .filter((p) => p.key in PATHWAY_COPY)
            .map((p, i) => (
            <PathwayCard
              key={p.id}
              index={i}
              pathwayKey={p.key}
              label={p.label}
              currency={p.currency}
              price={Number(p.price)}
              productId={(p as { product_id?: string | null }).product_id ?? null}
              highlight={highlightKey === p.key}
            />
          ))}
        </div>
        )}
      </div>
    </section>
  );
}

/* ---------------- 4. VISIONARY LEADERS ---------------- */
export { WceSpeakersSection } from "./Speakers";
