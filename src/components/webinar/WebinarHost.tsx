import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import priestKailashImg from "@/assets/priest-kailash-host.webp";

const CREDENTIALS = ["Herbal Medicine", "Nutrition", "Holistic Wellness"];

export default function WebinarHost() {
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
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12 items-center">
        {/* Left: photo */}
        <div className="relative">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 0 60px rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.15)" }}
          >
            <img
              src={priestKailashImg}
              alt="Rt Hon Priest Kailash K Leonce — herbal medicine practitioner and MKRC founder"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
          {/* Floating credential badge */}
          <div
            className="absolute -bottom-4 left-4 right-4 sm:left-6 sm:right-auto font-jost text-xs px-4 py-2 rounded-lg backdrop-blur-md"
            style={{
              backgroundColor: "rgba(9,9,9,0.85)",
              border: "1px solid rgba(201,168,76,0.3)",
              color: "var(--site-gold)",
            }}
          >
            21 Years • Herbal Medicine • MKRC Founder
          </div>
        </div>

        {/* Right: bio */}
        <div>
          <span className="font-jost text-xs tracking-[0.2em] uppercase mb-4 block" style={{ color: "var(--site-gold)" }}>
            Your Host & Guide
          </span>
          <h2
            className="font-cormorant font-bold mb-2"
            style={{ color: "var(--site-text-primary)", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}
          >
            Rt Hon Priest Kailash K Leonce
          </h2>
          <p className="font-jost font-light mb-6" style={{ color: "var(--site-gold)" }}>
            Founder, Mount Kailash Rejuvenation Centre
          </p>
          <p className="font-jost font-light leading-relaxed mb-8" style={{ color: "var(--site-text-secondary)" }}>
            For over two decades, Priest Kailash has dedicated his life to the study and practice of herbal medicine
            from the mountains of Saint Lucia. He created these free webinars because he believes healing knowledge
            belongs to everyone — not locked behind paywalls.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            {CREDENTIALS.map((c) => (
              <span
                key={c}
                className="font-jost text-xs px-4 py-2 rounded-full"
                style={{ border: "1px solid rgba(201,168,76,0.3)", color: "var(--site-text-primary)" }}
              >
                {c}
              </span>
            ))}
          </div>

          {/* Product bridge */}
          <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)" }}>
            <p className="font-jost text-sm mb-2" style={{ color: "var(--site-text-primary)" }}>
              Learn more about his signature formulation:
            </p>
            <Link
              to="/the-answer"
              className="font-jost text-sm font-medium flex items-center gap-1 transition-colors hover:brightness-125"
              style={{ color: "var(--site-gold)" }}
            >
              Discover The Answer — Oak-Aged Immune Elixir <ArrowRight size={14} />
            </Link>
          </div>

          <Link
            to="/"
            className="font-jost font-medium px-7 py-3 rounded-full text-sm border transition-all duration-300 hover:brightness-110 hover:scale-[1.02] inline-block min-h-[48px]"
            style={{ borderColor: "var(--site-gold)", color: "var(--site-gold)" }}
          >
            Learn More About MKRC →
          </Link>
        </div>
      </div>
    </section>
  );
}
