/** The speaker flyer expansion — the printed event flyer rebuilt in HTML/CSS.
 *  Opens as a centred overlay, shares the portrait layout with the row tile,
 *  and supports arrow navigation, Escape, click-outside and focus trapping. */
import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Year2026 } from "./Year2026";
import { LoveEmblem } from "./LoveEmblem";
import { WCE_PARTNERS } from "./PartnerMarquee";
import { CornerVine } from "./ornaments";
import { FlowerOfLifeField, EdgeFoliage, DiamondRule } from "./decor";
import { useWceReducedMotion } from "./motion";
import { WceSpeaker, themeLines, speakerInitials } from "./speaker-utils";

const EASE = [0.22, 1, 0.36, 1] as const;

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function SpeakerFlyer({
  speaker,
  onClose,
  onPrev,
  onNext,
}: {
  speaker: WceSpeaker;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const reduced = useWceReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  /* Body scroll lock */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* Keyboard: Escape, arrows, Tab trap */
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); onPrev(); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); onNext(); return; }
      if (e.key !== "Tab") return;
      const root = panelRef.current;
      if (!root) return;
      const items = Array.from(
        root.querySelectorAll<HTMLElement>('button, [href], input, [tabindex]:not([tabindex="-1"])')
      ).filter((el) => !el.hasAttribute("disabled"));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!root.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  const jump = useCallback((id: string) => { onClose(); setTimeout(() => scrollToId(id), 60); }, [onClose]);

  const lines = themeLines(speaker.theme);
  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: EASE },
        };

  return (
    <motion.div
      className="wce-flyer-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${speaker.name} — event flyer`}
      initial={reduced ? { opacity: 0 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.2 : 0.35, ease: EASE }}
    >
      <div className="wce-flyer-scroll" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <motion.div
          ref={panelRef}
          className="wce-flyer"
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.99 }}
          transition={{ duration: reduced ? 0.2 : 0.45, ease: EASE }}
        >
          <FlowerOfLifeField className="wce-surface-bg" opacity={0.05} />
          <EdgeFoliage side="left" opacity={0.06} drift={false} />
          <EdgeFoliage side="right" opacity={0.06} drift={false} />
          <CornerVine className="pointer-events-none absolute left-3 top-3 opacity-70" />
          <CornerVine flip className="pointer-events-none absolute right-3 top-3 opacity-70" />
          <CornerVine flip className="pointer-events-none absolute bottom-3 left-3 rotate-180 opacity-60" />
          <CornerVine className="pointer-events-none absolute bottom-3 right-3 rotate-180 opacity-60" />

          <button ref={closeRef} type="button" className="wce-flyer-close" onClick={onClose} aria-label="Close speaker flyer">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" className="wce-flyer-arrow left" onClick={onPrev} aria-label="Previous speaker">
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button type="button" className="wce-flyer-arrow right" onClick={onNext} aria-label="Next speaker">
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="relative z-10 px-5 pb-0 pt-14 sm:px-10 sm:pt-12">
            {/* Top lockup */}
            <motion.div className="wce-flyer-lockup" {...rise(0.05)}>
              <div className="wce-flyer-wordmark">
                <span>Caribbean</span>
                <span>Wellness</span>
                <span>Saint Lucia</span>
                <p className="wce-flyer-tagline">
                  Wellness Symposium <i>|</i> Fortification Retreat <i>|</i> Lifecraft Experience
                </p>
              </div>
              <div className="wce-flyer-year">
                <Year2026 animate={!reduced} start duration={900} />
              </div>
              <span aria-hidden="true" className="wce-flyer-vrule" />
              <p className="wce-flyer-dates">11–17 October</p>
            </motion.div>

            <motion.p className="wce-flyer-venue" {...rise(0.12)}>
              Mount Kailash Rejuvenation Centre
            </motion.p>
            <motion.div {...rise(0.16)}>
              <DiamondRule className="mx-auto mt-4 max-w-[10rem]" tone="var(--wce-gold)" />
              <p className="wce-flyer-featuring">Featuring</p>
            </motion.div>

            {/* Name block */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`name-${speaker.id}`}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                {speaker.prefix?.trim() && <p className="wce-flyer-prefix">{speaker.prefix}</p>}
                <h2 className="wce-flyer-name">{speaker.name}</h2>
                {speaker.title?.trim() && <p className="wce-flyer-title">“{speaker.title}”</p>}
              </motion.div>
            </AnimatePresence>

            {/* Theme word | portrait | emblem */}
            <div className="wce-flyer-stage">
              <motion.div className="wce-flyer-themeword" aria-hidden="true" {...rise(0.24)}>
                {lines.map((l, i) => (
                  <span key={`${l}-${i}`}>{l}</span>
                ))}
              </motion.div>

              <motion.div layoutId={`wce-portrait-${speaker.id}`} className="wce-flyer-portrait" transition={{ duration: reduced ? 0 : 0.55, ease: EASE }}>
                <span aria-hidden="true" className="wce-flyer-portrait-ring" />
                <div className="wce-flyer-portrait-mask">
                  <AnimatePresence mode="wait" initial={false}>
                    {speaker.portrait_url ? (
                      <motion.img
                        key={speaker.portrait_url}
                        src={speaker.portrait_url}
                        alt={speaker.name}
                        initial={reduced ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduced ? undefined : { opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        decoding="async"
                      />
                    ) : (
                      <span key="initials" className="wce-flyer-initials">{speakerInitials(speaker.name)}</span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              <motion.div className="wce-flyer-emblem" {...rise(0.3)}>
                <LoveEmblem size={190} variant="color" />
              </motion.div>
            </div>

            {speaker.session_title?.trim() && (
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`session-${speaker.id}`}
                  className="wce-flyer-session"
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  {speaker.session_title}
                  {speaker.session_time?.trim() ? ` · ${speaker.session_time}` : ""}
                </motion.p>
              </AnimatePresence>
            )}
          </div>

          {/* Reserve band */}
          <motion.div className="wce-flyer-band" {...rise(0.36)}>
            <p className="wce-flyer-band-title">Reserve Your Spot</p>
            <div className="wce-flyer-band-ctas">
              <button type="button" className="wce-btn wce-btn-gold" onClick={() => jump("pathways")}>
                Reserve Your Spot
              </button>
              <button type="button" className="wce-btn wce-btn-outline" onClick={() => jump("apply")}>
                Apply for the Retreat
              </button>
            </div>
          </motion.div>

          {/* Powered by */}
          <div className="wce-flyer-footer">
            <span className="wce-flyer-poweredby">Powered by</span>
            <ul className="wce-flyer-partners">
              {WCE_PARTNERS.map((p) => (
                <li key={p.name}>
                  {p.logoUrl ? (
                    <img src={p.logoUrl} alt={p.name} loading="lazy" decoding="async" />
                  ) : (
                    <span>{p.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}