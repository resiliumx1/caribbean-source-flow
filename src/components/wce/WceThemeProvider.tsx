import { useEffect } from "react";
import Lenis from "lenis";
import "@/styles/wce.css";
import { useWceReducedMotion } from "./motion";

/** Scopes the Caribbean Wellness Experience palette + typography to this route only,
 *  and enables Lenis smooth scroll for the lifetime of this route only. */
export function WceThemeProvider({ children }: { children: React.ReactNode }) {
  const reduced = useWceReducedMotion();

  // Route-scoped: the site header floats transparently over the hero, then
  // returns to its solid state once the hero has scrolled past.
  useEffect(() => {
    const onScroll = () => {
      const overHero = window.scrollY < window.innerHeight * 0.8;
      document.body.classList.toggle("wce-transparent-header", overHero);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.body.classList.remove("wce-transparent-header");
    };
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
