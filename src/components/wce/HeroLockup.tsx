/** Banner-accurate hero lockup: three-line title, concentric outlined "2026",
 *  and the stacked date block with its forest-green bar. Montserrat throughout. */
import { useEffect, useState } from "react";
import { useWceReducedMotion } from "./motion";

/** "2026" drawn as three nested gold outlines — no fill at any point. */
export function WceYearOutline({ className = "" }: { className?: string }) {
  const reduced = useWceReducedMotion();
  const [drawn, setDrawn] = useState(reduced);

  useEffect(() => {
    if (reduced) { setDrawn(true); return; }
    const t = window.setTimeout(() => setDrawn(true), 340);
    return () => window.clearTimeout(t);
  }, [reduced]);

  // Outer ring first, then the two inset rings.
  const rings = [
    { scale: 1, width: 2.6, delay: 0 },
    { scale: 0.945, width: 2.2, delay: 180 },
    { scale: 0.89, width: 1.9, delay: 360 },
  ];

  return (
    <svg
      viewBox="0 0 420 170"
      role="img"
      aria-label="2026"
      className={`wce-year-svg ${drawn ? "is-drawn" : ""} ${className}`}
    >
      <g>
        {rings.map((r, i) => (
          <text
            key={i}
            x="210"
            y="132"
            textAnchor="middle"
            fill="none"
            stroke="var(--wce-gold)"
            strokeWidth={r.width}
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{
              transform: `scale(${r.scale})`,
              transformBox: "fill-box",
              transformOrigin: "center",
              transitionDelay: `${r.delay}ms`,
            }}
          >
            2026
          </text>
        ))}
      </g>
    </svg>
  );
}

export function WceTitleLockup({ reduced }: { reduced: boolean }) {
  const lines = ["Caribbean", "Wellness", "Saint Lucia"];
  return (
    <div className="wce-banner-lockup">
      {/* Left: stacked title */}
      <h1 className="wce-banner-title">
        {lines.map((line, i) => (
          <span key={line} className="wce-mask-line">
            <span
              className="wce-mask-inner wce-banner-title-line"
              style={
                reduced
                  ? undefined
                  : { animation: `wce-rise-up 0.7s cubic-bezier(0.22,1,0.36,1) ${0.05 + i * 0.08}s both` }
              }
            >
              {line}
            </span>
          </span>
        ))}
      </h1>

      {/* Centre: outlined year */}
      <WceYearOutline />

      {/* Right: rule + dates + green bar */}
      <div className="wce-banner-dates">
        <span aria-hidden="true" className="wce-banner-daterule" />
        <div className="wce-banner-datestack">
          <span
            className="wce-banner-day"
            style={reduced ? undefined : { animation: "wce-rise 0.6s cubic-bezier(0.22,1,0.36,1) 0.95s both" }}
          >
            11-17
          </span>
          <span
            className="wce-banner-month"
            style={reduced ? undefined : { animation: "wce-rise 0.6s cubic-bezier(0.22,1,0.36,1) 1.02s both" }}
          >
            October
          </span>
          <span
            aria-hidden="true"
            className="wce-banner-bar"
            style={reduced ? undefined : { animation: "wce-wipe-x 0.55s cubic-bezier(0.22,1,0.36,1) 1.18s both" }}
          />
        </div>
      </div>
    </div>
  );
}