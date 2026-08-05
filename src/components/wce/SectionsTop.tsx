import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { dataLayerPush } from "@/lib/tracking";
import { LeafDivider, CornerVine, LotusMark } from "./ornaments";
import { FlowerOfLifeField, EdgeFoliage, DiamondRule, GoldFlourish, CheckMark } from "./decor";
import { useWcePathways, useWceSpeakers, useWceSettings, pathwayFeatures } from "./useWceData";
import { WceHeroMedia, WceHeroParticles } from "./HeroMedia";
import {
  Reveal, useCountUp, useInView, useWceReducedMotion,
  MaskedHeading, ClipReveal, SlideInItem, useSectionLift,
} from "./motion";
import { WceCountdown } from "./WceCountdown";
import { WceTitleLockup } from "./HeroLockup";
import { WcePartnerMarquee } from "./PartnerMarquee";
import { LoveEmblem } from "./LoveEmblem";
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
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-[190px] pt-[clamp(2.5rem,5vh,4rem)] text-center xl:h-[calc(100vw/1.756)] xl:max-h-[100svh] xl:min-h-[720px]"
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

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center pt-[clamp(3rem,7vh,5.5rem)]">
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
          className="mt-[clamp(0.7rem,1.8vh,1.3rem)]"
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
  return <PathwaysInner />;
}

/** Card heading: the mode reads on its own line, exactly as the flyer sets it. */
function PathwayHeading({ label, isRetreat }: { label: string; isRetreat: boolean }) {
  const match = label.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  const lines = match ? [match[1], `(${match[2]})`] : [label];
  return (
    <MaskedHeading
      as="h3"
      lines={lines}
      stagger={80}
      className="relative mx-auto flex max-w-[22ch] flex-col justify-center text-[1.35rem] leading-snug"
      style={{
        color: isRetreat ? "var(--wce-cream)" : "var(--wce-forest)",
        minHeight: "6.6rem",
      }}
    />
  );
}

function PathwaysInner() {
  const { data: pathways, isLoading } = useWcePathways();
  const lift = useSectionLift<HTMLElement>();

  return (
    <section ref={lift.ref} id="pathways" className="wce-surface px-6 py-24 sm:py-32" style={{ background: "var(--wce-cream)", ...lift.style }}>
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.04} drift />
      <EdgeFoliage side="left" opacity={0.13} />
      <EdgeFoliage side="right" opacity={0.13} />
      <div className="mx-auto max-w-5xl text-center">
        <Reveal><GoldFlourish className="mx-auto" size={58} /></Reveal>
        <Reveal><LotusMark size={30} className="mx-auto mt-3" /></Reveal>
        <MaskedHeading
          lines={["Choose Your Experience Pathway"]}
          className="mt-8 text-[clamp(2rem,5vw,3.4rem)]"
          style={{ color: "var(--wce-forest)" }}
        />
        <Reveal index={2}>
          <p className="mt-5 text-sm sm:text-base" style={{ color: "rgba(26,26,20,0.7)" }}>
            Three ways to experience transformation.
          </p>
          <LeafDivider className="mt-10" />
        </Reveal>

        {isLoading && <PathwayCardsSkeleton />}

        {!isLoading && (
        <div className="mx-auto mt-20 grid max-w-5xl gap-7 sm:mt-24 lg:grid-cols-3">
          {(pathways ?? []).map((p, i) => {
            const isRetreat = p.key === "retreat";
            const features = pathwayFeatures(p.features);
            const cta = isRetreat
              ? "Apply for the Retreat"
              : p.key === "online"
              ? "Get Online Access"
              : "Reserve Spot";
            const ctaClass = isRetreat
              ? "wce-btn-outline"
              : p.key === "online"
              ? "wce-btn-gold"
              : "wce-btn-forest";
            return (
              <Reveal key={p.id} index={i} className="h-full">
                <div className="relative h-full pt-6">
                  {/* Numbered badge straddles the card's top edge */}
                  <span
                    className="wce-card-badge absolute left-1/2 top-0 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full text-[1.05rem]"
                    style={{
                      fontFamily: "var(--wce-display)",
                      border: "1px solid var(--wce-gold-deep)",
                      background: "linear-gradient(180deg, var(--wce-gold-light), var(--wce-gold))",
                      color: "var(--wce-forest)",
                    }}
                  >
                    {i + 1}
                  </span>
                <article
                  className="wce-card relative flex h-full flex-col overflow-hidden px-7 pb-10 pt-14 text-center"
                  style={{
                    background: isRetreat ? "var(--wce-forest)" : "var(--wce-cream-warm)",
                    border: `1px solid ${isRetreat ? "var(--wce-gold)" : "rgba(201,162,39,0.4)"}`,
                    borderRadius: "2px",
                  }}
                >
                  {isRetreat && <span aria-hidden="true" className="wce-breathe" />}
                  {!isRetreat && <FlowerOfLifeField className="wce-surface-bg absolute inset-0" opacity={0.05} size={96} />}
                  {isRetreat && (
                    <div aria-hidden="true" className="wce-ribbon"><span>Premium</span></div>
                  )}
                  <CornerVine className="pointer-events-none absolute -left-2 -bottom-2 opacity-40" />

                  <PathwayHeading label={p.label} isRetreat={isRetreat} />

                  <DiamondRule
                    className="relative mx-auto mt-6 max-w-[9rem]"
                    tone={isRetreat ? "var(--wce-gold)" : "rgba(201,162,39,0.85)"}
                  />

                  <p
                    className="relative mt-5 text-[0.63rem] uppercase"
                    style={{ color: isRetreat ? "var(--wce-gold-light)" : "rgba(26,26,20,0.55)", letterSpacing: "0.24em" }}
                  >
                    {isRetreat ? "Applications Open" : p.key === "in_person" ? "Starting at" : "Full access"}
                  </p>
                  <div className="relative flex items-center justify-center" style={{ minHeight: "4.6rem" }}>
                    {!isRetreat && <PathwayPrice currency={p.currency} price={Number(p.price)} />}
                  </div>

                  <DiamondRule
                    className="relative mx-auto mt-6 max-w-[9rem]"
                    tone={isRetreat ? "var(--wce-gold)" : "rgba(201,162,39,0.85)"}
                  />

                  <ul className="relative mx-auto mt-8 space-y-3 text-left text-[0.85rem] leading-relaxed">
                    {features.map((f, fi) => (
                      <SlideInItem as="li" key={f} index={fi} className="flex items-start gap-3" style={{ color: isRetreat ? "rgba(245,239,224,0.85)" : "rgba(26,26,20,0.78)" }}>
                        <CheckMark tone={isRetreat ? "var(--wce-gold-light)" : "var(--wce-gold-deep)"} />
                        <span>{f}</span>
                      </SlideInItem>
                    ))}
                  </ul>

                  <div className="relative mt-auto pt-10">
                    <a
                      href="#apply"
                      className={`wce-btn ${ctaClass} w-full`}
                      onClick={(e) => {
                        e.preventDefault();
                        dataLayerPush("pathway_click", { pathway_key: p.key, pathway_label: p.label });
                        selectPathway(p.key);
                      }}
                    >
                      {cta}
                    </a>
                  </div>
                </article>
                </div>
              </Reveal>
            );
          })}
        </div>
        )}
      </div>
    </section>
  );
}

/* ---------------- 4. VISIONARY LEADERS ---------------- */
type Speaker = {
  id: string;
  name: string;
  title?: string | null;
  theme: string | null;
  bio?: string | null;
  session_title?: string | null;
  session_time?: string | null;
  portrait_url: string | null;
};

function PortraitCircle({
  url,
  name,
  size,
  ring,
  glow,
}: {
  url: string | null;
  name: string;
  size: "lg" | "md" | "sm";
  ring?: boolean;
  glow?: boolean;
}) {
  const dim =
    size === "lg" ? "h-48 w-48 sm:h-60 sm:w-60 lg:h-72 lg:w-72"
    : size === "md" ? "h-36 w-36 sm:h-44 sm:w-44"
    : "h-32 w-32 sm:h-36 sm:w-36 lg:h-[9.5rem] lg:w-[9.5rem]";
  return (
    <div className="relative shrink-0">
      {ring && (
        <span
          aria-hidden="true"
          className="wce-ring-slow pointer-events-none absolute -inset-4 rounded-full"
          style={{ border: "1px dashed rgba(201,162,39,0.55)" }}
        />
      )}
      {glow && <span aria-hidden="true" className="wce-portrait-glow" />}
      <div
        className={`${dim} wce-speaker-ring relative flex items-center justify-center rounded-full`}
        style={{
          border: "1px solid var(--wce-gold)",
          boxShadow: "0 0 0 6px rgba(201,162,39,0.12)",
          background: "linear-gradient(160deg, rgba(45,74,53,0.14), rgba(201,162,39,0.12))",
          overflow: "hidden",
        }}
      >
        {url ? (
          <img
            src={url}
            alt={name}
            className="wce-portrait-img h-full w-full object-cover"
            style={{ objectPosition: "50% 42%" }}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span
            className="wce-display text-3xl"
            style={{ color: "var(--wce-gold-deep)", letterSpacing: "0.08em" }}
            aria-hidden="true"
          >
            {name.split(" ").filter(Boolean).slice(-2).map((w) => w[0]).join("")}
          </span>
        )}
      </div>
    </div>
  );
}

/** Restrained hover: 8px lift, ring rotation, portrait scale + saturation, warm glow.
 *  Deliberately no 3D / perspective transform — nothing ever inverts. */
function SpeakerTile({
  speaker,
  selected,
  dimmed,
  onSelect,
}: {
  speaker: Speaker;
  selected: boolean;
  dimmed: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-expanded={selected}
      className={`wce-speaker flex w-full flex-col items-center text-center ${dimmed ? "wce-speaker-dim" : ""}`}
    >
      <PortraitCircle url={speaker.portrait_url} name={speaker.name} size="sm" glow />
      <div className="wce-speaker-meta">
        <p
          className="wce-speaker-name mt-6 text-[1.05rem] leading-tight sm:text-[1.15rem]"
          style={{ fontFamily: "var(--wce-display)", color: "var(--wce-forest)" }}
        >
          {speaker.name}
        </p>
        <DiamondRule className="mx-auto mt-3 max-w-[3.6rem]" tone="rgba(201,162,39,0.9)" />
        {speaker.title && (
          <p
            className="mt-3 text-[0.6rem] uppercase"
            style={{ color: "var(--wce-gold-deep)", letterSpacing: "0.2em" }}
          >
            {speaker.title}
          </p>
        )}
        {speaker.theme && (
          <p
            className="wce-speaker-theme mt-2 text-[0.62rem] uppercase"
            style={{ color: "rgba(26,26,20,0.65)", letterSpacing: "0.22em" }}
          >
            {speaker.theme}
          </p>
        )}
      </div>
    </button>
  );
}

function SpeakerDetail({ speaker, onClose }: { speaker: Speaker; onClose: () => void }) {
  const reduced = useWceReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    ref.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [onClose]);

  const hasDetail = !!(speaker.bio?.trim() || speaker.session_title?.trim() || speaker.theme?.trim());

  return (
    <motion.div
      layout
      ref={ref}
      tabIndex={-1}
      role="region"
      aria-label={`${speaker.name} details`}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: 8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mt-12 flex flex-col items-center gap-10 px-6 py-12 text-left sm:px-12 md:flex-row"
      style={{ background: "var(--wce-cream)", border: "1px solid rgba(201,162,39,0.45)", borderRadius: "3px" }}
    >
      <PortraitCircle url={speaker.portrait_url} name={speaker.name} size="md" ring />
      <div className="md:flex-1">
        <h3 className="text-[clamp(1.5rem,3vw,2.2rem)]" style={{ color: "var(--wce-forest)" }}>{speaker.name}</h3>
        {speaker.title && (
          <p className="wce-eyebrow mt-2" style={{ color: "var(--wce-gold-deep)" }}>{speaker.title}</p>
        )}
        {speaker.theme && (
          <p className="mt-4 italic" style={{ color: "var(--wce-gold-deep)", fontFamily: "var(--wce-display)", fontSize: "1.15rem" }}>
            {speaker.theme}
          </p>
        )}
        {speaker.session_title && (
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "rgba(26,26,20,0.8)" }}>
            {speaker.session_title}
            {speaker.session_time ? ` · ${speaker.session_time}` : ""}
          </p>
        )}
        {speaker.bio?.trim() && (
          <p className="mt-5 text-sm leading-relaxed" style={{ color: "rgba(26,26,20,0.72)" }}>{speaker.bio}</p>
        )}
        {!hasDetail && (
          <p className="mt-4 text-sm" style={{ color: "rgba(26,26,20,0.6)" }}>Session details coming soon.</p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-8 text-[0.66rem] uppercase"
          style={{ color: "var(--wce-gold-deep)", letterSpacing: "0.22em", minHeight: 44 }}
        >
          Close
        </button>
      </div>
    </motion.div>
  );
}

export function WceSpeakersSection() {
  const { data: speakers, isLoading } = useWceSpeakers();
  const { ref: sectionRef, inView } = useInView<HTMLElement>();
  const lift = useSectionLift<HTMLElement>();
  const fired = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (inView && !fired.current) {
      fired.current = true;
      dataLayerPush("speaker_view");
    }
  }, [inView]);

  const featured = speakers?.find((s) => s.is_featured) ?? null;
  const rest = ((speakers ?? []) as Speaker[]).filter((s) => s.id !== featured?.id);
  const selected = rest.find((s) => s.id === selectedId) ?? null;
  const [showAllSessions, setShowAllSessions] = useState(false);

  return (
    <section id="speakers" ref={sectionRef} className="wce-surface px-6 py-24 sm:py-32" style={{ background: "var(--wce-cream-warm)", ...lift.style }}>
      <FlowerOfLifeField className="wce-surface-bg" opacity={0.04} drift />
      <EdgeFoliage side="right" opacity={0.12} />
      <div className="mx-auto max-w-6xl text-center">
        <Reveal><GoldFlourish className="mx-auto" size={58} /></Reveal>
        <Reveal><LotusMark size={30} className="mx-auto mt-3" /></Reveal>
        <MaskedHeading
          lines={["Visionary Leaders"]}
          className="mt-8 text-[clamp(2rem,5vw,3.4rem)] uppercase"
          style={{ color: "var(--wce-forest)", letterSpacing: "0.1em" }}
        />
        <Reveal index={1}>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed sm:text-base" style={{ color: "rgba(26,26,20,0.7)" }}>
            Guided by voices in wellness, medicine, movement, sovereignty, leadership, transformation, and restoration.
          </p>
          <LeafDivider className="mt-10" />
        </Reveal>

        {isLoading && <SpeakersSkeleton />}

        {featured && (
          <Reveal index={2}>
            <div
              className="relative mt-16 flex flex-col items-center gap-10 overflow-hidden px-6 py-14 text-center sm:px-14 md:flex-row md:gap-14 md:text-left"
              style={{
                background: "linear-gradient(140deg, var(--wce-forest) 0%, var(--wce-forest-mid) 100%)",
                border: "1px solid var(--wce-gold)",
                borderRadius: "3px",
                boxShadow: "0 30px 70px -40px rgba(15,42,29,0.75)",
              }}
              data-wce-dark
            >
              <FlowerOfLifeField className="wce-surface-bg absolute inset-0" opacity={0.05} size={120} />
              <CornerVine className="pointer-events-none absolute -left-2 -bottom-2 opacity-40" />
              <div className="relative">
                <PortraitCircle url={featured.portrait_url} name={featured.name} size="lg" ring />
              </div>
              <div className="relative md:flex-1">
                <p className="wce-eyebrow" style={{ color: "var(--wce-gold-light)", letterSpacing: "0.32em" }}>
                  Living anchor of the week
                </p>
                <h3 className="mt-4 text-[clamp(2rem,4.2vw,3rem)] leading-tight" style={{ color: "var(--wce-cream)" }}>
                  {featured.name}
                </h3>
                <DiamondRule className="mx-auto mt-5 max-w-[9rem] md:mx-0" tone="var(--wce-gold)" />
                <p
                  className="mt-5 text-[0.68rem] uppercase"
                  style={{ color: "var(--wce-gold-light)", letterSpacing: "0.24em" }}
                >
                  {featured.title?.trim() || "Grand Master Herbal Physician · Founder, Mount Kailash"}
                </p>
                {featured.theme && (
                  <p className="mt-4 italic" style={{ color: "var(--wce-gold)", fontFamily: "var(--wce-display)", fontSize: "1.3rem" }}>
                    {featured.theme}
                  </p>
                )}
                {featured.session_title && (
                  <p className="mt-5 text-sm leading-relaxed sm:text-base" style={{ color: "rgba(245,239,224,0.82)" }}>
                    {featured.session_title}
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        )}

        <LayoutGroup>
          <ul className="mt-16 grid grid-cols-2 gap-x-5 gap-y-12 sm:mt-20 sm:grid-cols-3 lg:grid-cols-6">
            {rest.map((s, i) => (
              <Reveal key={s.id} as="li" index={i % 6}>
                <SpeakerTile
                  speaker={s}
                  selected={selectedId === s.id}
                  dimmed={!!selectedId && selectedId !== s.id}
                  onSelect={() => setSelectedId((cur) => (cur === s.id ? null : s.id))}
                />
              </Reveal>
            ))}
          </ul>

          <AnimatePresence initial={false}>
            {selected && <SpeakerDetail key={selected.id} speaker={selected} onClose={() => setSelectedId(null)} />}
          </AnimatePresence>
        </LayoutGroup>

        {rest.length > 0 && (
          <div className="mt-16">
            <button
              type="button"
              onClick={() => setShowAllSessions((v) => !v)}
              aria-expanded={showAllSessions}
              className="wce-btn wce-btn-outline-forest wce-btn-pill mx-auto"
            >
              {showAllSessions ? "Hide Speaker Sessions" : "Explore Speaker Sessions"}
            </button>

            {showAllSessions && (
              <ul className="mt-12 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((s) => (
                  <li
                    key={s.id}
                    className="px-7 py-8"
                    style={{
                      background: "var(--wce-cream)",
                      border: "1px solid rgba(201,162,39,0.45)",
                      borderRadius: "2px",
                    }}
                  >
                    <p className="text-[1.15rem]" style={{ fontFamily: "var(--wce-display)", color: "var(--wce-forest)" }}>
                      {s.name}
                    </p>
                    {s.title && (
                      <p className="wce-eyebrow mt-2" style={{ color: "var(--wce-gold-deep)" }}>{s.title}</p>
                    )}
                    <DiamondRule className="mt-5 max-w-[7rem]" tone="rgba(201,162,39,0.85)" />
                    {s.theme && (
                      <p className="mt-4 italic" style={{ fontFamily: "var(--wce-display)", color: "var(--wce-gold-deep)" }}>
                        {s.theme}
                      </p>
                    )}
                    {(s.session_title || s.bio) && (
                      <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(26,26,20,0.72)" }}>
                        {s.session_title || s.bio}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
