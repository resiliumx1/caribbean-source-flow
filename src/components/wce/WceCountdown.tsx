import { useEffect, useState } from "react";

const TARGET = new Date("2026-10-11T00:00:00-04:00").getTime();

function parts(ms: number) {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return [
    { value: days, label: "Days" },
    { value: hours, label: "Hours" },
    { value: minutes, label: "Minutes" },
  ];
}

/** Understated anticipation counter to the opening day. Hidden once the date has passed. */
export function WceCountdown({ className = "" }: { className?: string }) {
  const [remaining, setRemaining] = useState(() => TARGET - Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setRemaining(TARGET - Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);

  if (remaining <= 0) return null;

  return (
    <div
      className={`flex items-start justify-center gap-3 ${className}`}
      aria-label="Time remaining until the event begins"
    >
      {parts(remaining).map((p) => (
        <div key={p.label} className="wce-count-block text-center">
          <span className="wce-count-value">{String(p.value).padStart(2, "0")}</span>
          <span className="wce-count-label">{p.label}</span>
        </div>
      ))}
    </div>
  );
}