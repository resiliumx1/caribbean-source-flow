import HeroCtas from "@/components/HeroCtas";

export function TrinityHero() {
  return (
    <section className="relative min-h-screen flex flex-col pt-16">
      {/* Background Video with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/90 via-[#0a0a0a]/75 to-[#0a0a0a]/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-4 py-20 md:py-32">
        <div className="container mx-auto max-w-6xl">
          {/* Headlines */}
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(2.5rem, 5vw, 64px)', color: '#c9a84c', marginBottom: '24px', lineHeight: 1.1, backgroundImage: 'linear-gradient(135deg, #c9a84c 0%, #e0c878 50%, #c9a84c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 100%', animation: 'shimmer 3s ease-in-out infinite' }}>
              Where Natural Wellness Finds Its Source
            </h1>
            <p className="max-w-4xl mx-auto" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '18px', color: '#f2ead8', lineHeight: 1.7, opacity: 0.9 }}>
              Crafted in Saint Lucia using herbs grown in mineral-rich volcanic soil, 
              Mt. Kailash delivers natural formulations, immersive retreats, and trusted 
              wholesale supply—designed to restore balance at every level.
            </p>
          </div>

          {/* Professional CTA Cards */}
          <HeroCtas />
        </div>
      </div>

      {/* Trust Ticker Bar */}
      <div className="relative z-10 py-4 px-4" style={{ background: '#111111' }}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 400, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c9a84c' }}>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#c9a84c' }} />
              21+ Years Clinical Practice
            </span>
            <span className="hidden md:inline" style={{ color: 'rgba(201,168,76,0.4)' }}>·</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#c9a84c' }} />
              Certified Processing Facility
            </span>
            <span className="hidden md:inline" style={{ color: 'rgba(201,168,76,0.4)' }}>·</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#c9a84c' }} />
              Featured by St. Lucia Tourism Authority
            </span>
            <span className="hidden md:inline" style={{ color: 'rgba(201,168,76,0.4)' }}>·</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#c9a84c' }} />
              Miami Warehouse (3-Day US)
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  );
}
