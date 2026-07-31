import { useEffect } from "react";
import Lenis from "lenis";
import "@/styles/wce.css";
import { useWceReducedMotion } from "./motion";

/** Scopes the Caribbean Wellness Experience palette + typography to this route only,
 *  and enables Lenis smooth scroll for the lifetime of this route only. */
export function WceThemeProvider({ children }: { children: React.ReactNode }) {
  const reduced = useWceReducedMotion();

  // Route-scoped: let the site header float transparently over the hero.
  useEffect(() => {
    document.body.classList.add("wce-transparent-header");
    return () => document.body.classList.remove("wce-transparent-header");
  }, []);

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reduced]);

  return <div className="wce-root">{children}</div>;
}
