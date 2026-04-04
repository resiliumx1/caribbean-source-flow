import { useRef, useEffect, useState } from "react";
import { Clock, Calendar, Users } from "lucide-react";
import webinarImg from "@/assets/mkrc-webinar-featured.webp";

export default function WebinarFeatured() {
  const ref = useRef<HTMLElement>(null);
  const [isLive] = useState(false); // Toggle this when a live event is scheduled

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.classList.add("visible"); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="featured"
      ref={ref}
      className="webinar-reveal webinar-noise relative"
      style={{ backgroundColor: "var(--site-bg-secondary)", borderTop: "1px solid rgba(201,168,76,0.15)" }}
    >
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 items-center">
        {/* Left: thumbnail */}
        <div className="relative rounded-2xl overflow-hidden group" style={{ boxShadow: "0 0 60px rgba(201,168,76,0.08)" }}>
          <img
            src={webinarImg}
            alt="Featured MKRC Webinar — Reproductive Wellness"
            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />


          {/* Duration badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: "rgba(201,168,76,0.9)" }}>
            <Clock size={12} style={{ color: "#090909" }} />
            <span className="font-jost font-medium text-xs" style={{ color: "#090909" }}>90 min</span>
          </div>

          {/* Status pill */}
          <div className="absolute top-4 left-4">
            {isLive ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md" style={{ backgroundColor: "rgba(220,38,38,0.8)" }}>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="font-jost font-medium text-xs text-white">Upcoming Live Session</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md" style={{ backgroundColor: "rgba(9,9,9,0.7)", border: "1px solid rgba(201,168,76,0.3)" }}>
                <span className="font-jost font-medium text-xs" style={{ color: "var(--site-gold)" }}>Featured Replay</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: info */}
        <div>
          <span
            className="font-jost text-xs tracking-[0.2em] uppercase mb-4 block"
            style={{ color: "var(--site-gold)" }}
          >
            {isLive ? "Upcoming Live Session" : "Featured Session"}
          </span>
          <h2
            className="font-cormorant font-bold mb-4"
            style={{ color: "var(--site-text-primary)", fontSize: "clamp(1.5rem, 3vw, 2.25rem)", lineHeight: 1.2 }}
          >
            Reproductive Wellness: Nature's Approach to Fertility, Hormonal Balance & Vitality
          </h2>
          <p className="font-jost font-light mb-6 leading-relaxed" style={{ color: "var(--site-text-secondary)" }}>
            Discover Caribbean herbal protocols that have helped hundreds restore hormonal balance,
            boost fertility, and reclaim vitality — with Priest Kailash.
          </p>

          {/* Metadata */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="font-jost text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ border: "1px solid rgba(201,168,76,0.3)", color: "var(--site-gold)" }}>
              🌸 Women's Health
            </span>
            <span className="font-jost text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ border: "1px solid rgba(201,168,76,0.3)", color: "var(--site-gold)" }}>
              <Clock size={12} /> ~90 min
            </span>
            <span className="font-jost text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ border: "1px solid rgba(201,168,76,0.3)", color: "var(--site-gold)" }}>
              <Users size={12} /> 1.2K views
            </span>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-4">
            <a
              href="https://us06web.zoom.us/j/83340011876?pwd=vMrImiKGYGWbGbaioYt6RTEw2sbo0A.1"
              target="_blank"
              rel="noopener noreferrer"
              className="font-jost font-medium px-7 py-3 rounded-full text-sm transition-all duration-300 hover:brightness-110 hover:scale-[1.02] min-h-[48px] flex items-center gap-2"
              style={{ backgroundColor: "var(--site-gold)", color: "#090909" }}
            >
              {isLive ? "Reserve My Seat" : "Watch Recording"}
            </a>
            <button
              className="font-jost font-medium px-7 py-3 rounded-full text-sm border transition-all duration-300 hover:brightness-110 min-h-[48px]"
              style={{ borderColor: "rgba(242,234,216,0.3)", color: "var(--site-text-primary)" }}
            >
              Share Session
            </button>
          </div>

          {/* Date */}
          <p className="font-jost text-xs mt-4" style={{ color: "var(--site-text-secondary)" }}>
            Originally streamed March 2025
          </p>
        </div>
      </div>
    </section>
  );
}
