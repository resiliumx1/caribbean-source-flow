import { useState, useRef, useEffect } from "react";

export default function WebinarSignup() {
  const [subscribed, setSubscribed] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.classList.add("visible"); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
  };

  return (
    <section ref={ref} className="webinar-reveal webinar-noise relative" style={{ backgroundColor: "#090909" }}>
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 max-w-lg mx-auto px-6 py-24 text-center">
        <h2
          className="font-cormorant font-bold italic mb-4 webinar-shimmer"
          style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
        >
          Be First to Heal.
        </h2>
        <p className="font-jost font-light mb-8" style={{ color: "#8a8070" }}>
          Get notified when new webinars go live. No spam — just sessions worth your time.
        </p>

        {subscribed ? (
          <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "#18181b", border: "1px solid rgba(201,168,76,0.2)" }}>
            <span className="text-4xl mb-3 block">✅</span>
            <p className="font-cormorant font-bold text-xl" style={{ color: "#f2ead8" }}>You're In!</p>
            <p className="font-jost font-light text-sm mt-2" style={{ color: "#8a8070" }}>We'll keep you in the loop.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Your email address"
              required
              className="flex-1 rounded-full px-5 py-3 text-sm outline-none font-jost"
              style={{
                backgroundColor: "#18181b",
                border: "1px solid rgba(242,234,216,0.2)",
                color: "#f2ead8",
              }}
            />
            <button
              type="submit"
              className="font-jost font-medium px-7 py-3 rounded-full text-sm transition-all duration-300 hover:brightness-110 hover:scale-[1.02] whitespace-nowrap"
              style={{ backgroundColor: "#c9a84c", color: "#090909" }}
            >
              Notify Me
            </button>
          </form>
        )}

        <p className="font-jost text-xs mt-4" style={{ color: "#8a8070" }}>
          ✦ Join 1,000+ subscribers. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
