/** Application confirmation — a small ceremony rather than a status change.
 *  Gold circle draws clockwise, a checkmark draws inside it, the lotus blooms
 *  outward behind it, a radial glow settles, then the copy masked-slides up.
 *  Total sequence stays under 2s. Reduced motion → the finished state, instantly. */
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LeafDivider } from "./ornaments";
import { useWceReducedMotion, useIsMobile, MaskedHeading } from "./motion";

const EASE = [0.22, 1, 0.36, 1] as const;

function Seal({ reduced }: { reduced: boolean }) {
  return (
    <span className="wce-seal">
      {/* Radial glow settling behind the whole group */}
      <motion.span
        aria-hidden="true"
        className="wce-seal-glow"
        initial={reduced ? { opacity: 0.55, scale: 1 } : { opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.55, scale: 1 }}
        transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : 0.25, ease: EASE }}
      />
      {/* Lotus blooming outward from behind the circle */}
      <svg className="wce-seal-lotus" width="180" height="180" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <motion.g
          initial={reduced ? { opacity: 0.85, scale: 1 } : { opacity: 0, scale: 0.55 }}
          animate={{ opacity: 0.85, scale: 1 }}
          transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 0.45, ease: EASE }}
          style={{ transformOrigin: "24px 24px" }}
        >
          {[
            "M24 8c4 6 6 11 6 15s-2 8-6 12c-4-4-6-8-6-12s2-9 6-15z",
            "M24 35c-5-2-9-6-11-11-1-3-1-6 0-9 5 2 9 7 11 12",
            "M24 35c5-2 9-6 11-11 1-3 1-6 0-9-5 2-9 7-11 12",
            "M8 30c4 8 9 12 16 13 7-1 12-5 16-13",
          ].map((d, i) => (
            <motion.path
              key={d}
              d={d}
              pathLength={1}
              stroke="var(--wce-gold)"
              strokeWidth={i === 3 ? 0.9 : 1.1}
              initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 0.45 + i * 0.05, ease: EASE }}
            />
          ))}
        </motion.g>
      </svg>
      {/* Circle + checkmark — drawn with stroke-dasharray (see wce.css) */}
      <svg
        className={`wce-seal-ring ${reduced ? "is-static" : "is-drawing"}`}
        width="96" height="96" viewBox="0 0 100 100" fill="none" aria-hidden="true"
      >
        <circle
          className="wce-seal-circle"
          cx="50" cy="50" r="44"
          stroke="var(--wce-gold)" strokeWidth="2.5" strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <path
          className="wce-seal-check"
          d="M31 52l13 13 25-27"
          stroke="var(--wce-gold-light)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Brief gold particle drift, desktop only, stops after ~2s. */
function Motes() {
  const motes = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({
      left: `${8 + ((i * 37) % 84)}%`,
      delay: (i % 7) * 0.12,
      dur: 1.5 + ((i % 4) * 0.18),
      size: 2 + (i % 3),
    })),
    [],
  );
  return (
    <span aria-hidden="true" className="wce-motes">
      {motes.map((m, i) => (
        <motion.span
          key={i}
          style={{ left: m.left, width: m.size, height: m.size }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: [0, 0.85, 0], y: -70 }}
          transition={{ duration: m.dur, delay: m.delay, ease: "easeOut" }}
        />
      ))}
    </span>
  );
}

export function WceFormSuccess({ contactLabel }: { contactLabel: string }) {
  const reduced = useWceReducedMotion();
  const mobile = useIsMobile();
  const [motes, setMotes] = useState(!reduced && !mobile);

  useEffect(() => {
    if (!motes) return;
    const t = window.setTimeout(() => setMotes(false), 2200);
    return () => window.clearTimeout(t);
  }, [motes]);

  return (
    <div
      className="wce-form-confirm relative flex flex-col items-center justify-center py-6 text-center"
      role="status"
      aria-live="polite"
    >
      {motes && <Motes />}
      <Seal reduced={reduced} />
      <MaskedHeading
        lines={["Thank You — Your Application Is In"]}
        delay={reduced ? 0 : 900}
        className="mt-10 text-[clamp(1.6rem,3.4vw,2.3rem)] leading-tight"
        style={{ color: "var(--wce-cream)" }}
      />
      <MaskedHeading
        as="p"
        lines={[`Our team will be in touch personally by ${contactLabel}`, "about your place at Caribbean Wellness Saint Lucia 2026."]}
        delay={reduced ? 0 : 1150}
        className="mt-6 max-w-md text-sm leading-relaxed"
        style={{ color: "rgba(var(--wce-cream-rgb), 0.9)" }}
      />
      <LeafDivider className="mt-9 w-full max-w-xs" />
    </div>
  );
}
