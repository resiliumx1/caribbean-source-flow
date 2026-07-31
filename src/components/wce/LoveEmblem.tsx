/** The official event brand mark: a mountain-peak arch inside a flower-of-life
 *  circle, with "LOVE THE LIFE YOU LIVE" beneath it, flanked by wave flourishes.
 *  Draws itself in on scroll entry — circle, then arch, then wordmark. */
import { CSSProperties } from "react";
import { useInView, useWceReducedMotion } from "./motion";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Petal ring of the flower of life. */
function petals(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
}

export function LoveEmblem({
  size = 240,
  tone = "var(--wce-gold)",
  wordTone = "var(--wce-gold-light)",
  subTone = "var(--wce-cream)",
  className = "",
  style,
}: {
  size?: number;
  tone?: string;
  wordTone?: string;
  subTone?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const reduced = useWceReducedMotion();
  const { ref, inView } = useInView<SVGSVGElement>();
  const on = reduced || inView;

  const draw = (delay: number): CSSProperties =>
    reduced
      ? {}
      : {
          strokeDasharray: 1,
          strokeDashoffset: on ? 0 : 1,
          transition: `stroke-dashoffset 900ms ${EASE} ${delay}ms`,
        };

  const fade = (delay: number): CSSProperties =>
    reduced
      ? {}
      : {
          opacity: on ? 1 : 0,
          transform: on ? "translateY(0)" : "translateY(8px)",
          transition: `opacity 700ms ${EASE} ${delay}ms, transform 700ms ${EASE} ${delay}ms`,
        };

  return (
    <svg
      ref={ref as never}
      className={className}
      style={style}
      width={size}
      height={size * 0.78}
      viewBox="0 0 240 188"
      fill="none"
      role="img"
      aria-label="Love the life you live — Caribbean Wellness Saint Lucia"
    >
      {/* Flower of life circle */}
      <g stroke={tone} strokeWidth="1" opacity="0.95">
        <circle pathLength={1} cx="120" cy="62" r="54" style={draw(0)} />
        <circle pathLength={1} cx="120" cy="62" r="48" strokeWidth="0.5" opacity="0.6" style={draw(80)} />
        {petals(120, 62, 24).map((p, i) => (
          <circle
            key={i}
            pathLength={1}
            cx={p.x}
            cy={p.y}
            r="24"
            strokeWidth="0.45"
            opacity="0.4"
            style={draw(120 + i * 50)}
          />
        ))}
      </g>

      {/* Mountain-peak arch */}
      <g stroke={tone} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
        <path pathLength={1} d="M84 86l22-32 14 19 12-17 24 30z" style={draw(700)} />
        <path pathLength={1} d="M96 86c8-7 16-7 24 0" strokeWidth="0.9" opacity="0.7" style={draw(860)} />
        <circle pathLength={1} cx="146" cy="42" r="7" strokeWidth="1" opacity="0.85" style={draw(940)} />
      </g>

      {/* Wave flourishes */}
      <g stroke={tone} strokeWidth="1" strokeLinecap="round" opacity="0.85">
        <path pathLength={1} d="M14 140c8-7 16-7 24 0s16 7 24 0" style={draw(1000)} />
        <path pathLength={1} d="M178 140c8-7 16-7 24 0s16 7 24 0" style={draw(1000)} />
      </g>

      {/* Wordmark */}
      <g style={fade(1100)}>
        <text
          x="120"
          y="141"
          textAnchor="middle"
          fill={wordTone}
          style={{ fontFamily: "var(--wce-display)", fontSize: 26, letterSpacing: "0.14em" }}
        >
          LOVE THE LIFE
        </text>
        <text
          x="120"
          y="170"
          textAnchor="middle"
          fill={subTone}
          style={{ fontFamily: "var(--wce-body)", fontSize: 15, letterSpacing: "0.36em" }}
        >
          YOU LIVE
        </text>
      </g>
    </svg>
  );
}
