import { useEffect, useRef } from "react";
import heroFlatlay from "@/assets/shop-hero-flatlay.webp";

const trustBadges = [
  { icon: "✦", label: "43,000+ Bottles Sold" },
  { icon: "🌿", label: "All Natural" },
  { icon: "🧪", label: "Batch Tested" },
  { icon: "🚚", label: "3-Day US Delivery" },
];

export function ShopHero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 600ms ease, transform 600ms ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-section relative h-[440px] md:h-[520px] overflow-hidden pt-16"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroFlatlay}
          alt="Caribbean herbal medicine products on volcanic stone"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "var(--site-hero-gradient)" }} />
      </div>

      {/* Content */}
      <div className="hero-content relative z-10 container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
        <h1
          className="text-3xl md:text-4xl lg:text-[56px] leading-tight mb-4 max-w-3xl"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            fontStyle: "italic",
            color: "var(--site-text-primary)",
          }}
        >
          Premium Herbal Formulations for Daily Balance
        </h1>

        <p
          className="mb-3 max-w-2xl"
          style={{
            fontFamily: "'Jost', sans-serif",
            fontWeight: 300,
            fontSize: "15px",
            color: "var(--site-gold)",
            letterSpacing: "0.05em",
          }}
        >
          Wildcrafted in Saint Lucia · Batch tested · Ships to US, UK &amp; Caribbean
        </p>

        <p className="text-sm mb-8" style={{ color: "var(--site-text-muted)" }}>
          Crafted for consistency • Designed for integration • Rooted in tradition
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4">
          {trustBadges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full"
              style={{
                background: "var(--site-bg-card)",
                border: "1px solid var(--site-border)",
                fontFamily: "'Jost', sans-serif",
                fontWeight: 300,
                fontSize: "13px",
                color: "var(--site-text-primary)",
              }}
            >
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
