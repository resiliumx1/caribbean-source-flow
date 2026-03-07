import { useRef, useEffect } from "react";
import priestKailashImg from "@/assets/priest-kailash-host.jpg";

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
    <section ref={ref} className="webinar-reveal webinar-noise relative" style={{ backgroundColor: "#0d1a0f" }}>
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12 items-center">
        {/* Left: photo */}
        <div className="relative">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 0 60px rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.15)" }}
          >
            <img
              src={priestKailashImg}
              alt="Honorable Priest Kailash"
              className="w-full h-auto object-cover"
            />
          </div>
          {/* Floating credential badge */}
          <div
            className="absolute -bottom-4 left-4 right-4 sm:left-6 sm:right-auto font-jost text-xs px-4 py-2 rounded-lg backdrop-blur-md"
            style={{
              backgroundColor: "rgba(9,9,9,0.85)",
              border: "1px solid rgba(201,168,76,0.3)",
              color: "#c9a84c",
            }}
          >
            20 Years • Herbal Medicine • MKRC Founder
          </div>
        </div>

        {/* Right: bio */}
        <div>
          <span className="font-jost text-xs tracking-[0.2em] uppercase mb-4 block" style={{ color: "#c9a84c" }}>
            Your Host & Guide
          </span>
          <h2
            className="font-cormorant font-bold mb-2"
            style={{ color: "#f2ead8", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}
          >
            Honorable Priest Kailash
          </h2>
          <p className="font-jost font-light mb-6" style={{ color: "#c9a84c" }}>
            Founder, Mount Kailash Rejuvenation Centre
          </p>
          <p className="font-jost font-light leading-relaxed mb-8" style={{ color: "#8a8070" }}>
            For over two decades, Honorable Priest Kailash has dedicated his life to the study and practice of herbal medicine
            from the volcanic mountains of Saint Lucia. He created these free webinars because he believes healing knowledge
            belongs to everyone — not locked behind paywalls. His mission through MKRC is to make natural wellness accessible worldwide.
          </p>
          <div className="flex flex-wrap gap-3 mb-8">
            {CREDENTIALS.map((c) => (
              <span
                key={c}
                className="font-jost text-xs px-4 py-2 rounded-full"
                style={{ border: "1px solid rgba(201,168,76,0.3)", color: "#f2ead8" }}
              >
                {c}
              </span>
            ))}
          </div>
          <a
            href="/"
            className="font-jost font-medium px-7 py-3 rounded-full text-sm border transition-all duration-300 hover:brightness-110 hover:scale-[1.02] inline-block"
            style={{ borderColor: "#c9a84c", color: "#c9a84c" }}
          >
            Learn More About MKRC →
          </a>
        </div>
      </div>
    </section>
  );
}
