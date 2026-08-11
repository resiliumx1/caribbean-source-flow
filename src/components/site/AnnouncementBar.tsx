/**
 * Slim site-wide announcement strip for Caribbean Wellness Saint Lucia 2026.
 *
 * Rendered as the first row inside the fixed site header so the header stays
 * sticky and every existing sticky/scroll offset keeps working; the bar's
 * height is published as `--announcement-h` and applied as body padding, so no
 * page content ends up underneath it.
 *
 * Styling lives in src/index.css under the narrowly-named `.abar*` classes so
 * nothing leaks site-wide. The gold treatment is a highlight sweeping across
 * the metal, not a pulsing glow.
 * Dismissal is remembered for 7 days in localStorage.
 * Visibility is controlled from the admin via wce_settings.announcement_enabled.
 */
import { useEffect, useState } from "react";
import { useWceSettings } from "@/components/wce/useWceData";
import { PeakGlyph } from "./PeakGlyph";

const STORAGE_KEY = "mkrc-wce-announcement-dismissed";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const BAR_H = 42;
const EVENT_START = new Date("2026-10-11T00:00:00-04:00").getTime();

function dismissedRecently() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < SEVEN_DAYS;
  } catch {
    return false;
  }
}

/** Whole days left until the opening day — recomputed, never static copy. */
function daysToGo(now = Date.now()) {
  return Math.max(0, Math.ceil((EVENT_START - now) / 86400000));
}

export function AnnouncementBar() {
  const { data: settings } = useWceSettings();
  const [dismissed, setDismissed] = useState(() => dismissedRecently());
  const [days, setDays] = useState(() => daysToGo());

  // Keeps ticking across long-lived sessions and across midnight.
  useEffect(() => {
    const id = window.setInterval(() => setDays(daysToGo()), 60000);
    return () => window.clearInterval(id);
  }, []);

  // Only once the setting has loaded, so the bar never flashes when switched off.
  const enabled = !!settings && (settings as { announcement_enabled?: boolean }).announcement_enabled !== false;
  const visible = enabled && !dismissed;

  // Publish the height so sticky offsets / scroll-spy maths can account for it,
  // and shift page content down by exactly that much.
  useEffect(() => {
    const root = document.documentElement;
    if (!visible) {
      root.style.setProperty("--announcement-h", "0px");
      document.body.style.paddingTop = "";
      return;
    }
    const apply = () => {
      root.style.setProperty("--announcement-h", `${BAR_H}px`);
      document.body.style.paddingTop = `${BAR_H}px`;
    };
    apply();
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      root.style.setProperty("--announcement-h", "0px");
      document.body.style.paddingTop = "";
    };
  }, [visible]);

  if (!visible) return null;

  const close = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* private mode — the bar simply returns next visit */
    }
    setDismissed(true);
  };

  return (
    <div className="abar">
      {/* The whole bar is clickable through to the event page. */}
      <a className="abar__link" href="/wce-2026" aria-label="Caribbean Wellness Saint Lucia 2026 — explore the experience" />
      <PeakGlyph className="abar__peak" />
      <span className="abar__label">CARIBBEAN WELLNESS SAINT LUCIA 2026</span>
      <span className="abar__sep" aria-hidden="true" />
      {days > 0 && (
        <span className="abar__count">
          {days} {days === 1 ? "DAY" : "DAYS"} TO GO
        </span>
      )}
      {days > 0 && <span className="abar__sep abar__sep--count" aria-hidden="true" />}
      <span className="abar__cta">
        Explore the Experience <span className="abar__arrow" aria-hidden="true">→</span>
      </span>
      <button type="button" className="abar__close" onClick={close} aria-label="Dismiss announcement">
        ✕
      </button>
    </div>
  );
}