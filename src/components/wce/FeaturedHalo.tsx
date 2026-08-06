/**
 * FeaturedHalo — radiant surround for the featured speaker's portrait.
 *
 * Pure SVG, no raster assets beyond the portrait itself. Three independent
 * layers rotate at different rates so the halo reads as alive without any
 * single element being fast enough to notice:
 *
 *   rays          120s clockwise
 *   geometry      240s counter-clockwise
 *   dashed orbit   90s clockwise
 *
 * On scroll-in the rays draw outward (longest first) and the orbit traces
 * itself; on hover a highlight sweeps once around the metal ring.
 *
 * All motion is suppressed under prefers-reduced-motion — the halo renders
 * complete and static.
 */
import { useEffect, useId, useMemo, useRef, useState } from "react";

const CX = 450;
const CY = 450;
const PR = 165; // portrait radius

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** Pass false for reduced motion — renders fully drawn and still. */
  animate?: boolean;
};

function useInView<T extends Element>(enabled: boolean) {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(!enabled);
  useEffect(() => {
    if (!enabled || seen || !ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setSeen(true),
      { threshold: 0.35 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [enabled, seen]);
  return { ref, seen };
}

export function FeaturedHalo({ src, alt, className = "", animate = true }: Props) {
  const uid = useId().replace(/:/g, "");
  const { ref, seen } = useInView<SVGSVGElement>(animate);

  // 48 tapered rays, alternating long/short.
  const rays = useMemo(() => {
    const out: { d: string; long: boolean }[] = [];
    const r0 = 268;
    for (let i = 0; i < 48; i++) {
      const a = (Math.PI * 2 * i) / 48;
      const long = i % 2 === 0;
      const L = long ? 74 : 40;
      const w = 3.4;
      const x0 = CX + r0 * Math.cos(a);
      const y0 = CY + r0 * Math.sin(a);
      const x1 = CX + (r0 + L) * Math.cos(a);
      const y1 = CY + (r0 + L) * Math.sin(a);
      const px = (-Math.sin(a) * w) / 2;
      const py = (Math.cos(a) * w) / 2;
      out.push({
        d: `M${x0 + px} ${y0 + py} L${x1} ${y1} L${x0 - px} ${y0 - py} Z`,
        long,
      });
    }
    return out;
  }, []);

  // Flower-of-life field, 3 rings of hex-packed circles.
  const geometry = useMemo(() => {
    const r = 62;
    const pts: [number, number][] = [[0, 0]];
    for (let ring = 1; ring <= 3; ring++) {
      for (let i = 0; i < 6 * ring; i++) {
        const a = (Math.PI / 3) * (i / ring);
        pts.push([ring * r * Math.cos(a), ring * r * Math.sin(a)]);
      }
    }
    const seenKeys = new Set<string>();
    return pts.filter(([x, y]) => {
      const k = `${x.toFixed(1)},${y.toFixed(1)}`;
      if (seenKeys.has(k)) return false;
      seenKeys.add(k);
      return true;
    });
  }, []);

  const diamonds = [0, 1, 2, 3].map((i) => {
    const a = (Math.PI * 2 * i) / 4 - Math.PI / 2;
    return { x: CX + 255 * Math.cos(a), y: CY + 255 * Math.sin(a) };
  });

  const on = !animate || seen;

  return (
    <svg
      ref={ref}
      viewBox="0 0 900 900"
      className={`wce-halo ${animate ? "" : "wce-halo--static"} ${className}`}
      data-visible={on}
      role="img"
      aria-label={alt}
      style={{ display: "block", width: "100%", height: "auto", overflow: "visible" }}
    >
      <defs>
        <clipPath id={`clip-${uid}`}>
          <circle cx={CX} cy={CY} r={PR} />
        </clipPath>
        <radialGradient id={`aura-${uid}`}>
          <stop offset="0%" stopColor="var(--wce-gold-light)" stopOpacity="0.30" />
          <stop offset="55%" stopColor="var(--wce-gold)" stopOpacity="0.10" />
          <stop offset="100%" stopColor="var(--wce-gold)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`metal-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--wce-gold-light)" />
          <stop offset="35%" stopColor="var(--wce-gold)" />
          <stop offset="55%" stopColor="#F3E2A8" />
          <stop offset="100%" stopColor="var(--wce-gold-deep)" />
        </linearGradient>
        {/* Sweeping highlight for the hover ignition. */}
        <linearGradient id={`sweep-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFF3C4" stopOpacity="0" />
          <stop offset="50%" stopColor="#FFF3C4" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFF3C4" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx={CX} cy={CY} r={400} fill={`url(#aura-${uid})`} className="wce-halo__aura" />

      <g className="wce-halo__geo" fill="none" stroke="var(--wce-gold)" strokeWidth={1.1} opacity={0.2}>
        {geometry.map(([x, y], i) => (
          <circle key={i} cx={CX + x} cy={CY + y} r={62} />
        ))}
      </g>

      <g className="wce-halo__rays" fill="var(--wce-gold)">
        {rays.map((r, i) => (
          <path
            key={i}
            d={r.d}
            opacity={r.long ? 0.85 : 0.45}
            style={{ transitionDelay: `${(r.long ? 0 : 220) + i * 9}ms` }}
          />
        ))}
      </g>

      <circle
        className="wce-halo__orbit"
        cx={CX}
        cy={CY}
        r={255}
        fill="none"
        stroke="var(--wce-gold)"
        strokeWidth={1.4}
        strokeDasharray="2 9"
        opacity={0.75}
      />
      <g className="wce-halo__diamonds" fill="var(--wce-gold-light)" opacity={0.9}>
        {diamonds.map((d, i) => (
          <rect
            key={i}
            x={d.x - 4.5}
            y={d.y - 4.5}
            width={9}
            height={9}
            transform={`rotate(45 ${d.x} ${d.y})`}
          />
        ))}
      </g>

      <circle cx={CX} cy={CY} r={212} fill="none" stroke="var(--wce-gold)" strokeWidth={1} opacity={0.5} />
      <circle
        cx={CX}
        cy={CY}
        r={200}
        fill="none"
        stroke="var(--wce-gold)"
        strokeWidth={0.8}
        strokeDasharray="1 6"
        opacity={0.6}
      />

      {/* Metal ring + portrait */}
      <circle cx={CX} cy={CY} r={PR + 16} fill="none" stroke={`url(#metal-${uid})`} strokeWidth={13} />
      <circle
        className="wce-halo__sweep"
        cx={CX}
        cy={CY}
        r={PR + 16}
        fill="none"
        stroke={`url(#sweep-${uid})`}
        strokeWidth={13}
        pathLength={1}
        strokeDasharray="0.16 0.84"
      />
      <circle className="wce-halo__ripple wce-halo__ripple--1" cx={CX} cy={CY} r={PR + 30}
              fill="none" stroke="var(--wce-gold-light)" strokeWidth={2} opacity={0} />
      <circle className="wce-halo__ripple wce-halo__ripple--2" cx={CX} cy={CY} r={PR + 30}
              fill="none" stroke="var(--wce-gold)" strokeWidth={1.4} opacity={0} />
      <circle cx={CX} cy={CY} r={PR + 27} fill="none" stroke="var(--wce-gold)" strokeWidth={1.6} opacity={0.85} />
      <image
        href={src}
        x={CX - PR}
        y={CY - PR}
        width={PR * 2}
        height={PR * 2}
        clipPath={`url(#clip-${uid})`}
        preserveAspectRatio="xMidYMid slice"
        className="wce-halo__portrait"
      />
    </svg>
  );
}
