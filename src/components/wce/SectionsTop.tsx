import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { dataLayerPush } from "@/lib/tracking";
import { LeafDivider, CornerVine, LotusMark } from "./ornaments";
import { FlowerOfLifeField, BotanicalBackdrop, DiamondRule, GoldFlourish } from "./decor";
import { useWcePathways, useWceSpeakers, useWceSettings, pathwayFeatures } from "./useWceData";
import { WceHeroMedia, WceHeroParticles } from "./HeroMedia";
import {
  Reveal, useInView, useWceReducedMotion,
  MaskedHeading, ClipReveal, useSectionLift,
} from "./motion";
import { WceCountdown } from "./WceCountdown";
import { WceTitleLockup } from "./HeroLockup";
import { WcePartnerMarquee } from "./PartnerMarquee";
import { LoveEmblem } from "./LoveEmblem";
import { PathwayCardsSkeleton, SpeakersSkeleton } from "./Skeletons";
import { PathwayCard } from "./PathwayCard";

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
      className="wce-hero-section relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-[230px] pt-[clamp(2.5rem,5vh,4rem)] text-center xl:h-[calc(100vw/1.756)] xl:max-h-[100svh] xl:min-h-[720px]"
      style={{ background: "var(--wce-forest)" }}
    >
      <WceHeroMedia />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/3"
        style={{ background: "linear-gradient(to top, #0F2A1D 14%, rgba(15,42,29,0.86) 42%, rgba(15,42,29,0.6) 68%, rgba(15,42,29,0.22) 100%)" }}
      />
      <WceHeroParticles />
      <CornerVine className="pointer-events-none absolute left-4 top-4 opacity-70 sm:left-10 sm:top-10" />
      <CornerVine flip className="pointer-events-none absolute right-4 top-4 opacity-70 sm:right-10 sm:top-10" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center pt-[clamp(1.5rem,7vh,5.5rem)]">
        <div className={cls("mb-[clamp(1rem,2.2vh,2.5rem)]")} style={stage(0)}>
          <LotusMark size={40} />
        </div>

        {/* Banner lockup: title | outlined year | stacked dates + green bar */}
        <WceTitleLockup reduced={reduced} />

        <p
          className="wce-banner-subline mt-[clamp(0.7rem,1.8vh,1.3rem)]"
          style={reduced ? undefined : { animation: "wce-rise 0.6s cubic-bezier(0.22,1,0.36,1) 1.3s both" }}
        >
          Holistic Symposium <span className="sep">|</span> Fortification Retreat{" "}
          <span className="sep">|</span> LifeCraft Experience
        </p>
        <p
          className="wce-banner-venue mt-[clamp(0.35rem,1vh,0.6rem)]"
          style={reduced ? undefined : { animation: "wce-rise 0.6s cubic-bezier(0.22,1,0.36,1) 1.3s both" }}
        >
          {venue}
        </p>

        <div
          className="wce-hero-emblem mt-[clamp(0.7rem,1.8vh,1.3rem)]"
          style={reduced ? undefined : { animation: "wce-rise 0.6s cubic-bezier(0.22,1,0.36,1) 1.45s both" }}
        >
          <LoveEmblem size={200} variant="cream" />
        </div>

        <div className={cls("my-[clamp(0.8rem,2vh,1.6rem)] w-full max-w-sm")} style={stage(0.95)}>
          <LeafDivider />
        </div>

        <WceCountdown className={cls("mt-[clamp(0.5rem,1.6vh,1.4rem)]")} />

        {/* CTAs render fully interactive from first paint; only opacity is animated. */}
        <div className="wce-hero-ctas mt-[clamp(1.75rem,3.6vh,3.25rem)] mb-[clamp(1rem,2vh,2rem)] w-full sm:w-auto">
          <a
            href="#pathways"
            className={`wce-btn wce-btn-gold ${reduced ? "" : "wce-hero-cta-enter"}`}
            style={reduced ? undefined : { animationDelay: "1.6s" }}
          >
            Choose Your Pathway
          </a>
          <a
            href="#apply"
            className={`wce-btn wce-btn-outline ${reduced ? "" : "wce-hero-cta-enter"}`}
            style={reduced ? undefined : { animationDelay: "1.69s" }}
          >
            Apply for the Retreat
          </a>
        </div>
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
      style={{ background: "var(--wce-forest-mid)", borderTop: "1px solid rgba(201,162,39,0.28)", borderBottom: "1px solid rgba(201,162,39,0.28)" }}
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
                className="text-[0.72rem] uppercase sm:text-xs"
                style={{ color: "rgba(245,239,224,0.92)", letterSpacing: "0.24em" }}
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

  return (
    <section ref={lift.ref} id="pathways" className="wce-surface px-6 py-24 sm:py-32" style={{ background: "var(--wce-cream)", ...lift.style }}>
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.04} drift />
      <BotanicalBackdrop intensity={1.1} />
      <div className="mx-auto max-w-5xl text-center">
        <Reveal><GoldFlourish className="mx-auto" size={58} /></Reveal>
        <Reveal><LotusMark size={30} className="mx-auto mt-3" /></Reveal>
        <MaskedHeading
          lines={["Choose Your Experience Pathway"]}
          className="mt-8 text-[clamp(2rem,5vw,3.4rem)]"
          style={{ color: "var(--wce-forest)" }}
        />
        <Reveal index={2}>
          <p className="mt-5 text-sm sm:text-base" style={{ color: "rgba(26,26,20,0.88)" }}>
            Three ways to experience transformation.
          </p>
          <LeafDivider className="mt-10" />
        </Reveal>

        {isLoading && <PathwayCardsSkeleton />}

        {!isLoading && (
        <div className="wce-path-row mx-auto mt-20 grid max-w-5xl gap-7 sm:mt-24 lg:grid-cols-3">
          {(pathways ?? []).map((p, i) => (
            <PathwayCard
              key={p.id}
              index={i}
              pathwayKey={p.key}
              label={p.label}
              currency={p.currency}
              price={Number(p.price)}
              features={pathwayFeatures(p.features)}
              productId={(p as { product_id?: string | null }).product_id ?? null}
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
