import { useRef, useEffect, useState } from "react";
import HeroCtas from "@/components/HeroCtas";
import { useIsMobile } from "@/hooks/use-mobile";

export function TrinityHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section || prefersReduced) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [prefersReduced]);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col pt-16">
      {/* Background Video / Fallback */}
      <div className="absolute inset-0 z-0">
        {!prefersReduced ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=70&w=1400&fm=webp"
          >
            <source src="/videos/hero-background.mp4" type="video/mp4" />
          </video>
        ) : (
          <img
            src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=70&w=1400&fm=webp"
            alt="Lush tropical rainforest"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/90 via-[#0a0a0a]/75 to-[#0a0a0a]/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center">
        <div className="container mx-auto max-w-6xl px-4 py-20 md:py-32">
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
        </div>

        {/* Full-bleed CTA Cards */}
        <HeroCtas />
      </div>

      {/* Trust Ticker Bar — infinite scroll marquee */}
      <div className="relative z-10 py-4 overflow-hidden" style={{ background: '#111111' }}>
        <div className="marquee-track" style={{ display: 'flex', width: 'max-content', animation: 'marquee-scroll 30s linear infinite' }}>
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-8 px-4" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 400, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c9a84c', whiteSpace: 'nowrap' }}>
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
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
