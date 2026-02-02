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
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(150,30%,8%)]/90 via-[hsl(150,25%,12%)]/75 to-[hsl(150,30%,8%)]/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-4 py-20 md:py-32">
        <div className="container mx-auto max-w-6xl">
          {/* Headlines */}
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <h1 className="hero-title mb-6" style={{ color: "hsl(39, 70%, 65%)" }}>
              Where Natural Wellness Finds Its Source
            </h1>
            <p className="hero-subtitle max-w-4xl mx-auto" style={{ color: "hsl(45, 30%, 90%)" }}>
              Crafted in Saint Lucia using herbs grown in mineral-rich volcanic soil, 
              Mt. Kailash delivers natural formulations, immersive retreats, and trusted 
              wholesale supply—designed to restore balance at every level.
            </p>
          </div>

          {/* Professional CTA Cards */}
          <HeroCtas />
        </div>
      </div>

      {/* Trust Bar */}
      <div className="relative z-10 bg-secondary/95 backdrop-blur-sm py-4 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-secondary-foreground/90">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              21+ Years Clinical Practice
            </span>
            <span className="hidden md:inline text-secondary-foreground/40">|</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Certified Processing Facility
            </span>
            <span className="hidden md:inline text-secondary-foreground/40">|</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Featured by St. Lucia Tourism Authority
            </span>
            <span className="hidden md:inline text-secondary-foreground/40">|</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Miami Warehouse (3-Day US)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
