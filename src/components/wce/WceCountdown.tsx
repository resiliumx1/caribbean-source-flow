import { useEffect, useState } from "react";

// The Wellness Symposium begins at 10:00am in Saint Lucia (UTC-4).
const TARGET = new Date("2026-10-11T10:00:00-04:00").getTime();

function parts(ms: number) {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return [
    { value: days, label: "Days" },
    { value: hours, label: "Hours" },
    { value: minutes, label: "Minutes" },
    { value: seconds, label: "Seconds" },
  ];
}

/** Understated anticipation counter to the opening day. Hidden once the date has passed. */
export function WceCountdown({ className = "" }: { className?: string }) {
  const [remaining, setRemaining] = useState(() => TARGET - Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setRemaining(TARGET - Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (remaining <= 0) return null;

  return (
    <div className={`wce-countdown ${className}`}>
      <p className="wce-count-kicker">Symposium begins in</p>
      <div
        className="wce-count-row"
        role="timer"
        aria-label="Time remaining until the Wellness Symposium begins"
        aria-live="off"
      >
        {parts(remaining).map((p, i) => (
          <div key={p.label} className="wce-count-block">
            {i > 0 && <span aria-hidden="true" className="wce-count-rule" />}
            <span className="wce-count-value">{String(p.value).padStart(2, "0")}</span>
            <span className="wce-count-label">{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
/** Compact trust strip: secure checkout reassurance + days remaining. */
export function WceHeroTrust({ className = "" }: { className?: string }) {
  const [remaining, setRemaining] = useState(() => TARGET - Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setRemaining(TARGET - Date.now()), 60000);
    return () => window.clearInterval(id);
  }, []);

  const days = Math.max(0, Math.ceil(remaining / 86400000));

  return (
    <div className={`wce-hero-trust ${className}`}>
      <span className="wce-hero-trust__item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="10.5" width="16" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 10.5V8a4 4 0 1 1 8 0v2.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        Secure Checkout
      </span>
      {remaining > 0 && (
        <>
          <span aria-hidden="true" className="wce-hero-trust__rule" />
          <span className="wce-hero-trust__item">
            <strong className="wce-hero-trust__count">{days}</strong> Days To Go
          </span>
        </>
      )}
    </div>
  );
}
