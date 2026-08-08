/** Route-scoped light/dark theme for the Caribbean Wellness Experience page.
 *
 *  The whole WCE palette is a parallel token set in wce.css keyed off
 *  `data-wce-theme` on `.wce-root`. Because that attribute is rendered in JSX
 *  rather than assigned in an effect, the correct theme is present on the very
 *  first paint of the route — there is no flash of the wrong theme.
 *
 *  First visit follows `prefers-color-scheme`; an explicit choice is stored in
 *  localStorage under `wce-theme` and wins from then on. */
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from "react";

export type WceTheme = "light" | "dark";
const STORAGE_KEY = "wce-theme";

type Ctx = { theme: WceTheme; setTheme: (t: WceTheme) => void; toggle: () => void; explicit: boolean };
const WceThemeCtx = createContext<Ctx>({ theme: "light", setTheme: () => {}, toggle: () => {}, explicit: false });

export function useWceTheme() {
  return useContext(WceThemeCtx);
}

function readStored(): WceTheme | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
}

function systemTheme(): WceTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useWceThemeState() {
  // Resolved during render, so the attribute is correct on first paint.
  const [stored, setStored] = useState<WceTheme | null>(() => readStored());
  const [system, setSystem] = useState<WceTheme>(() => systemTheme());
  const theme = stored ?? system;

  // Follow the OS while the visitor has not made an explicit choice.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystem(mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((t: WceTheme) => {
    setStored(t);
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* private mode — the choice simply lasts for this visit */
    }
  }, []);

  const toggle = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [setTheme, theme]);

  // The site header and the fixed rails live outside .wce-root, so they read the
  // theme from the body instead.
  useLayoutEffect(() => {
    document.body.classList.toggle("wce-dark", theme === "dark");
    return () => document.body.classList.remove("wce-dark");
  }, [theme]);

  return { theme, setTheme, toggle, explicit: stored !== null };
}

export function WceThemeContextProvider({ value, children }: { value: Ctx; children: React.ReactNode }) {
  return <WceThemeCtx.Provider value={value}>{children}</WceThemeCtx.Provider>;
}

/** Sun / moon switch. Gold outline pill, 44px touch target. */
export function WceThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useWceTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      className={`wce-theme-toggle ${className}`}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <path d="M20.5 14.8A8.6 8.6 0 1 1 9.2 3.5a6.9 6.9 0 0 0 11.3 11.3Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <span className="wce-theme-toggle-label">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
