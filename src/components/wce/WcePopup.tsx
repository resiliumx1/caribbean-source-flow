import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useWceSettings } from "./useWceData";

/**
 * WCE 2026 promo popup for the main-site homepage.
 * Styles are entirely self-scoped (inline) so no WCE CSS variables leak
 * into the rest of the site.
 */
const GOLD = "#C9A227";
const GOLD_LIGHT = "#E4C567";
const FOREST = "var(--wce-band)";
const CREAM = "#F5EFE0";
const SESSION_KEY = "wce-popup-dismissed";

export function WcePopup() {
  const { data: settings } = useWceSettings();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<Element | null>(null);

  const enabled = !!settings?.popup_enabled;

  const close = useCallback(() => {
    setOpen(false);
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
    const target = lastFocused.current as HTMLElement | null;
    if (target && typeof target.focus === "function") target.focus();
  }, []);

  // Trigger: 4 seconds or 25% scroll depth, whichever comes first.
  useEffect(() => {
    if (!enabled) return;
    try { if (sessionStorage.getItem(SESSION_KEY)) return; } catch { /* ignore */ }

    let done = false;
    const fire = () => {
      if (done) return;
      done = true;
      lastFocused.current = document.activeElement;
      setOpen(true);
      cleanup();
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= 0.25) fire();
    };
    const timer = window.setTimeout(fire, 4000);
    window.addEventListener("scroll", onScroll, { passive: true });
    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    }
    return cleanup;
  }, [enabled]);

  // Escape + focus trap
  useEffect(() => {
    if (!open) return;
    const node = dialogRef.current;
    const focusables = () =>
      Array.from(node?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') ?? []);
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!enabled || !open) return null;

  return (
    <div
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(var(--wce-scrim-rgb), 0.72)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wce-popup-title"
        style={{
          position: "relative", width: "100%", maxWidth: 420, overflow: "hidden",
          background: FOREST, border: `1px solid ${GOLD}`, borderRadius: 3,
          boxShadow: "0 24px 60px rgba(0,0,0,0.45)", textAlign: "center",
        }}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close announcement"
          style={{
            position: "absolute", top: 8, right: 8, zIndex: 2,
            minWidth: 44, minHeight: 44, background: "rgba(var(--wce-forest-rgb), 0.7)",
            border: `1px solid ${GOLD}`, borderRadius: "50%", color: GOLD_LIGHT,
            fontSize: 18, lineHeight: 1, cursor: "pointer",
          }}
        >
          ×
        </button>

        {settings?.popup_flyer_url && (
          <img
            src={settings.popup_flyer_url}
            alt="Caribbean Wellness Saint Lucia 2026"
            style={{ display: "block", width: "100%", objectFit: "cover", maxHeight: 380 }}
            loading="lazy"
            decoding="async"
          />
        )}

        <div style={{ padding: "28px 26px 32px" }}>
          <p style={{ color: GOLD, fontSize: "0.875rem", letterSpacing: "0.24em", textTransform: "uppercase", margin: 0 }}>
            {settings?.event_dates ?? "11–17 October 2026"}
          </p>
          <h2
            id="wce-popup-title"
            style={{
              margin: "14px 0 0", color: CREAM, fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.7rem", lineHeight: 1.25,
            }}
          >
            {settings?.hero_headline ?? "Caribbean Wellness Saint Lucia 2026"}
          </h2>
          <Link
            to="/wce-2026"
            onClick={close}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              marginTop: 24, minHeight: 48, padding: "0 30px",
              background: GOLD, color: FOREST, borderRadius: 2, textDecoration: "none",
              fontSize: "0.875rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600,
            }}
          >
            {settings?.popup_cta_text ?? "Learn More"}
          </Link>
        </div>
      </div>
    </div>
  );
}
