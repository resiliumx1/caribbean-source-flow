/** Shared decorative primitives for the WCE 2026 page.
 *  Purely presentational — every element is aria-hidden and non-interactive. */
import { CSSProperties } from "react";

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
}: {
  opacity?: number;
  size?: number;
  light?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,${light ? FOL_LIGHT : FOL_GOLD}")`,
        backgroundSize: `${size}px auto`,
        backgroundRepeat: "repeat",
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
export function EdgeFoliage({ side = "left", opacity = 0.16, className = "" }: {
  side?: "left" | "right"; opacity?: number; className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2 lg:block ${side === "left" ? "left-0" : "right-0"} ${className}`}
      style={{ opacity, transform: `translateY(-50%) ${side === "right" ? "scaleX(-1)" : ""}` }}
    >
      <FoliageArt />
    </span>
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
