import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

const trustPills = [
  "3-Day US Shipping",
  "COA Documentation",
  "500+ Physicians",
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
      className="relative min-h-[480px] md:min-h-[540px] overflow-hidden flex items-center"
      style={{ background: "var(--site-green-dark)" }}
    >
      {/* Split background images */}
      <div className="absolute inset-0 z-0 flex">
        {/* Left: volcanic soil / raw herbs */}
        <div
          className="w-1/2 h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&q=80')`,
            filter: "brightness(0.5) saturate(0.8)",
          }}
        />
        {/* Right: amber dropper bottle */}
        <div
          className="w-1/2 h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80')`,
            filter: "brightness(0.45) saturate(0.9) sepia(0.2)",
          }}
        />
      </div>

      {/* Dark gradient overlay bottom 40% */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(15,40,30,0.5) 0%, rgba(15,40,30,0.3) 60%, rgba(15,40,30,0.85) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <h1
          className="text-[40px] md:text-[52px] leading-[1.1] mb-5 max-w-3xl mx-auto"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            color: "#F5F1E8",
          }}
        >
          The Sulphur Ridge Apothecary
        </h1>

        <p
          className="mb-8 max-w-2xl mx-auto"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: "18px",
            lineHeight: 1.6,
            color: "rgba(245,241,232,0.8)",
          }}
        >
          Hand-extracted bush medicine. 40% higher alkaloid concentration than
          mainland Caribbean herbs.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <a
            href="#filter-nav"
            className="px-8 py-3 rounded-full font-medium text-sm transition-all hover:brightness-110"
            style={{
              background: "var(--site-gold)",
              color: "var(--site-green-dark)",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
            }}
          >
            Shop by Condition
          </a>
          <Link
            to="/shop"
            className="px-8 py-3 rounded-full font-medium text-sm transition-all hover:bg-white/10"
            style={{
              border: "1px solid rgba(245,241,232,0.5)",
              color: "#F5F1E8",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
            }}
          >
            Shop All Remedies
          </Link>
        </div>

        {/* Trust pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {trustPills.map((pill) => (
            <span
              key={pill}
              className="px-4 py-1.5 rounded-full"
              style={{
                background: "rgba(245,241,232,0.08)",
                border: "1px solid rgba(245,241,232,0.15)",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: "12px",
                color: "rgba(245,241,232,0.7)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {pill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
