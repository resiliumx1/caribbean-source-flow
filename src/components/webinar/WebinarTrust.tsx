import { useRef, useEffect } from "react";

const CARDS = [
  { icon: "🌿", title: "Rooted in Tradition", desc: "20+ years of herbal medicine practice" },
  { icon: "🎓", title: "Expert-Led", desc: "Every session hosted by certified practitioners" },
  { icon: "💛", title: "Always Free", desc: "No subscription. No paywall. Ever." },
  { icon: "🌍", title: "Watch Anywhere", desc: "Live or replay, on any device" },
];

export default function WebinarTrust() {
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
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-24 text-center">
        <h2
          className="font-cormorant font-bold italic mb-4"
          style={{ color: "var(--site-text-primary)", fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)" }}
        >
          Ancient Wisdom. Zero Cost. Real Results.
        </h2>
        <p className="font-jost font-light max-w-lg mx-auto mb-14" style={{ color: "var(--site-text-secondary)" }}>
          Honorable Priest Kailash believes healing knowledge belongs to everyone.
          These sessions are our gift to you.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CARDS.map((c, i) => (
            <div
              key={c.title}
              className="rounded-xl p-6 transition-all duration-300 hover:scale-[1.02]"
              style={{
                backgroundColor: "var(--site-bg-deep)",
                borderTop: "2px solid var(--site-gold)",
                animationDelay: `${i * 80}ms`,
              }}
            >
              <span className="text-3xl mb-3 block">{c.icon}</span>
              <h3 className="font-cormorant font-semibold text-lg mb-2" style={{ color: "var(--site-text-primary)" }}>{c.title}</h3>
              <p className="font-jost font-light text-sm" style={{ color: "var(--site-text-secondary)" }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
