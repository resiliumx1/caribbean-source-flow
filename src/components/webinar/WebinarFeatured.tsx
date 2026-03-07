import { useRef, useEffect } from "react";
import webinarImg from "@/assets/mkrc-webinar-featured.jpg";

export default function WebinarFeatured() {
  const ref = useRef<HTMLElement>(null);

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
      style={{ backgroundColor: "#0f0f0d", borderTop: "1px solid rgba(201,168,76,0.2)" }}
    >
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 items-center">
        {/* Left: thumbnail */}
        <div className="relative rounded-2xl overflow-hidden" style={{ boxShadow: "0 0 60px rgba(201,168,76,0.08)" }}>
          <img
            src={webinarImg}
            alt="Featured MKRC Webinar"
            className="w-full h-auto object-cover"
            width={800}
            height={450}
            loading="lazy"
          />
          {/* Play overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm transition-transform duration-300 hover:scale-110 cursor-pointer"
              style={{ backgroundColor: "rgba(201,168,76,0.85)" }}
            >
              <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
                <path d="M2 1.5L20.5 13L2 24.5V1.5Z" fill="#090909" stroke="#090909" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right: info */}
        <div>
          <span
            className="font-jost text-xs tracking-[0.2em] uppercase mb-4 block"
            style={{ color: "#c9a84c" }}
          >
            Featured Session
          </span>
          <h2
            className="font-cormorant font-bold mb-4"
            style={{ color: "#f2ead8", fontSize: "clamp(1.5rem, 3vw, 2.25rem)", lineHeight: 1.2 }}
          >
            Reproductive Wellness: Nature's Approach to Fertility, Hormonal Balance & Vitality
          </h2>
          <p className="font-jost font-light mb-6 leading-relaxed" style={{ color: "#8a8070" }}>
            Discover Caribbean herbal protocols that have helped hundreds restore hormonal balance,
            boost fertility, and reclaim vitality — with Honorable Priest Kailash.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="font-jost text-xs px-3 py-1 rounded-full" style={{ border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c" }}>
              Women's Health
            </span>
            <span className="font-jost text-xs px-3 py-1 rounded-full" style={{ border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c" }}>
              ~90 min
            </span>
          </div>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://us06web.zoom.us/j/83340011876?pwd=vMrImiKGYGWbGbaioYt6RTEw2sbo0A.1"
              target="_blank"
              rel="noopener noreferrer"
              className="font-jost font-medium px-7 py-3 rounded-full text-sm transition-all duration-300 hover:brightness-110 hover:scale-[1.02]"
              style={{ backgroundColor: "#c9a84c", color: "#090909" }}
            >
              Watch Now
            </a>
            <button
              className="font-jost font-medium px-7 py-3 rounded-full text-sm border transition-all duration-300 hover:brightness-110"
              style={{ borderColor: "#f2ead8", color: "#f2ead8" }}
            >
              Share Session
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
