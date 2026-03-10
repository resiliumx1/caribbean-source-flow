import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import heroImage from "@/assets/shop-hero-apothecary.png";

const trustPills = [
  "3-Day US Shipping",
  "Wildcrafted in St. Lucia",
  "30-Day Money Back Guarantee",
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
      {/* Background image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
          filter: "brightness(0.55) saturate(0.9)",
        }}
      />

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(15,40,30,0.45) 0%, rgba(15,40,30,0.3) 50%, rgba(15,40,30,0.85) 100%)",
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
          className="mb-8 max-w-2xl mx-auto hidden sm:block"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: "18px",
            lineHeight: 1.6,
            color: "rgba(245,241,232,0.8)",
          }}
        >
          Forest-grown remedies for chronic inflammation, gut repair, and deep sleep.
          <br />
          Backed by 21 years of clinical practice.
        </p>
        <p
          className="mb-8 max-w-2xl mx-auto sm:hidden"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: "16px",
            lineHeight: 1.6,
            color: "rgba(245,241,232,0.8)",
          }}
        >
          Wild St. Lucian herbs for inflammation, sleep, and cellular repair.
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
