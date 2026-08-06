/** Shared decorative primitives for the WCE 2026 page.
 *  Purely presentational — every element is aria-hidden and non-interactive. */
import { CSSProperties } from "react";
import { useDrift } from "./motion";

/* ---------- Flower of life ---------- */
const FOL_R = 30;
function folTile(stroke = "%23C9A227", width = 0.9) {
  const r = FOL_R;
  const h = r * Math.sqrt(3);
  const circles: string[] = [];
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      const x = i * r + (Math.abs(j % 2) === 1 ? r / 2 : 0);
      const y = (j * h) / 2;
      circles.push(`<circle cx='${x.toFixed(2)}' cy='${y.toFixed(2)}' r='${r}'/>`);
    }
  }
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${r}' height='${h.toFixed(2)}' viewBox='0 0 ${r} ${h.toFixed(2)}'><g fill='none' stroke='${stroke}' stroke-width='${width}'>${circles.join("")}</g></svg>`;
}

const FOL_GOLD = folTile();
const FOL_LIGHT = folTile("%23E4C766", 0.8);

/** Faint repeating sacred-geometry watermark. Texture, not decoration. */
export function FlowerOfLifeField({
  opacity = 0.04,
  size = 118,
  light = false,
  className = "",
  style,
  drift = false,
}: {
  opacity?: number;
  size?: number;
  light?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Scroll-linked slow drift, so the watermark lags behind the content. */
  drift?: boolean;
}) {
  const driftRef = useDrift<HTMLSpanElement>(0.12);
  return (
    <span
      ref={drift ? driftRef : undefined}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 ${drift ? "-inset-y-[14%]" : "inset-y-0"} ${className}`}
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,${light ? FOL_LIGHT : FOL_GOLD}")`,
        backgroundSize: `${size}px auto`,
        backgroundRepeat: "repeat",
        willChange: drift ? "transform" : undefined,
        ...style,
      }}
    />
  );
}

/** A single centred flower-of-life medallion (used inside dark panels). */
export function FlowerOfLifeMark({ size = 220, opacity = 0.12, className = "", style }: {
  size?: number; opacity?: number; className?: string; style?: CSSProperties;
}) {
  const r = 22;
  const pts: { x: number; y: number }[] = [];
  for (let i = -3; i <= 3; i++) {
    for (let j = -3; j <= 3; j++) {
      const x = 50 + i * r * 0.5 + (Math.abs(j % 2) === 1 ? r * 0.25 : 0);
      const y = 50 + j * r * 0.433;
      if (Math.hypot(x - 50, y - 50) <= r * 1.2) pts.push({ x, y });
    }
  }
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ opacity, ...style }}
      fill="none"
    >
      <g stroke="var(--wce-gold)" strokeWidth="0.4">
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={r * 0.5} />)}
        <circle cx="50" cy="50" r={r * 1.2} strokeWidth="0.6" />
        <circle cx="50" cy="50" r={r * 1.34} strokeWidth="0.3" />
      </g>
    </svg>
  );
}

/* ---------- Edge foliage ---------- */
function FoliageArt() {
  return (
    <svg width="220" height="420" viewBox="0 0 220 420" fill="none" aria-hidden="true">
      <g stroke="var(--wce-gold)" strokeWidth="1" fill="none" opacity="0.9">
        <path d="M-10 40C60 70 96 130 108 210" />
        <path d="M-4 44c34-6 62 6 78 34-30 10-58 0-78-34z" />
        <path d="M18 96c34-4 60 10 74 40-32 8-58-4-74-40z" />
        <path d="M44 156c32 0 56 16 68 46-32 6-56-8-68-46z" />
        <path d="M72 220c28 6 48 26 56 56-30 2-50-16-56-56z" />
        <path d="M-10 150C40 190 70 250 78 330" />
        <path d="M-6 156c30-10 58-2 78 24-28 16-56 12-78-24z" />
        <path d="M18 214c30-8 56 2 72 28-28 16-54 10-72-28z" />
        <path d="M46 278c26-6 50 6 62 32-28 12-50 2-62-32z" />
      </g>
    </svg>
  );
}

/** Soft gold botanical silhouettes bleeding in from a section edge. Desktop only. */
export function EdgeFoliage({ side = "left", opacity = 0.16, className = "", drift = true }: {
  side?: "left" | "right"; opacity?: number; className?: string; drift?: boolean;
}) {
  const driftRef = useDrift<HTMLSpanElement>(0.14);
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2 lg:block ${side === "left" ? "left-0" : "right-0"} ${className}`}
      style={{ opacity, transform: `translateY(-50%) ${side === "right" ? "scaleX(-1)" : ""}` }}
    >
      <span ref={drift ? driftRef : undefined} className="block will-change-transform">
        <FoliageArt />
      </span>
    </span>
  );
}

/** Soft gradient bleed used where a cream section meets a dark one. */
export function EdgeBleed({ position = "top" }: { position?: "top" | "bottom" }) {
  return <span aria-hidden="true" className={`wce-bleed wce-bleed-${position}`} />;
}

/* ---------- Layered botanical backdrop ---------- */

/** A broad palm frond silhouette. */
function FrondArt({ tone }: { tone: string }) {
  return (
    <svg width="360" height="560" viewBox="0 0 360 560" fill="none" aria-hidden="true">
      <g stroke={tone} strokeWidth="1.1" fill="none">
        <path d="M18 8C120 120 176 300 190 552" />
        {Array.from({ length: 11 }).map((_, i) => {
          const y = 40 + i * 46;
          const x = 26 + i * 15;
          const len = 150 - i * 6;
          return (
            <g key={i}>
              <path d={`M${x} ${y}c${len * 0.55} -${len * 0.4} ${len} -${len * 0.2} ${len} ${len * 0.16}c-${len * 0.6} ${len * 0.2} -${len * 0.85} ${len * 0.02} -${len} -${len * 0.16}z`} />
              <path d={`M${x} ${y + 18}c-${len * 0.5} -${len * 0.3} -${len * 0.8} -${len * 0.1} -${len * 0.8} ${len * 0.2}c${len * 0.5} ${len * 0.16} ${len * 0.7} 0 ${len * 0.8} -${len * 0.2}z`} opacity="0.7" />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/** A monstera-like leaf cluster silhouette. */
function LeafClusterArt({ tone }: { tone: string }) {
  return (
    <svg width="320" height="380" viewBox="0 0 320 380" fill="none" aria-hidden="true">
      <g stroke={tone} strokeWidth="1.1" fill="none">
        <path d="M160 372C150 260 120 190 40 130" />
        <path d="M164 372c8-110 34-180 112-236" />
        <path d="M40 128c-24-48-6-92 40-104 26 44 18 88-40 104z" />
        <path d="M276 136c26-46 10-92-36-106-28 44-20 88 36 106z" />
        <path d="M96 214c-40-16-58-58-38-98 44 12 62 52 38 98z" />
        <path d="M222 220c40-18 56-60 34-98-44 14-60 54-34 98z" />
        <path d="M158 168c-30-30-30-76 2-104 30 28 30 74-2 104z" />
      </g>
    </svg>
  );
}

/** Heliconia / bird-of-paradise stems. */
function StemArt({ tone }: { tone: string }) {
  return (
    <svg width="260" height="440" viewBox="0 0 260 440" fill="none" aria-hidden="true">
      <g stroke={tone} strokeWidth="1.1" fill="none">
        <path d="M40 436C60 300 90 210 172 120" />
        <path d="M172 120c-16-34-4-66 30-80 14 38 4 68-30 80z" />
        <path d="M132 190c-34-8-52-38-42-72 34 6 52 36 42 72z" />
        <path d="M104 262c34-10 52-42 40-76-34 8-50 40-40 76z" />
        <path d="M74 340c-32-10-48-40-38-72 32 8 48 38 38 72z" />
      </g>
    </svg>
  );
}

/**
 * Layered botanical silhouettes for a leafy, cultivated-garden feel behind a
 * section. Overlapping gold and sage forms, drifting slightly slower than the
 * content, plus a soft warm vignette at the outer edges. Desktop only.
 */
export function BotanicalBackdrop({
  intensity = 1,
  side = "both",
  vignette = true,
  onDark = false,
}: {
  /** Multiplies the base opacities (0.05–0.07 range). */
  intensity?: number;
  side?: "both" | "left" | "right";
  vignette?: boolean;
  onDark?: boolean;
}) {
  const slow = useDrift<HTMLSpanElement>(0.08);
  const slower = useDrift<HTMLSpanElement>(0.05);
  const gold = onDark ? "var(--wce-gold-light)" : "var(--wce-gold)";
  const sage = onDark ? "var(--wce-gold-light)" : "var(--wce-moss)";
  const o = (v: number) => Math.min(0.09, v * intensity);

  return (
    <span aria-hidden="true" className="wce-botanical">
      {side !== "right" && (
        <span className="wce-botanical-left">
          <span ref={slow} className="wce-botanical-a" style={{ opacity: o(0.07) }}>
            <FrondArt tone={gold} />
          </span>
          <span ref={slower} className="wce-botanical-b" style={{ opacity: o(0.055) }}>
            <LeafClusterArt tone={sage} />
          </span>
        </span>
      )}
      {side !== "left" && (
        <span className="wce-botanical-right">
          <span className="wce-botanical-a" style={{ opacity: o(0.065) }}>
            <FrondArt tone={sage} />
          </span>
          <span className="wce-botanical-c" style={{ opacity: o(0.05) }}>
            <StemArt tone={gold} />
          </span>
        </span>
      )}
      {vignette && <span className={`wce-vignette ${onDark ? "on-dark" : ""}`} />}
    </span>
  );
}

/* ---------- Pathway watermarks ---------- */

/** Single peak — the In Person tier. */
export function PeakMark({ tone = "var(--wce-forest)" }: { tone?: string }) {
  return (
    <svg viewBox="0 0 200 100" fill="none" preserveAspectRatio="none" aria-hidden="true" className="h-full w-full">
      <g stroke={tone} strokeWidth="1.2" fill="none">
        <path d="M0 100 L100 8 L200 100" />
        <path d="M62 100 L100 42 L138 100" opacity="0.7" />
        <path d="M84 26 L100 8 L116 26" opacity="0.5" />
      </g>
    </svg>
  );
}

/** Broadcast waves — the Online tier. */
export function WaveMark({ tone = "var(--wce-forest)" }: { tone?: string }) {
  return (
    <svg viewBox="0 0 200 100" fill="none" preserveAspectRatio="none" aria-hidden="true" className="h-full w-full">
      <g stroke={tone} strokeWidth="1.2" fill="none">
        {[18, 34, 50, 66, 82].map((r, i) => (
          <path key={r} d={`M${100 - r * 1.6} 100a${r * 1.6} ${r} 0 0 1 ${r * 3.2} 0`} opacity={0.85 - i * 0.12} />
        ))}
        <circle cx="100" cy="100" r="4" />
        <path d="M0 100h200" opacity="0.4" />
      </g>
    </svg>
  );
}

/** Full range — the Retreat tier. */
export function RangeMark({ tone = "var(--wce-gold)" }: { tone?: string }) {
  return (
    <svg viewBox="0 0 200 100" fill="none" preserveAspectRatio="none" aria-hidden="true" className="h-full w-full">
      <g stroke={tone} strokeWidth="1.2" fill="none">
        <path d="M-4 100 L34 46 L62 74 L96 22 L134 78 L162 52 L204 100" />
        <path d="M-4 100 L28 66 L58 88 L92 50 L128 92 L160 70 L204 100" opacity="0.6" />
        <path d="M86 34 L96 22 L106 34" opacity="0.5" />
        <path d="M26 58 L34 46 L42 58" opacity="0.4" />
      </g>
    </svg>
  );
}

/* ---------- Rules, flourishes, icons ---------- */

/** Thin gold rule with a small diamond at its centre. */
export function DiamondRule({ className = "", tone = "var(--wce-gold)", width = "100%" }: {
  className?: string; tone?: string; width?: string;
}) {
  return (
    <span aria-hidden="true" className={`flex items-center justify-center gap-2 ${className}`} style={{ width }}>
      <span className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${tone})`, opacity: 0.75 }} />
      <span className="block h-[6px] w-[6px] rotate-45" style={{ background: tone }} />
      <span className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${tone})`, opacity: 0.75 }} />
    </span>
  );
}

/** The small gold arch flourish that sits above section headings in the mockup. */
export function GoldFlourish({ size = 54, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size * 0.62}
      viewBox="0 0 80 50"
      fill="none"
    >
      <g stroke="var(--wce-gold)" strokeWidth="1" opacity="0.9">
        <path d="M40 6c9 8 15 17 15 26 0 8-6 14-15 18-9-4-15-10-15-18 0-9 6-18 15-26z" />
        <path d="M40 12v38" strokeWidth="0.6" opacity="0.6" />
        <path d="M8 44c10-14 20-20 32-20s22 6 32 20" strokeWidth="0.7" opacity="0.55" />
        <circle cx="6" cy="44" r="2" strokeWidth="0.8" />
        <circle cx="74" cy="44" r="2" strokeWidth="0.8" />
      </g>
    </svg>
  );
}

export function CheckMark({ tone = "var(--wce-gold)", size = 14 }: { tone?: string; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 16 16" fill="none" className="mt-[3px] shrink-0">
      <path d="M2.5 8.5l3.6 3.6L13.5 4.5" stroke={tone} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LeafIcon({ tone = "var(--wce-gold)", size = 14 }: { tone?: string; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path d="M13.5 2.5c0 6-4 9.5-9 9.5 0-5.5 3.5-9 9-9.5z" stroke={tone} strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M2.5 13.5C5 11 8 9 11.5 4.5" stroke={tone} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/** Tiny gold pictograms used beside the retreat band value lines. */
export function RitualIcon({ tone = "var(--wce-gold)", size = 26 }: { tone?: string; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14 5c3 4 4.5 7 4.5 9.5S16.5 19 14 21c-2.5-2-4.5-4-4.5-6.5S11 9 14 5z" stroke={tone} strokeWidth="1.1" />
      <path d="M4 16c3 5 6 7.5 10 8 4-.5 7-3 10-8" stroke={tone} strokeWidth="0.9" opacity="0.75" />
    </svg>
  );
}

export function ConnectionIcon({ tone = "var(--wce-gold)", size = 26 }: { tone?: string; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d="M14 22s-8-4.6-8-10a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.4-8 10-8 10z" stroke={tone} strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

export function TransformationIcon({ tone = "var(--wce-gold)", size = 26 }: { tone?: string; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="5" stroke={tone} strokeWidth="1.1" />
      <path d="M14 3v4M14 21v4M3 14h4M21 14h4M6.2 6.2l2.8 2.8M19 19l2.8 2.8M21.8 6.2L19 9M9 19l-2.8 2.8" stroke={tone} strokeWidth="1" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}
