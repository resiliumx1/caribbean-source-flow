import { useEffect, useState } from "react";
import { selectPathway } from "./pathway-select";

/** Mobile-only bottom action bar. Appears past the hero, hides while the form is in view. */
export function WceStickyCta() {
  const [pastHero, setPastHero] = useState(false);
  const [formInView, setFormInView] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = document.getElementById("apply");
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => setFormInView(entries.some((e) => e.isIntersecting)),
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const visible = pastHero && !formInView;

  return (
    <div className={`wce-sticky-cta ${visible ? "is-visible" : ""}`} aria-hidden={!visible}>
      <a
        href="#pathways"
        className="wce-btn wce-btn-gold"
        tabIndex={visible ? 0 : -1}
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("pathways")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        Reserve Spot
      </a>
      <a
        href="#apply"
        className="wce-btn wce-btn-outline"
        tabIndex={visible ? 0 : -1}
        onClick={(e) => { e.preventDefault(); selectPathway("retreat"); }}
      >
        Apply for Retreat
      </a>
    </div>
  );
}