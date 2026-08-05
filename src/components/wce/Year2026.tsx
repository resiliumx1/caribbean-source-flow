/**
 * WCE 2026 — the "2026" numeral lockup from the official event banner.
 *
 * Each digit is a centreline skeleton path. A single luminance mask stacks
 * alternating white/black strokes at decreasing widths (40/34, 25/19, 10/4),
 * which carves three concentric 3px rings out of a solid gold rect — the
 * nested-outline look, with hollow centres so the video shows through.
 *
 * Draw-on: every path carries pathLength="1", so animating stroke-dashoffset
 * from 1 to 0 on the mask's white AND black layers together reveals the rings
 * progressively rather than filling them in.
 */
import { useEffect, useId, useRef, useState } from "react";

const CELL = 130;

const D2 = "M26 58 A36 34 0 1 1 100 60 C100 88 74 100 26 150 L104 150";
const D0 = "M26 60 A38 38 0 0 1 102 60 L102 112 A38 38 0 0 1 26 112 Z";
const D6 = "M96 30 C60 26 26 46 26 96 L26 112 A38 38 0 1 0 102 112 A38 38 0 1 0 26 112";

const DIGITS = [D2, D0, D2, D6];

const RINGS: [number, number][] = [
  [40, 34],
  [25, 19],
  [10, 4],
];

function Layer({
  width,
  stroke,
  offset,
  duration,
  delay,
}: {
  width: number;
  stroke: string;
  offset: number;
  duration: number;
  delay: number;
}) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {DIGITS.map((d, i) => (
        <path
          key={i}
          d={d}
          pathLength={1}
          transform={`translate(${i * CELL},10)`}
          stroke={stroke}
          strokeWidth={width}
          strokeDasharray={1}
          strokeDashoffset={offset}
          style={{
            transition: `stroke-dashoffset ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
          }}
        />
      ))}
    </g>
  );
}

export function Year2026({
  className = "",
  tone = "var(--wce-gold)",
  animate = true,
  start = true,
  duration = 900,
}: {
  className?: string;
  tone?: string;
  animate?: boolean;
  start?: boolean;
  duration?: number;
}) {
  const maskId = `wce2026-${useId().replace(/:/g, "")}`;
  const [drawn, setDrawn] = useState(!animate);
  const raf = useRef<number>();

  useEffect(() => {
    if (!animate) {
      setDrawn(true);
      return;
    }
    if (!start) return;
    raf.current = requestAnimationFrame(() => setDrawn(true));
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [animate, start]);

  const offset = drawn ? 0 : 1;
  const W = CELL * 3 + 130;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} 190`}
      role="img"
      aria-label="2026"
      style={{ display: "block", width: "100%", height: "auto", overflow: "visible" }}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height="190">
          {RINGS.map(([outer, inner], i) => (
            <g key={i}>
              <Layer width={outer} stroke="#fff" offset={offset} duration={duration} delay={i * 90} />
              <Layer width={inner} stroke="#000" offset={offset} duration={duration} delay={i * 90} />
            </g>
          ))}
        </mask>
      </defs>
      <rect width={W} height="190" fill={tone} mask={`url(#${maskId})`} />
    </svg>
  );
}
