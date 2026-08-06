/** Visionary Leaders — featured panel, the row of six, and the flyer expansion. */
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
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
      className={`wce-speaker wce-card ${held ? "is-on" : ""}`}
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
          </span>
      </span>

      <span className="wce-speaker-meta">
        {speaker.theme && (
          <span className="wce-card-theme">{speaker.theme}</span>
        )}
        <p className="wce-speaker-name mt-2 text-[1rem] leading-tight sm:text-[1.08rem]">
          {speaker.prefix ? `${speaker.prefix} ` : ""}{speaker.name}
        </p>
        <DiamondRule className="mx-auto mt-2 max-w-[3.2rem]" tone="rgba(201,162,39,0.9)" />
        {speaker.title && (
          <p className="mt-2 text-[0.58rem] uppercase" style={{ color: "var(--wce-gold-text)", letterSpacing: "0.2em" }}>
            {speaker.title}
          </p>
        )}
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
        <p className="mt-5 text-[0.68rem] uppercase" style={{ color: "var(--wce-gold-light)", letterSpacing: "0.24em" }}>
          {speaker.title?.trim() || "Grand Master Herbal Physician · Founder, Mount Kailash"}
        </p>
        {speaker.theme && (
          <p className="mt-4 italic" style={{ color: "var(--wce-gold)", fontFamily: "var(--wce-display)", fontSize: "1.3rem" }}>
            {speaker.theme}
          </p>
        )}
        {speaker.session_title && (
          <p className="mt-5 text-sm leading-relaxed sm:text-base" style={{ color: "rgba(245,239,224,0.9)" }}>
            {speaker.session_title}
          </p>
        )}
        <span className="mt-7 inline-block text-[0.62rem] uppercase" style={{ color: "var(--wce-gold-light)", letterSpacing: "0.24em" }}>
          View flyer
        </span>
      </div>
    </button>
  );
}

export function WceSpeakersSection() {
  const { data, isLoading } = useWceSpeakers();
  const { ref: sectionRef, inView } = useInView<HTMLElement>();
  const lift = useSectionLift<HTMLElement>();
  const fired = useRef(false);
  const cards = useRef<Record<string, HTMLButtonElement | null>>({});
  const [openId, setOpenId] = useState<string | null>(null);

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

  const step = useCallback(
    (dir: 1 | -1) => {
      setOpenId((cur) => {
        if (!cur || !speakers.length) return cur;
        const i = speakers.findIndex((s) => s.id === cur);
        const next = (i + dir + speakers.length) % speakers.length;
        return speakers[next].id;
      });
    },
    [speakers]
  );

  const close = useCallback(() => {
    const id = openId;
    setOpenId(null);
    if (id) requestAnimationFrame(() => cards.current[id]?.focus());
  }, [openId]);

  const setCardRef = (id: string) => (el: HTMLButtonElement | null) => { cards.current[id] = el; };

  return (
    <>
      <section
        id="speakers"
        ref={sectionRef}
        className="wce-surface px-6 py-24 sm:py-32"
        style={{ background: "var(--wce-cream-warm)", ...lift.style }}
      >
        <FlowerOfLifeField className="wce-surface-bg" opacity={0.04} drift />
        <BotanicalBackdrop intensity={1.05} />
        <div className="mx-auto max-w-6xl text-center">
          <Reveal><GoldFlourish className="mx-auto" size={58} /></Reveal>
          <Reveal><LotusMark size={30} className="mx-auto mt-3" /></Reveal>
          <MaskedHeading
            lines={["Visionary Leaders"]}
            className="mt-8 text-[clamp(2rem,5vw,3.4rem)] uppercase"
            style={{ color: "var(--wce-forest)", letterSpacing: "0.1em" }}
          />
          <Reveal index={1}>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed sm:text-base" style={{ color: "rgba(26,26,20,0.88)" }}>
              Guided by voices in wellness, medicine, movement, sovereignty, leadership, transformation, and restoration.
            </p>
            <LeafDivider className="mt-10" />
          </Reveal>

          {isLoading && <SpeakersSkeleton />}

          {featured && (
            <Reveal index={2}>
              <FeaturedSpeaker
                speaker={featured}
                onOpen={() => setOpenId(featured.id)}
                cardRef={setCardRef(featured.id)}
              />
            </Reveal>
          )}

          <ul className="mt-16 grid grid-cols-2 gap-x-5 gap-y-14 sm:mt-20 sm:grid-cols-3 lg:grid-cols-6">
            {rest.map((s, i) => (
              <Reveal key={s.id} as="li" index={i % 6}>
                <SpeakerTile
                  speaker={s}
                  onOpen={() => setOpenId(s.id)}
                  cardRef={setCardRef(s.id)}
                />
              </Reveal>
            ))}
          </ul>

          {speakers.length > 0 && (
            <div className="mt-16">
              <button
                type="button"
                onClick={() => setOpenId(speakers[0].id)}
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
          />
        )}
      </AnimatePresence>
    </>
  );
}