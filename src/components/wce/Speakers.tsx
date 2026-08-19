/** Visionary Leaders — featured panel, the row of six, and the flyer expansion. */
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { dataLayerPush } from "@/lib/tracking";
import { LeafDivider, CornerVine, LotusMark } from "./ornaments";
import { FlowerOfLifeField, BotanicalBackdrop, DiamondRule, GoldFlourish } from "./decor";
import { useWceSpeakers } from "./useWceData";
import { Reveal, useInView, useIsTouch, useWceReducedMotion, MaskedHeading, useSectionLift } from "./motion";
import { SpeakersSkeleton } from "./Skeletons";
import { SpeakerFlyer } from "./SpeakerFlyer";
import { FeaturedHalo } from "./FeaturedHalo";
import { WceSpeaker, themeLines, speakerInitials } from "./speaker-utils";
import { speakerPortrait } from "./speaker-portraits";
import { trackWceCta } from "./cta-tracking";
import { WCE_PAGE_PATH, speakerPath } from "./share";

/** Small gold ornament arrow used on the View Flyer action. */
function ArrowGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M2 8h11M9.5 4.5L13 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** One row tile: gilded ring ignition + translucent theme word behind the portrait. */
function SpeakerTile({
  speaker,
  onOpen,
  cardRef,
}: {
  speaker: WceSpeaker;
  onOpen: () => void;
  cardRef: (el: HTMLButtonElement | null) => void;
}) {
  const touch = useIsTouch();
  const reduced = useWceReducedMotion();
  const { ref, inView } = useInView<HTMLSpanElement>();
  // No hover on touch: ignite + reveal the theme word once on scroll-in, then hold.
  const held = touch && (inView || reduced);
  const lines = themeLines(speaker.theme);
  const portrait = speakerPortrait(speaker.name, speaker.portrait_url);

  return (
    <button
      type="button"
      ref={cardRef}
      onClick={onOpen}
      className={`wce-speaker wce-card wce-card-speaker ${held ? "is-on" : ""}`}
    >
      {/* Hover state: the face becomes the card. */}
      <span aria-hidden="true" className="wce-card-fill">
        {portrait && <img src={portrait} alt="" loading="lazy" decoding="async" />}
      </span>
      <span aria-hidden="true" className="wce-card-scrim" />

      <span className="wce-card-rest">
      <span ref={ref} className="wce-speaker-stage">
        <span className="wce-speaker-themeword" aria-hidden="true">
          {lines.map((l, i) => (
            <span key={`${l}-${i}`}>{l}</span>
          ))}
        </span>
          <span className="wce-speaker-portrait-slot">
            <span aria-hidden="true" className="wce-portrait-glow" />
            <span aria-hidden="true" className="wce-ring-ignite" />
            <span className="wce-speaker-ring">
              {portrait ? (
                <img
                  src={portrait}
                  alt={speaker.name}
                  className="wce-portrait-img"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="wce-speaker-initials" aria-hidden="true">{speakerInitials(speaker.name)}</span>
              )}
            </span>
            <span className="wce-portrait-affordance" aria-hidden="true">View Flyer</span>
          </span>
      </span>

      <span className="wce-speaker-meta">
        <span className="wce-card-theme">{speaker.theme || ""}</span>
        <p className="wce-speaker-name mt-2 text-[1rem] leading-tight sm:text-[1.08rem]">
          {speaker.prefix ? `${speaker.prefix} ` : ""}{speaker.name}
        </p>
        <DiamondRule className="mx-auto mt-2 max-w-[3.2rem]" tone="rgba(var(--wce-gold-rgb), 0.9)" />
        <p className="wce-speaker-role mt-2 text-[0.875rem] uppercase" style={{ color: "var(--wce-gold-text)", letterSpacing: "0.2em" }}>
          {speaker.title || ""}
        </p>
        <span className="wce-viewflyer mt-4">
          View Flyer
          <ArrowGlyph />
        </span>
      </span>
      </span>

      {/* Overlay label, legible over the photograph */}
      <span className="wce-card-over">
        {speaker.theme && <span className="wce-card-over-theme">{speaker.theme}</span>}
        <span className="wce-card-over-name">
          {speaker.prefix ? `${speaker.prefix} ` : ""}{speaker.name}
        </span>
        {speaker.session_title?.trim() && (
          <span className="wce-card-over-session">{speaker.session_title}</span>
        )}
      </span>
    </button>
  );
}

/** Featured panel — same treatment plus the aura bloom and outward petal draw. */
function FeaturedSpeaker({
  speaker,
  onOpen,
  cardRef,
}: {
  speaker: WceSpeaker;
  onOpen: () => void;
  cardRef: (el: HTMLButtonElement | null) => void;
}) {
  const touch = useIsTouch();
  const reduced = useWceReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  const held = touch && (inView || reduced);
  const portrait = speakerPortrait(speaker.name, speaker.portrait_url);

  return (
    <button
      type="button"
      ref={cardRef}
      onClick={onOpen}
      data-wce-dark
      className={`wce-speaker wce-speaker-featured relative mt-16 flex w-full flex-col items-center gap-10 overflow-hidden px-6 py-14 text-center sm:px-14 md:flex-row md:gap-14 md:text-left ${held ? "is-on" : ""}`}
    >
      <FlowerOfLifeField className="wce-surface-bg absolute inset-0" opacity={0.06} size={120} />
      <CornerVine className="pointer-events-none absolute -bottom-2 -left-2 opacity-40" />
      <div ref={ref} className="wce-speaker-stage wce-speaker-stage-lg relative">
        <span className="wce-speaker-themeword on-dark" aria-hidden="true">
          {themeLines(speaker.theme).map((l, i) => (
            <span key={`${l}-${i}`}>{l}</span>
          ))}
        </span>
        {portrait ? (
          <span
            className="relative block"
            style={{ width: "clamp(280px, 34vw, 460px)", overflow: "visible" }}
          >
            <FeaturedHalo src={portrait} alt={speaker.name} animate={!reduced} />
            <span className="wce-portrait-affordance" aria-hidden="true">View Flyer</span>
          </span>
        ) : (
          <span className="wce-speaker-portrait-slot lg">
            <span className="wce-speaker-ring">
              <span className="wce-speaker-initials">{speakerInitials(speaker.name)}</span>
            </span>
          </span>
        )}
      </div>

      <div className="relative md:flex-1">
        <p className="wce-eyebrow" style={{ color: "var(--wce-gold-light)", letterSpacing: "0.32em" }}>
          Living anchor of the week
        </p>
        <h3 className="mt-4 text-[clamp(2rem,4.2vw,3rem)] leading-tight" style={{ color: "var(--wce-cream)" }}>
          {speaker.prefix ? `${speaker.prefix} ` : ""}{speaker.name}
        </h3>
        <DiamondRule className="mx-auto mt-5 max-w-[9rem] md:mx-0" tone="var(--wce-gold)" />
        <p className="mt-5 text-[0.875rem] uppercase" style={{ color: "var(--wce-gold-light)", letterSpacing: "0.24em" }}>
          {speaker.title?.trim() || "Grand Master Herbal Physician · Founder, Mount Kailash"}
        </p>
        {speaker.theme && (
          <p className="mt-4 italic" style={{ color: "var(--wce-gold)", fontFamily: "var(--wce-display)", fontSize: "1.3rem" }}>
            {speaker.theme}
          </p>
        )}
        {speaker.session_title && (
          <p className="mt-5 text-sm leading-relaxed sm:text-base" style={{ color: "rgba(var(--wce-cream-rgb), 0.9)" }}>
            {speaker.session_title}
          </p>
        )}
        <span className="wce-viewflyer wce-viewflyer-lg mt-8">
          View Flyer
          <ArrowGlyph size={16} />
        </span>
      </div>
    </button>
  );
}

export function WceSpeakersSection() {
  const { data, isLoading } = useWceSpeakers();
  const navigate = useNavigate();
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const { ref: sectionRef, inView } = useInView<HTMLElement>();
  const lift = useSectionLift<HTMLElement>();
  const fired = useRef(false);
  const cards = useRef<Record<string, HTMLButtonElement | null>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const scrolled = useRef(false);

  useEffect(() => {
    if (inView && !fired.current) {
      fired.current = true;
      dataLayerPush("speaker_view");
    }
  }, [inView]);

  const speakers = (data ?? []) as WceSpeaker[];
  const featured = speakers.find((s) => s.is_featured) ?? null;
  const rest = speakers.filter((s) => s.id !== featured?.id);
  const open = speakers.find((s) => s.id === openId) ?? null;
  const openIndex = open ? speakers.findIndex((s) => s.id === open.id) : -1;

  /* The URL is the source of truth for the flyer on /wce-2026/speakers/:slug, so
     a shared link opens the right flyer and browser Back closes it. */
  useEffect(() => {
    if (!routeSlug) {
      setOpenId((cur) => (cur && speakers.some((s) => s.id === cur && s.slug) ? null : cur));
      return;
    }
    const match = speakers.find((s) => s.slug === routeSlug);
    if (!match) return;
    setOpenId(match.id);
    if (!scrolled.current) {
      scrolled.current = true;
      requestAnimationFrame(() => {
        document.getElementById("speakers")?.scrollIntoView({ block: "start" });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeSlug, data]);

  /** Opening a speaker pushes their shareable URL; slug-less rows fall back to local state. */
  const openSpeaker = useCallback(
    (s: WceSpeaker) => {
      trackWceEvent("speaker_open", s.slug ?? s.name, { speaker_name: s.name });
      if (s.slug) navigate(speakerPath(s.slug));
      else setOpenId(s.id);
    },
    [navigate],
  );

  const neighbour = (dir: 1 | -1) =>
    openIndex >= 0 && speakers.length > 1
      ? speakers[(openIndex + dir + speakers.length) % speakers.length]?.name
      : undefined;

  const step = useCallback(
    (dir: 1 | -1) => {
      setDirection(dir);
      if (!openId || !speakers.length) return;
      const i = speakers.findIndex((s) => s.id === openId);
      const next = speakers[(i + dir + speakers.length) % speakers.length];
      if (next.slug) navigate(speakerPath(next.slug), { replace: true });
      else setOpenId(next.id);
    },
    [navigate, openId, speakers]
  );

  /** Dot navigation: travel direction is inferred from the index delta. */
  const jumpTo = useCallback(
    (id: string) => {
      const from = speakers.findIndex((s) => s.id === openId);
      const to = speakers.findIndex((s) => s.id === id);
      if (to < 0 || to === from) return;
      if (from >= 0) setDirection(to > from ? 1 : -1);
      const target = speakers[to];
      if (target.slug) navigate(speakerPath(target.slug), { replace: true });
      else setOpenId(id);
    },
    [navigate, openId, speakers]
  );

  const close = useCallback(() => {
    const id = openId;
    setOpenId(null);
    if (routeSlug) navigate(WCE_PAGE_PATH);
    if (id) requestAnimationFrame(() => cards.current[id]?.focus());
  }, [navigate, openId, routeSlug]);

  const setCardRef = (id: string) => (el: HTMLButtonElement | null) => { cards.current[id] = el; };

  return (
    <>
      <section
        id="speakers"
        ref={sectionRef}
        className="wce-surface px-6 py-24 sm:py-32"
        style={{ background: "var(--wce-panel-warm)", ...lift.style }}
      >
        <FlowerOfLifeField className="wce-surface-bg" opacity={0.04} drift />
        <BotanicalBackdrop intensity={1.05} />
        <div className="mx-auto max-w-6xl text-center">
          <Reveal><GoldFlourish className="mx-auto" size={58} /></Reveal>
          <Reveal><LotusMark size={30} className="mx-auto mt-3" /></Reveal>
          <MaskedHeading
            lines={["Visionary Leaders"]}
            className="mt-8 text-[clamp(2rem,5vw,3.4rem)] uppercase"
            style={{ color: "var(--wce-ink-strong)", letterSpacing: "0.1em" }}
          />
          <Reveal index={1}>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed sm:text-base" style={{ color: "rgba(var(--wce-ink-rgb), 0.88)" }}>
              Guided by voices in wellness, medicine, movement, sovereignty, leadership, transformation, and restoration.
            </p>
            <LeafDivider className="mt-10" />
          </Reveal>

          {isLoading && <SpeakersSkeleton />}

          {featured && (
            <Reveal index={2}>
              <FeaturedSpeaker
                speaker={featured}
                onOpen={() => openSpeaker(featured)}
                cardRef={setCardRef(featured.id)}
              />
            </Reveal>
          )}

          <ul className="mt-16 grid grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((s, i) => (
              <Reveal key={s.id} as="li" index={i % 3} className="h-full">
                <SpeakerTile
                  speaker={s}
                  onOpen={() => openSpeaker(s)}
                  cardRef={setCardRef(s.id)}
                />
              </Reveal>
            ))}
          </ul>

          {speakers.length > 0 && (
            <div className="mt-16">
              <button
                type="button"
                onClick={() => {
                  trackWceCta("explore", "speakers", "Explore Speaker Sessions");
                  openSpeaker(speakers[0]);
                }}
                className="wce-btn wce-btn-outline-forest wce-btn-pill mx-auto"
              >
                Explore Speaker Sessions
              </button>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {open && (
          <SpeakerFlyer
            key="wce-flyer"
            speaker={open}
            onClose={close}
            onPrev={() => step(-1)}
            onNext={() => step(1)}
            prevName={neighbour(-1)}
            nextName={neighbour(1)}
            position={openIndex >= 0 ? openIndex + 1 : undefined}
            total={speakers.length}
            direction={direction}
            roster={speakers}
            onSelect={jumpTo}
          />
        )}
      </AnimatePresence>
    </>
  );
}