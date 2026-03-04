import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

function Particles() {
  const particles = Array.from({ length: 25 }, (_, i) => ({
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
      className="relative flex items-center justify-center text-center min-h-screen overflow-hidden webinar-hero-gradient webinar-noise"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-[1]" />
      <Particles />

      <div className="relative z-10 px-6 py-24 max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-block mb-8 px-5 py-2 rounded-full border border-[#c9a84c]/40 backdrop-blur-sm">
          <span className="font-cormorant text-sm tracking-wide" style={{ color: "#c9a84c" }}>
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
          className="font-jost font-light max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ color: "#f2ead8cc", fontSize: "1.1rem" }}
        >
          Honorable Priest Kailash and the MKRC team share 20 years of herbal wisdom
          — through free, expert-led webinars you can watch anytime.
        </p>

        {/* Trust trio */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 mb-10">
          {[
            { icon: "🌿", text: "20 Years of Expertise" },
            { icon: "💛", text: "Always 100% Free" },
            { icon: "🌍", text: "1,000+ Global Attendees" },
          ].map((item, i) => (
            <span key={i} className="font-jost text-sm flex items-center gap-2" style={{ color: "#f2ead8" }}>
              {i > 0 && <span className="hidden sm:inline" style={{ color: "#c9a84c" }}>·</span>}
              <span>{item.icon}</span> {item.text}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <a
            href="#featured"
            className="font-jost font-medium px-8 py-3.5 rounded-full text-sm transition-all duration-300 hover:brightness-110 hover:scale-[1.02]"
            style={{ backgroundColor: "#c9a84c", color: "#090909" }}
          >
            Browse Upcoming Webinars
          </a>
          <a
            href="#archive"
            className="font-jost font-medium px-8 py-3.5 rounded-full text-sm border transition-all duration-300 hover:brightness-110 hover:scale-[1.02]"
            style={{ borderColor: "#f2ead8", color: "#f2ead8" }}
          >
            Watch Past Sessions
          </a>
        </div>

        {/* Scroll cue */}
        <div className="flex flex-col items-center gap-2 webinar-bounce">
          <span className="font-jost text-xs tracking-widest uppercase" style={{ color: "#c9a84c" }}>
            Explore Topics
          </span>
          <ChevronDown size={20} style={{ color: "#c9a84c" }} />
        </div>
      </div>
    </section>
  );
}
