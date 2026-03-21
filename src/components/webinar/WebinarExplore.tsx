import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Compass, Droplets } from "lucide-react";

const CARDS = [
  { icon: BookOpen, title: "Browse Replays", desc: "Thousands of minutes of healing wisdom, organized by topic", href: "#archive" },
  { icon: Compass, title: "Explore by Topic", desc: "Find sessions on your specific concern — fertility, detox, immunity", href: "#archive" },
  { icon: Droplets, title: "Start Your Journey", desc: "Ready to move from education to action? Try The Answer.", href: "/the-answer", isLink: true },
];

export default function WebinarExplore() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.classList.add("visible"); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="webinar-reveal webinar-noise relative" style={{ backgroundColor: "var(--site-bg-secondary)" }}>
      <hr className="webinar-divider" />
      <div className="relative z-10 max-w-[900px] mx-auto px-6 py-24 text-center">
        <h2
          className="font-cormorant font-bold italic mb-3"
          style={{ color: "var(--site-text-primary)", fontSize: "clamp(1.6rem, 3vw, 2.5rem)" }}
        >
          The Library Is Always Open.
        </h2>
        <p className="font-jost font-light mb-12" style={{ color: "var(--site-text-secondary)" }}>
          No live session right now — but thousands of minutes of healing wisdom are waiting for you.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {CARDS.map((c, i) => {
            const Icon = c.icon;
            const inner = (
              <div
                className="rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full"
                style={{
                  backgroundColor: "var(--site-bg-deep)",
                  border: "1px solid rgba(201,168,76,0.15)",
                  borderTop: "2px solid #c9a84c",
                }}
              >
                <Icon size={28} style={{ color: "var(--site-gold)" }} className="mx-auto mb-4" />
                <h3 className="font-cormorant font-semibold text-lg mb-2" style={{ color: "var(--site-text-primary)" }}>{c.title}</h3>
                <p className="font-jost font-light text-sm" style={{ color: "var(--site-text-secondary)" }}>{c.desc}</p>
              </div>
            );

            return c.isLink ? (
              <Link key={i} to={c.href} style={{ textDecoration: "none" }}>{inner}</Link>
            ) : (
              <a key={i} href={c.href} style={{ textDecoration: "none" }}>{inner}</a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
