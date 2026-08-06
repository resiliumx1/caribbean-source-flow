/** Graduation-specific line-drawn gold ornaments for the Special Ceremony section.
 *  Every stroke draws in on scroll entry via stroke-dasharray (see .wce-grad-draw). */
import { useInView } from "./motion";

const GOLD = "var(--wce-gold)";

/** Full laurel wreath — the centrepiece of the ceremony section. */
export function LaurelWreath({ size = 260 }: { size?: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const leaf = (i: number, side: 1 | -1) => {
    const t = i / 9;
    const a = Math.PI * (0.5 + side * (0.14 + t * 0.72));
    const r = 92;
    const x = 130 + r * Math.cos(a);
    const y = 140 + r * Math.sin(a) * -1;
    const rot = (Math.atan2(-(y - 140), x - 130) * 180) / Math.PI;
    return (
      <path
        key={`${side}-${i}`}
        d="M0 0c11 -2 20 -8 24 -17 -11 -1 -20 4 -24 17z"
        transform={`translate(${x} ${y}) rotate(${side === 1 ? rot : rot + 180}) scale(${side})`}
        stroke={GOLD}
        strokeWidth="1.2"
        fill="none"
        style={{ ["--len" as string]: "70", transitionDelay: `${i * 70}ms` }}
      />
    );
  };
  return (
    <span ref={ref} className="inline-block">
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 260 260"
        fill="none"
        className="wce-grad-draw"
        data-in={inView ? "true" : "false"}
      >
        {Array.from({ length: 9 }, (_, i) => leaf(i, 1))}
        {Array.from({ length: 9 }, (_, i) => leaf(i, -1))}
        <path d="M130 232c-9-6-14-13-14-13m14 13c9-6 14-13 14-13" stroke={GOLD} strokeWidth="1.2" style={{ ["--len" as string]: "60", transitionDelay: "640ms" }} />
        <circle cx="130" cy="46" r="5" stroke={GOLD} strokeWidth="1.2" style={{ ["--len" as string]: "34", transitionDelay: "720ms" }} />
      </svg>
    </span>
  );
}

/** Certificate scroll with a ribbon seal. */
export function ScrollMark({ size = 74, delay = 0 }: { size?: number; delay?: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  return (
    <span ref={ref} className="inline-block">
      <svg
        aria-hidden="true"
        width={size}
        height={size * 0.72}
        viewBox="0 0 100 72"
        fill="none"
        className="wce-grad-draw"
        data-in={inView ? "true" : "false"}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <path d="M18 14h64v44H18z" stroke={GOLD} strokeWidth="1.2" style={{ ["--len" as string]: "220" }} />
        <path d="M18 14c-6 0-9 3-9 7s3 7 9 7M82 58c6 0 9-3 9-7s-3-7-9-7" stroke={GOLD} strokeWidth="1.2" style={{ ["--len" as string]: "90", transitionDelay: `${delay + 120}ms` }} />
        <path d="M30 28h40M30 36h40M30 44h24" stroke={GOLD} strokeWidth="1" style={{ ["--len" as string]: "120", transitionDelay: `${delay + 220}ms` }} />
        <circle cx="74" cy="50" r="7" stroke={GOLD} strokeWidth="1.2" style={{ ["--len" as string]: "48", transitionDelay: `${delay + 320}ms` }} />
        <path d="M71 57l-3 9 6-3 6 3-3-9" stroke={GOLD} strokeWidth="1" style={{ ["--len" as string]: "46", transitionDelay: `${delay + 400}ms` }} />
      </svg>
    </span>
  );
}

/** Mortarboard cap over an open book — conferring of titles. */
export function TitleCapMark({ size = 64, delay = 0 }: { size?: number; delay?: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  return (
    <span ref={ref} className="inline-block">
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 72 72"
        fill="none"
        className="wce-grad-draw"
        data-in={inView ? "true" : "false"}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <path d="M6 26L36 14l30 12-30 12z" stroke={GOLD} strokeWidth="1.2" style={{ ["--len" as string]: "150" }} />
        <path d="M18 32v12c0 4 8 7 18 7s18-3 18-7V32" stroke={GOLD} strokeWidth="1.2" style={{ ["--len" as string]: "90", transitionDelay: `${delay + 140}ms` }} />
        <path d="M62 28v16" stroke={GOLD} strokeWidth="1" style={{ ["--len" as string]: "20", transitionDelay: `${delay + 260}ms` }} />
        <circle cx="62" cy="47" r="3" stroke={GOLD} strokeWidth="1" style={{ ["--len" as string]: "22", transitionDelay: `${delay + 320}ms` }} />
      </svg>
    </span>
  );
}

/** Mortar and pestle with a sprig — the herbal physician cohort. */
export function HerbalCohortMark({ size = 64, delay = 0 }: { size?: number; delay?: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  return (
    <span ref={ref} className="inline-block">
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 72 72"
        fill="none"
        className="wce-grad-draw"
        data-in={inView ? "true" : "false"}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <path d="M16 38h40c0 12-9 20-20 20s-20-8-20-20z" stroke={GOLD} strokeWidth="1.2" style={{ ["--len" as string]: "150" }} />
        <path d="M12 34h48" stroke={GOLD} strokeWidth="1.2" style={{ ["--len" as string]: "48", transitionDelay: `${delay + 140}ms` }} />
        <path d="M44 12c0 10-6 16-14 18 0-9 5-15 14-18z" stroke={GOLD} strokeWidth="1.1" style={{ ["--len" as string]: "78", transitionDelay: `${delay + 240}ms` }} />
        <path d="M30 30c4-6 9-11 14-14" stroke={GOLD} strokeWidth="1" style={{ ["--len" as string]: "30", transitionDelay: `${delay + 320}ms` }} />
      </svg>
    </span>
  );
}

/** Two hands passing a leaf — traditional knowledge passed on. */
export function KnowledgePassMark({ size = 64, delay = 0 }: { size?: number; delay?: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  return (
    <span ref={ref} className="inline-block">
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 72 72"
        fill="none"
        className="wce-grad-draw"
        data-in={inView ? "true" : "false"}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <path d="M8 46c6-8 14-10 20-8" stroke={GOLD} strokeWidth="1.2" style={{ ["--len" as string]: "40" }} />
        <path d="M64 46c-6-8-14-10-20-8" stroke={GOLD} strokeWidth="1.2" style={{ ["--len" as string]: "40", transitionDelay: `${delay + 120}ms` }} />
        <path d="M46 20c0 12-6 18-14 20 0-11 5-17 14-20z" stroke={GOLD} strokeWidth="1.1" style={{ ["--len" as string]: "80", transitionDelay: `${delay + 240}ms` }} />
        <path d="M32 40c4-7 9-13 14-17" stroke={GOLD} strokeWidth="1" style={{ ["--len" as string]: "32", transitionDelay: `${delay + 340}ms` }} />
        <path d="M22 54h28" stroke={GOLD} strokeWidth="1" style={{ ["--len" as string]: "30", transitionDelay: `${delay + 420}ms` }} />
      </svg>
    </span>
  );
}

/** A row of small laurel emblems standing in for the graduating cohort. */
export function CohortProcession({ count = 9 }: { count?: number }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="wce-grad-cohort" data-in={inView ? "true" : "false"} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} style={{ transitionDelay: `${i * 90}ms` }}>
          <svg width="30" height="42" viewBox="0 0 30 42" fill="none">
            <path d="M15 40V22" stroke={GOLD} strokeWidth="1" />
            <path d="M15 22c-7-1-11-6-11-13 7 1 11 6 11 13z" stroke={GOLD} strokeWidth="1" />
            <path d="M15 22c7-1 11-6 11-13-7 1-11 6-11 13z" stroke={GOLD} strokeWidth="1" />
            <circle cx="15" cy="5" r="3" stroke={GOLD} strokeWidth="1" />
          </svg>
        </span>
      ))}
    </div>
  );
}