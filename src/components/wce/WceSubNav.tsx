import { useEffect, useState } from "react";

const LINKS = [
  { id: "pathways", label: "Pathways" },
  { id: "speakers", label: "Speakers" },
  { id: "activities", label: "Activities" },
  { id: "apply", label: "Apply" },
  { id: "faq", label: "FAQ" },
];

/** Desktop-only anchor rail that appears past the hero and tracks the section in view. */
export function WceSubNav() {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<string>("pathways");

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit?.target.id) setActive(hit.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );
    LINKS.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <nav className={`wce-subnav ${visible ? "is-visible" : ""}`} aria-label="Section navigation">
      {LINKS.map((l) => (
        <a
          key={l.id}
          href={`#${l.id}`}
          onClick={go(l.id)}
          tabIndex={visible ? 0 : -1}
          className={active === l.id ? "is-active" : ""}
          aria-current={active === l.id ? "true" : undefined}
        >
          {l.label}
        </a>
      ))}
    </nav>
  );
}