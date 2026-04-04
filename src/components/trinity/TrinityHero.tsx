import { Link } from "react-router-dom";
import { ShoppingBag, Building2, Mountain, ArrowRight } from "lucide-react";
import heroForest from "@/assets/home-hero-forest.webp";
import shopHero from "@/assets/shop-hero-flatlay.webp";
import wholesaleHero from "@/assets/wholesale-hero.webp";
import retreatHero from "@/assets/retreat-hero-yoga.webp";

const paths = [
  {
    icon: ShoppingBag,
    title: "Retail Wellness",
    description: "Shop our full catalog of liquid tinctures, capsules, powders, and traditional teas.",
    cta: "Browse Remedies",
    route: "/shop",
    image: shopHero,
  },
  {
    icon: Building2,
    title: "Professional Supply",
    description: "Access wholesale pricing with volume discounts. Full COA documentation and bulk packaging.",
    cta: "Access Wholesale Portal",
    route: "/wholesale",
    image: wholesaleHero,
  },
  {
    icon: Mountain,
    title: "Immersive Retreats",
    description: "Experience medically-informed cellular detox at our rainforest centre in Saint Lucia.",
    cta: "Check Availability",
    route: "/retreats",
    image: retreatHero,
  },
];

export function TrinityHero() {
  return (
    <section className="hero-section relative min-h-screen flex flex-col pt-16" style={{ background: "transparent" }}>
      {/* Background Image */}
      <div className="absolute inset-0 z-0" data-hero-bg="true" style={{ background: "transparent" }}>
        <img
          src={heroForest}
          alt="Lush green rainforest canopy"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          width={1600}
          height={900}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(10,30,10,0.6) 0%, rgba(0,0,0,0.3) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="hero-content relative z-10 flex-1 flex flex-col justify-center">
        <div className="container mx-auto max-w-6xl px-4 py-20 md:py-32">
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <h1
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontStyle: "italic",
                fontSize: "clamp(2.5rem, 5vw, 64px)",
                marginBottom: "24px",
                lineHeight: 1.1,
                color: "var(--site-hero-text-on-dark)",
              }}
            >
              Where Natural Wellness Finds Its Source
            </h1>
            <p
              className="max-w-4xl mx-auto"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 300,
                fontSize: "18px",
                color: "var(--site-hero-text-on-dark)",
                lineHeight: 1.7,
                opacity: 0.9,
              }}
            >
              Crafted in Saint Lucia using herbs grown in organically mineral rich soil,
              Mt. Kailash delivers natural formulations, immersive retreats, and trusted
              wholesale supply—designed to restore balance at every level.
            </p>
          </div>
        </div>

        {/* Path Cards */}
        <div className="container mx-auto max-w-6xl px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paths.map((path, index) => (
              <div
                key={path.route}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
              >
                <Link to={path.route} className="block group">
                  <div
                    className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02]"
                    style={{ minHeight: '340px' }}
                  >
                    <img
                      src={path.image}
                      alt={path.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      width={600}
                      height={400}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/40 to-transparent group-hover:from-[#0a0a0a]/80 transition-all duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '28px', color: '#f2ead8', marginBottom: '8px' }}>
                        {path.title}
                      </h2>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '14px', color: '#f2ead8', opacity: 0.8, marginBottom: '16px', lineHeight: 1.6 }}>
                        {path.description}
                      </p>
                      <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300" style={{ border: '1px solid #c9a84c', color: '#c9a84c', background: 'transparent', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                        {path.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Ticker Bar — infinite scroll marquee */}
      <div className="relative z-10 py-4 overflow-hidden" style={{ background: "var(--site-ticker-bg)" }}>
        <div className="marquee-track" style={{ display: "flex", width: "max-content", animation: "marquee-scroll 30s linear infinite" }}>
          {[0, 1].map((dup) => (
            <div
              key={dup}
              className="flex items-center gap-8 px-4"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400,
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--site-ticker-text)",
                whiteSpace: "nowrap",
              }}
            >
              <span>✦ 21+ YEARS CLINICAL PRACTICE</span>
              <span>✦ CERTIFIED PROCESSING FACILITY</span>
              <span>✦ FEATURED BY ST. LUCIA TOURISM AUTHORITY</span>
              <span>✦ ENDORSED BY CHRONIXX</span>
              <span>✦ MIAMI WAREHOUSE 3-DAY US DELIVERY</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
