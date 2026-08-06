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
    document.body.classList.add("wce-route");
    const onScroll = () => {
      const overHero = window.scrollY < window.innerHeight * 0.8;
      document.body.classList.toggle("wce-transparent-header", overHero);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.body.classList.remove("wce-route");
      document.body.classList.remove("wce-transparent-header");
    };
  }, []);

  useEffect(() => {
    if (reduced) return;
    // Touch devices keep their native momentum; only pointer scrolling is smoothed.
    const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    if (touch) return;
    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      smoothWheel: true,
      syncTouch: false,
    });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    const onLock = (e: Event) => {
      const locked = (e as CustomEvent<boolean>).detail;
      if (locked) lenis.stop();
      else lenis.start();
    };
    window.addEventListener("wce:scroll-lock", onLock as EventListener);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wce:scroll-lock", onLock as EventListener);
      lenis.destroy();
    };
  }, [reduced]);

  /* Press feedback on every WCE button: a slight compression plus a gold ring ripple. */
  useEffect(() => {
    if (reduced) return;
    const onDown = (e: PointerEvent) => {
      const btn = (e.target as HTMLElement | null)?.closest?.(".wce-btn") as HTMLElement | null;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "wce-btn-ripple";
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      btn.appendChild(ripple);
      btn.classList.add("is-press");
      window.setTimeout(() => btn.classList.remove("is-press"), 170);
      window.setTimeout(() => ripple.remove(), 640);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [reduced]);

  return <div className="wce-root">{children}</div>;
}
