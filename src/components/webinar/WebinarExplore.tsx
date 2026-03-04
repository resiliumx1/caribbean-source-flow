import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Compass, Mountain } from "lucide-react";

const CARDS = [
  { icon: BookOpen, title: "Browse Replays", desc: "Thousands of minutes of healing wisdom", href: "#archive" },
  { icon: Compass, title: "Explore by Topic", desc: "Find sessions on your specific concern", href: "#archive" },
  { icon: Mountain, title: "Visit MKRC", desc: "Learn about our full wellness ecosystem", href: "/" },
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
    <section ref={ref} className="webinar-reveal webinar-noise relative" style={{ backgroundColor: "#0f0f0d" }}>
      <hr className="webinar-divider" />
      <div className="relative z-10 max-w-[900px] mx-auto px-6 py-24 text-center">
        <h2
          className="font-cormorant font-bold italic mb-3"
          style={{ color: "#f2ead8", fontSize: "clamp(1.6rem, 3vw, 2.5rem)" }}
        >
          The Library Is Always Open.
        </h2>
        <p className="font-jost font-light mb-12" style={{ color: "#8a8070" }}>
          No live session right now — but thousands of minutes of healing wisdom are waiting for you.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {CARDS.map((c, i) => {
            const Icon = c.icon;
            const inner = (
              <div
                className="rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full"
                style={{
                  backgroundColor: "#18181b",
                  border: "1px solid rgba(201,168,76,0.15)",
                }}
              >
                <Icon size={28} style={{ color: "#c9a84c" }} className="mx-auto mb-4" />
                <h3 className="font-cormorant font-semibold text-lg mb-2" style={{ color: "#f2ead8" }}>{c.title}</h3>
                <p className="font-jost font-light text-sm" style={{ color: "#8a8070" }}>{c.desc}</p>
              </div>
            );

            return c.href.startsWith("#") ? (
              <a key={i} href={c.href} style={{ textDecoration: "none" }}>{inner}</a>
            ) : (
              <Link key={i} to={c.href} style={{ textDecoration: "none" }}>{inner}</Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
