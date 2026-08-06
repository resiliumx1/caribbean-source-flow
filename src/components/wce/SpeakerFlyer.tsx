/** The speaker flyer expansion — the printed event flyer rebuilt in HTML/CSS.
 *  Opens as a centred overlay, shares the portrait layout with the row tile,
 *  and supports arrow navigation, Escape, click-outside and focus trapping. */
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Year2026 } from "./Year2026";
import { LoveEmblem } from "./LoveEmblem";
import { WCE_PARTNERS } from "./PartnerMarquee";
import { CornerVine } from "./ornaments";
import { FlowerOfLifeField, EdgeFoliage, DiamondRule } from "./decor";
import { useWceReducedMotion } from "./motion";
import { WceSpeaker, themeLines, speakerInitials } from "./speaker-utils";
import { speakerPortrait } from "./speaker-portraits";
import { trackWceCta } from "./cta-tracking";

const EASE = [0.22, 1, 0.36, 1] as const;

const FOCUSABLE =
  'a[href], area[href], button, input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])';

/** Tabbable, currently-rendered controls inside the flyer, in DOM order. */
function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) =>
      !el.hasAttribute("disabled") &&
      el.getAttribute("aria-hidden") !== "true" &&
      el.tabIndex !== -1 &&
      (el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement),
  );
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function SpeakerFlyer({
  speaker,
  onClose,
  onPrev,
  onNext,
  prevName,
  nextName,
  position,
  total,
  direction = 1,
  roster = [],
  onSelect,
}: {
  speaker: WceSpeaker;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  /** Names of the neighbouring speakers, so the arrows announce their target. */
  prevName?: string;
  nextName?: string;
  /** 1-based position used by the live region announcement. */
  position?: number;
  total?: number;
  /** Direction of the last navigation: 1 forward, -1 back. Drives the card turn. */
  direction?: 1 | -1;
  /** Full speaker order, for the progress dots and adjacent-portrait preloading. */
  roster?: WceSpeaker[];
  onSelect?: (id: string) => void;
}) {
  const reduced = useWceReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  /** Set the moment a close is requested: the flyer stays mounted through its
   *  exit animation, and the trap must not fight the caller restoring focus. */
  const closingRef = useRef(false);
  const [atBottom, setAtBottom] = useState(true);
  const [imgFailed, setImgFailed] = useState(false);
  const portrait = speakerPortrait(speaker.name, speaker.portrait_url);
  /** Bumped on every speaker change so the ring ignition replays. */
  const [igniteKey, setIgniteKey] = useState(0);
  useEffect(() => { setIgniteKey((n) => n + 1); }, [speaker.id]);

  /* Preload the neighbouring portraits so the circle is never blank mid-turn. */
  useEffect(() => {
    if (!roster.length) return;
    const i = roster.findIndex((s) => s.id === speaker.id);
    if (i < 0) return;
    for (const d of [-1, 1]) {
      const n = roster[(i + d + roster.length) % roster.length];
      const url = n && speakerPortrait(n.name, n.portrait_url);
      if (url) { const img = new Image(); img.decoding = "async"; img.src = url; }
    }
  }, [roster, speaker.id]);

  const requestClose = useCallback(() => {
    closingRef.current = true;
    onClose();
  }, [onClose]);

  useEffect(() => { setImgFailed(false); }, [portrait]);

  /* Scroll affordance: fade the bottom edge until the panel is scrolled through */
  const measure = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.clientHeight - el.scrollTop < 24);
  }, []);
  useEffect(() => {
    measure();
    const el = bodyRef.current;
    if (el) el.scrollTop = 0;
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, speaker.id]);

  /* Page scroll lock — also pauses the Lenis smooth-scroll driver so the wheel
     acts on the flyer instead of the page behind it. */
  useEffect(() => {
    const body = document.body.style.overflow;
    const html = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.dispatchEvent(new CustomEvent("wce:scroll-lock", { detail: true }));
    return () => {
      document.body.style.overflow = body;
      document.documentElement.style.overflow = html;
      window.dispatchEvent(new CustomEvent("wce:scroll-lock", { detail: false }));
    };
  }, []);

  /* Hide the rest of the page from assistive tech while the flyer is open, so a
     screen reader cannot wander out of the dialog. Walks up from the overlay and
     hides each ancestor's siblings, restoring their previous values on close.
     Live regions (toasts) are left alone so announcements still reach the user. */
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const touched: Array<[Element, string | null]> = [];
    let node: HTMLElement | null = overlay;
    while (node && node !== document.body) {
      const parent: HTMLElement | null = node.parentElement;
      if (!parent) break;
      for (const sib of Array.from(parent.children)) {
        if (sib === node) continue;
        if (sib.tagName === "SCRIPT" || sib.tagName === "STYLE" || sib.tagName === "LINK") continue;
        if (sib.matches("[aria-live]") || sib.querySelector("[aria-live]")) continue;
        touched.push([sib, sib.getAttribute("aria-hidden")]);
        sib.setAttribute("aria-hidden", "true");
      }
      node = parent;
    }
    return () => {
      for (const [el, prev] of touched) {
        if (prev === null) el.removeAttribute("aria-hidden");
        else el.setAttribute("aria-hidden", prev);
      }
    };
  }, []);

  /* Focus management: move focus in on open, keep Tab and programmatic focus
     inside the panel, and let Escape / arrows drive the dialog. */
  useEffect(() => {
    const root = panelRef.current;
    // Land on the close button so the first Tab press is predictable.
    (closeRef.current ?? root)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (closingRef.current) return;
      if (e.key === "Escape") { e.preventDefault(); requestClose(); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); onPrev(); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); onNext(); return; }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const items = focusables(panel);
      if (!items.length) { e.preventDefault(); panel.focus(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (!panel.contains(active)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
      else if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    };

    // Catches focus arriving from anywhere else (mouse, browser find, AT cursor).
    const onFocusIn = (e: FocusEvent) => {
      if (closingRef.current) return;
      const panel = panelRef.current;
      const target = e.target as Node | null;
      if (!panel || !target || panel.contains(target)) return;
      const items = focusables(panel);
      (items[0] ?? panel).focus();
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [requestClose, onPrev, onNext]);

  const jump = useCallback(
    (id: string, intent: "reserve" | "apply", label: string) => {
      trackWceCta(intent, "speaker_flyer", label, { speaker_name: speaker.name });
      requestClose();
      setTimeout(() => scrollToId(id), 60);
    },
    [requestClose, speaker.name],
  );

  const lines = themeLines(speaker.theme);
  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: EASE },
        };

  /* Card-turn: outgoing text leaves in the direction of travel, incoming text
     arrives from the opposite side, staggered. Reduced motion → 150ms crossfade. */
  const turn = (stagger = 0) =>
    reduced
      ? {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0, transition: { duration: 0.15 } },
          transition: { duration: 0.15 },
        }
      : {
          initial: { opacity: 0, x: 48 * direction },
          animate: { opacity: 1, x: 0 },
          exit: {
            opacity: 0,
            x: -48 * direction,
            transition: { duration: 0.26, delay: stagger * 0.6, ease: "easeIn" as const },
          },
          transition: { duration: 0.38, delay: stagger, ease: EASE },
        };

  return (
    <motion.div
      ref={overlayRef}
      className="wce-flyer-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wce-flyer-heading"
      aria-describedby="wce-flyer-desc"
      initial={reduced ? { opacity: 0 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.2 : 0.35, ease: EASE }}
    >
      <div
        className="wce-flyer-scroll"
        data-lenis-prevent
        onMouseDown={(e) => { if (e.target === e.currentTarget) requestClose(); }}
      >
        <motion.div
          ref={panelRef}
          className="wce-flyer"
          tabIndex={-1}
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

          {/* Announces the speaker on open and on every arrow navigation. */}
          <p className="sr-only" role="status" aria-live="polite">
            {speaker.name}
            {speaker.title?.trim() ? `, ${speaker.title}` : ""}
            {position && total ? ` — speaker ${position} of ${total}` : ""}
          </p>

          <button
            ref={closeRef}
            type="button"
            className="wce-flyer-close"
            onClick={requestClose}
            aria-label="Close speaker flyer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="wce-flyer-arrow left"
            onClick={onPrev}
            aria-label={prevName ? `Previous speaker: ${prevName}` : "Previous speaker"}
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="wce-flyer-arrow right"
            onClick={onNext}
            aria-label={nextName ? `Next speaker: ${nextName}` : "Next speaker"}
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
          <span aria-hidden="true" className={`wce-flyer-fade ${atBottom ? "is-hidden" : ""}`} />

          <div ref={bodyRef} className="wce-flyer-body" data-lenis-prevent onScroll={measure}>
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
                {...turn(0)}
              >
                {speaker.prefix?.trim() && <p className="wce-flyer-prefix">{speaker.prefix}</p>}
                <h2 id="wce-flyer-heading" className="wce-flyer-name">{speaker.name}</h2>
                {speaker.title?.trim() && <p className="wce-flyer-title">“{speaker.title}”</p>}
              </motion.div>
            </AnimatePresence>

            {/* Theme word | portrait | emblem */}
            <div className="wce-flyer-stage">
              {/* Theme word crossfades on a slower curve so it lags the rest. */}
              <div className="wce-flyer-themeword-slot" aria-hidden="true">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`theme-${speaker.id}`}
                    className="wce-flyer-themeword"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: reduced ? 0.15 : 0.5, ease: EASE } }}
                    transition={{ duration: reduced ? 0.15 : 0.5, ease: EASE }}
                  >
                    {lines.map((l, i) => (
                      <span key={`${l}-${i}`}>{l}</span>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="wce-flyer-portrait">
                <span aria-hidden="true" className="wce-flyer-portrait-ring" />
                <span key={igniteKey} aria-hidden="true" className="wce-flyer-ring-ignite" />
                <div className="wce-flyer-portrait-mask">
                  {/* The circle stays anchored; only the person inside it changes. */}
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={`portrait-${speaker.id}`}
                      className="wce-flyer-portrait-layer"
                      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={
                        reduced
                          ? { opacity: 0, transition: { duration: 0.15 } }
                          : { opacity: 0, scale: 0.94, transition: { duration: 0.26, ease: "easeIn" } }
                      }
                      transition={{ duration: reduced ? 0.15 : 0.38, ease: EASE }}
                    >
                      {portrait && !imgFailed ? (
                        <img
                          src={portrait}
                          alt={speaker.name}
                          decoding="async"
                          onError={() => setImgFailed(true)}
                        />
                      ) : (
                        <span className="wce-flyer-initials">{speakerInitials(speaker.name)}</span>
                      )}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              <motion.div className="wce-flyer-emblem" {...rise(0.3)}>
                <LoveEmblem size={190} variant="color" />
              </motion.div>
            </div>

            {speaker.session_title?.trim() && (
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`session-${speaker.id}`}
                  className="wce-flyer-session"
                  {...turn(0.06)}
                >
                  {speaker.session_title}
                  {speaker.session_time?.trim() ? ` · ${speaker.session_time}` : ""}
                </motion.p>
              </AnimatePresence>
            )}

            <p id="wce-flyer-desc" className={speaker.bio?.trim() ? "wce-flyer-bio" : "sr-only"}>
              {speaker.bio?.trim()
                ? speaker.bio
                : `Event flyer for ${speaker.name}. Use the left and right arrow keys to move between speakers, or Escape to close.`}
            </p>
          </div>

          {/* Reserve band */}
          <motion.div className="wce-flyer-band" {...rise(0.36)}>
            <p className="wce-flyer-band-title">Reserve Your Spot</p>
            <div className="wce-flyer-band-ctas">
              <button
                type="button"
                className="wce-btn wce-btn-gold"
                onClick={() => jump("pathways", "reserve", "Reserve Your Spot")}
              >
                Reserve Your Spot
              </button>
              <button
                type="button"
                className="wce-btn wce-btn-outline"
                onClick={() => jump("apply", "apply", "Apply for the Retreat")}
              >
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

          {/* Progress dots — jump straight to any speaker */}
          {roster.length > 1 && (
            <nav className="wce-flyer-dots" aria-label="Speakers">
              {roster.map((s, i) => {
                const active = s.id === speaker.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`wce-flyer-dot ${active ? "is-active" : ""}`}
                    aria-label={`Speaker ${i + 1} of ${roster.length}: ${s.name}`}
                    aria-current={active ? "true" : undefined}
                    onClick={() => onSelect?.(s.id)}
                  >
                    <span aria-hidden="true" />
                  </button>
                );
              })}
            </nav>
          )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}