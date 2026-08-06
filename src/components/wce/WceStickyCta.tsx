import { useEffect, useState } from "react";
import { selectPathway } from "./pathway-select";
import { trackWceCta } from "./cta-tracking";

/** Mobile-only bottom action bar. Appears past the hero, hides while the form is in view. */
export function WceStickyCta() {
  const [pastHero, setPastHero] = useState(false);
  const [formInView, setFormInView] = useState(false);
  // Sit above the cookie consent banner while it is showing.
  const [consentOffset, setConsentOffset] = useState(0);

  useEffect(() => {
    const measure = () => {
      const el = document.querySelector('[aria-label="Cookie consent"]') as HTMLElement | null;
      setConsentOffset(el ? Math.round(el.getBoundingClientRect().height) : 0);
    };
    measure();
    const mo = new MutationObserver(measure);
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", measure);
    return () => {
      mo.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = document.getElementById("apply");
    if (!el || typeof IntersectionObserver === "undefined") return;
    // Tall section: watch the middle band of the viewport so the bar hides only
    // once the form actually occupies the screen.
    const io = new IntersectionObserver(
      (entries) => setFormInView(entries.some((e) => e.isIntersecting)),
      { threshold: 0, rootMargin: "-35% 0px -20% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const visible = pastHero && !formInView;

  return (
    <div
      className={`wce-sticky-cta ${visible ? "is-visible" : ""}`}
      style={{ bottom: consentOffset }}
      aria-hidden={!visible}
    >
      <a
        href="#pathways"
        className="wce-btn wce-btn-gold"
        tabIndex={visible ? 0 : -1}
        onClick={(e) => {
          e.preventDefault();
          trackWceCta("reserve", "sticky_bar", "Reserve Spot");
          document.getElementById("pathways")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        Reserve Spot
      </a>
      <a
        href="#apply"
        className="wce-btn wce-btn-outline"
        tabIndex={visible ? 0 : -1}
        onClick={(e) => {
          e.preventDefault();
          trackWceCta("apply", "sticky_bar", "Apply for Retreat");
          selectPathway("retreat");
        }}
      >
        Apply for Retreat
      </a>
    </div>
  );
}