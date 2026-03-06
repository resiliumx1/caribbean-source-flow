import HeroCtas from "@/components/HeroCtas";
import heroForest from "@/assets/home-hero-forest.jpg";

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
                fontFamily: "'Cormorant Garamond', serif",
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
                fontFamily: "'Jost', sans-serif",
                fontWeight: 300,
                fontSize: "18px",
                color: "var(--site-hero-text-on-dark)",
                lineHeight: 1.7,
                opacity: 0.9,
              }}
            >
              Crafted in Saint Lucia using herbs grown in mineral-rich volcanic soil,
              Mt. Kailash delivers natural formulations, immersive retreats, and trusted
              wholesale supply—designed to restore balance at every level.
            </p>
          </div>
        </div>

        <HeroCtas />
      </div>

      {/* Trust Ticker Bar — infinite scroll marquee */}
      <div className="relative z-10 py-4 overflow-hidden" style={{ background: "var(--site-ticker-bg)" }}>
        <div className="marquee-track" style={{ display: "flex", width: "max-content", animation: "marquee-scroll 30s linear infinite" }}>
          {[0, 1].map((dup) => (
            <div
              key={dup}
              className="flex items-center gap-8 px-4"
              style={{
                fontFamily: "'Jost', sans-serif",
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
