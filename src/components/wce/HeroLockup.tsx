/** Banner-accurate hero lockup: three-line title, nested-outline "2026",
 *  and the stacked date block with its forest-green bar. Montserrat throughout. */
import { useEffect, useState } from "react";
import { Year2026 } from "./Year2026";

export function WceTitleLockup({ reduced }: { reduced: boolean }) {
  const lines = ["Caribbean", "Wellness", "Saint Lucia"];
  // The year draws on as the second stage-in step, after the title lines slide up.
  const [yearStart, setYearStart] = useState(reduced);
  useEffect(() => {
    if (reduced) { setYearStart(true); return; }
    const t = window.setTimeout(() => setYearStart(true), 340);
    return () => window.clearTimeout(t);
  }, [reduced]);
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

      {/* Centre: nested-outline year */}
      <div className="wce-year-wrap">
        <Year2026 animate={!reduced} start={yearStart} />
      </div>

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