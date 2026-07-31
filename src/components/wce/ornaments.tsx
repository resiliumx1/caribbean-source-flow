/** Gold botanical / line-art ornamentation for the WCE 2026 page.
 *  Each ornament draws itself in when scrolled into view (stroke-dashoffset),
 *  and renders fully drawn under prefers-reduced-motion. */
import { CSSProperties, ReactNode } from "react";
import { useInView, useWceReducedMotion } from "./motion";

/** Wraps an SVG so its stroked paths draw in on first view. */
function Draw({
  children,
  delay = 0,
  className = "",
  style,
  width,
  height,
  viewBox,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  width: number;
  height: number;
  viewBox: string;
}) {
  const reduced = useWceReducedMotion();
  const { ref, inView } = useInView<SVGSVGElement>();
  const drawn = reduced || inView;
  return (
    <svg
      ref={ref as any}
      className={`wce-draw ${drawn ? "is-drawn" : ""} ${className}`}
      style={{ ...style, ["--wce-draw-delay" as any]: `${delay}ms` }}
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function LeafDivider({ className = "" }: { className?: string }) {
  const reduced = useWceReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  const drawn = reduced || inView ? "is-drawn" : "";
  return (
    <div ref={ref} className={`flex items-center justify-center gap-4 ${className}`} aria-hidden="true">
      <span className={`wce-divider-rule left ${drawn} h-px w-16 sm:w-28 bg-gradient-to-r from-transparent to-[var(--wce-gold)]/60`} />
      <Draw width={64} height={20} viewBox="0 0 64 20">
        <path pathLength={1} d="M32 3c-5 3.5-8 5.5-8 7s3 3.5 8 7c5-3.5 8-5.5 8-7s-3-3.5-8-7z" stroke="var(--wce-gold)" strokeWidth="1" />
        <path pathLength={1} d="M32 3v14M24 10h16" stroke="var(--wce-gold)" strokeWidth="0.6" opacity="0.7" />
        <circle pathLength={1} cx="14" cy="10" r="2" stroke="var(--wce-gold)" strokeWidth="0.8" />
        <circle pathLength={1} cx="50" cy="10" r="2" stroke="var(--wce-gold)" strokeWidth="0.8" />
      </Draw>
      <span className={`wce-divider-rule right ${drawn} h-px w-16 sm:w-28 bg-gradient-to-l from-transparent to-[var(--wce-gold)]/60`} />
    </div>
  );
}

export function CornerVine({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <Draw
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      width={88} height={88} viewBox="0 0 88 88"
    >
      <path pathLength={1} d="M4 84C4 46 22 14 84 4" stroke="var(--wce-gold)" strokeWidth="0.8" opacity="0.55" />
      <path pathLength={1} d="M20 62c-7-2-11-8-10-15 7 1 12 6 10 15z" stroke="var(--wce-gold)" strokeWidth="0.8" opacity="0.6" />
      <path pathLength={1} d="M38 40c-6-4-7-11-3-17 6 4 8 11 3 17z" stroke="var(--wce-gold)" strokeWidth="0.8" opacity="0.6" />
      <path pathLength={1} d="M60 22c-4-6-2-13 4-16 3 6 2 13-4 16z" stroke="var(--wce-gold)" strokeWidth="0.8" opacity="0.6" />
    </Draw>
  );
}

export function LotusMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <Draw className={className} width={size} height={size} viewBox="0 0 48 48">
      <path pathLength={1} d="M24 8c4 6 6 11 6 15s-2 8-6 12c-4-4-6-8-6-12s2-9 6-15z" stroke="var(--wce-gold)" strokeWidth="1.1" />
      <path pathLength={1} d="M24 35c-5-2-9-6-11-11-1-3-1-6 0-9 5 2 9 7 11 12" stroke="var(--wce-gold)" strokeWidth="1.1" />
      <path pathLength={1} d="M24 35c5-2 9-6 11-11 1-3 1-6 0-9-5 2-9 7-11 12" stroke="var(--wce-gold)" strokeWidth="1.1" />
      <path pathLength={1} d="M8 30c4 8 9 12 16 13 7-1 12-5 16-13" stroke="var(--wce-gold)" strokeWidth="0.9" opacity="0.7" />
    </Draw>
  );
}

export function CompassMandala({ size = 190, className = "" }: { size?: number; className?: string }) {
  const rays = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <circle cx="100" cy="100" r="94" stroke="var(--wce-gold)" strokeWidth="0.8" opacity="0.5" />
      <circle cx="100" cy="100" r="78" stroke="var(--wce-gold)" strokeWidth="0.6" opacity="0.35" />
      <circle cx="100" cy="100" r="52" stroke="var(--wce-gold)" strokeWidth="0.8" opacity="0.6" />
      {rays.map((deg) => (
        <line
          key={deg}
          x1="100" y1="8" x2="100" y2={deg % 90 === 0 ? 24 : 18}
          stroke="var(--wce-gold)" strokeWidth={deg % 90 === 0 ? 1.2 : 0.6}
          opacity={deg % 90 === 0 ? 0.9 : 0.45}
          transform={`rotate(${deg} 100 100)`}
        />
      ))}
      <path d="M100 30 118 100 100 170 82 100z" stroke="var(--wce-gold)" strokeWidth="0.8" opacity="0.6" />
      <path d="M30 100 100 82 170 100 100 118z" stroke="var(--wce-gold)" strokeWidth="0.8" opacity="0.6" />
      <g transform="translate(76 76)">
        <LotusPath />
      </g>
    </svg>
  );
}

function LotusPath() {
  return (
    <g>
      <path d="M24 4c4 6 6 11 6 15s-2 8-6 12c-4-4-6-8-6-12s2-9 6-15z" stroke="var(--wce-gold-light)" strokeWidth="1.1" fill="none" />
      <path d="M24 31c-5-2-9-6-11-11-1-3-1-6 0-9 5 2 9 7 11 12" stroke="var(--wce-gold-light)" strokeWidth="1.1" fill="none" />
      <path d="M24 31c5-2 9-6 11-11 1-3 1-6 0-9-5 2-9 7-11 12" stroke="var(--wce-gold-light)" strokeWidth="1.1" fill="none" />
    </g>
  );
}

/* --- Activity emblems --- */

export function EmblemSymposium({ delay = 0 }: { delay?: number }) {
  return (
    <EmblemFrame delay={delay}>
      <path pathLength={1} d="M32 18a5 5 0 0 1 5 5v9a5 5 0 0 1-10 0v-9a5 5 0 0 1 5-5z" stroke="var(--wce-gold)" strokeWidth="1.3" />
      <path pathLength={1} d="M22 30a10 10 0 0 0 20 0M32 42v6M26 48h12" stroke="var(--wce-gold)" strokeWidth="1.3" strokeLinecap="round" />
    </EmblemFrame>
  );
}

export function EmblemRetreat({ delay = 0 }: { delay?: number }) {
  return (
    <EmblemFrame delay={delay}>
      <path pathLength={1} d="M14 44l10-14 7 9 6-9 13 14z" stroke="var(--wce-gold)" strokeWidth="1.3" strokeLinejoin="round" />
      <circle pathLength={1} cx="42" cy="20" r="5" stroke="var(--wce-gold)" strokeWidth="1.3" />
      <path pathLength={1} d="M18 24c4 0 7 3 7 7-4 0-7-3-7-7z" stroke="var(--wce-gold)" strokeWidth="1.1" />
    </EmblemFrame>
  );
}

export function EmblemLifecraft({ delay = 0 }: { delay?: number }) {
  return (
    <EmblemFrame delay={delay}>
      <path pathLength={1} d="M16 40c5 6 11 8 16 8s11-2 16-8" stroke="var(--wce-gold)" strokeWidth="1.3" strokeLinecap="round" />
      <path pathLength={1} d="M32 38c-6-2-10-7-11-13 6 1 11 6 11 13z" stroke="var(--wce-gold)" strokeWidth="1.2" />
      <path pathLength={1} d="M32 38c6-2 10-7 11-13-6 1-11 6-11 13z" stroke="var(--wce-gold)" strokeWidth="1.2" />
      <path pathLength={1} d="M32 38V20" stroke="var(--wce-gold)" strokeWidth="1" opacity="0.7" />
    </EmblemFrame>
  );
}

export function EmblemCeremony({ delay = 0 }: { delay?: number }) {
  return (
    <EmblemFrame delay={delay}>
      <circle pathLength={1} cx="32" cy="32" r="7" stroke="var(--wce-gold)" strokeWidth="1.3" />
      <path pathLength={1} d="M32 16v6M32 42v6M16 32h6M42 32h6M21 21l4 4M43 43l-4-4M43 21l-4 4M21 43l4-4" stroke="var(--wce-gold)" strokeWidth="1.2" strokeLinecap="round" />
    </EmblemFrame>
  );
}

function EmblemFrame({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <Draw delay={delay} width={88} height={88} viewBox="0 0 64 64">
      <circle pathLength={1} cx="32" cy="32" r="30" stroke="var(--wce-gold)" strokeWidth="1" opacity="0.55" />
      <circle pathLength={1} cx="32" cy="32" r="26" stroke="var(--wce-gold)" strokeWidth="0.5" opacity="0.35" />
      {children}
    </Draw>
  );
}
