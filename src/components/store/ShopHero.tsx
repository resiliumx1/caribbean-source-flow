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
          className="text-3xl md:text-5xl lg:text-6xl leading-[1.1] font-bold tracking-tight max-w-3xl mx-auto"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#F5F1E8",
          }}
        >
          Rejuvenation Starts Here
        </h1>

        <p
          className="text-base md:text-xl mt-2 font-medium max-w-2xl mx-auto"
          style={{
            fontFamily: "'Inter', sans-serif",
            color: "var(--site-gold)",
          }}
        >
          The Mount Kailash Apothecary — Clinical formulas from our St. Lucia practice
        </p>

        <p
          className="text-base md:text-lg mt-6 mb-8 max-w-2xl mx-auto leading-relaxed"
          style={{
            fontFamily: "'Inter', sans-serif",
            color: "rgba(255,255,255,0.9)",
          }}
        >
          Complete protocols for inflammation, immunity, hormonal balance, and cellular repair. From our St. Lucian clinic to your doorstep.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-10">
          <a
            href="#filter-nav"
            className="px-8 py-3 rounded-full font-semibold text-sm transition-all hover:brightness-90 w-full sm:w-auto text-center"
            style={{
              background: "var(--site-gold)",
              color: "var(--site-green-dark)",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Shop Best Sellers →
          </a>
          <a
            href="#filter-nav"
            className="px-8 py-3 rounded-full font-semibold text-sm transition-all hover:bg-white/10 w-full sm:w-auto text-center"
            style={{
              border: "2px solid rgba(255,255,255,0.3)",
              color: "#FFFFFF",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Shop by Condition →
          </a>
        </div>

        {/* Trust pills */}
        <div className="flex flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-3 overflow-x-auto sm:overflow-visible scrollbar-hide px-1">
          {trustPills.map((pill) => (
            <span
              key={pill}
              className="px-4 py-2 rounded-full text-xs md:text-sm font-medium tracking-wide whitespace-nowrap backdrop-blur-md"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#FFFFFF",
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
