import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

function Particles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${8 + Math.random() * 6}s`,
    size: `${2 + Math.random() * 2}px`,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="webinar-particle"
          style={{
            left: p.left,
            bottom: "-10px",
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  );
}

export default function WebinarHero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.classList.add("visible");
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="webinar-hero-gradient webinar-noise relative flex items-center justify-center text-center min-h-screen overflow-hidden"
    >
      <div className="absolute inset-0 bg-black/50 z-[1]" />
      <Particles />

      <div className="hero-content relative z-10 px-6 py-24 max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-block mb-8 px-5 py-2 rounded-full border backdrop-blur-sm" style={{ borderColor: "rgba(188,138,95,0.4)" }}>
          <span className="font-cormorant text-sm tracking-wide" style={{ color: "#D4A373" }}>
            ✦ Free Wellness Education by MKRC
          </span>
        </div>

        {/* Headline */}
        <h1 className="mb-6">
          <span
            className="block font-cormorant font-light"
            style={{ color: "#f2ead8", fontSize: "clamp(2rem, 4.5vw, 3.6rem)", lineHeight: 1.15 }}
          >
            Your Healing Journey Starts With
          </span>
          <span
            className="block font-cormorant font-bold italic webinar-shimmer"
            style={{ fontSize: "clamp(2.8rem, 5.5vw, 4.5rem)", lineHeight: 1.1 }}
          >
            Knowledge.
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="font-jost font-light max-w-xl mx-auto mb-6 leading-relaxed"
          style={{ color: "rgba(242,234,216,0.85)", fontSize: "1.1rem" }}
        >
          Rt Hon Priest Kailash K Leonce and the MKRC team share 21 years of herbal wisdom
          — through free, expert-led webinars you can watch anytime.
        </p>

        {/* Social proof */}
        <p className="font-jost text-sm mb-10" style={{ color: "#D4A373" }}>
          Join 1,000+ monthly attendees from 40+ countries
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <a
            href="#featured"
            className="font-jost font-medium px-8 py-3.5 rounded-full text-sm transition-all duration-300 hover:brightness-110 hover:scale-[1.02] min-h-[48px] flex items-center"
            style={{ backgroundColor: "#BC8A5F", color: "#0F281E" }}
          >
            Browse Sessions
          </a>
          <a
            href="#archive"
            className="font-jost font-medium px-8 py-3.5 rounded-full text-sm border transition-all duration-300 hover:brightness-110 hover:scale-[1.02] min-h-[48px] flex items-center"
            style={{ borderColor: "rgba(242,234,216,0.5)", color: "#f2ead8" }}
          >
            Watch Past Replays
          </a>
        </div>

        {/* Scroll cue */}
        <div className="flex flex-col items-center gap-2 webinar-bounce">
          <span className="font-jost text-xs tracking-widest uppercase" style={{ color: "#D4A373" }}>
            Explore Topics
          </span>
          <ChevronDown size={20} style={{ color: "#D4A373" }} />
        </div>
      </div>
    </section>
  );
}
