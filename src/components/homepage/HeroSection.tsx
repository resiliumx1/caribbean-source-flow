import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, ShoppingBag, Mountain, GraduationCap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import priestPhoto from "@/assets/priest-kailash-host.webp";
import pillarWholesale from "@/assets/pillar-wholesale.png";
import pillarApothecary from "@/assets/pillar-apothecary.png";
import pillarRetreat from "@/assets/pillar-retreat.png";
import pillarSchool from "@/assets/pillar-school.png";

const pillars = [
{
  title: "Professional Supply",
  description: "Clinical formulations for practitioners & retailers",
  cta: "Partner With Us",
  ctaWeight: "font-medium" as const,
  route: "/wholesale",
  image: pillarWholesale,
  icon: ClipboardList
},
{
  title: "The Apothecary",
  description: "Hand-crafted remedies for personal use",
  cta: "Shop Remedies",
  ctaWeight: "font-medium" as const,
  route: "/shop",
  image: pillarApothecary,
  icon: ShoppingBag
},
{
  title: "Sacred Immersions",
  description: "Seven-day stress recovery retreats",
  cta: "Reserve Dates",
  ctaWeight: "font-semibold" as const,
  route: "/retreats",
  image: pillarRetreat,
  icon: Mountain
},
{
  title: "Herbal Physician School",
  description: "Master-level clinical certification",
  cta: "Start Training",
  ctaWeight: "font-semibold" as const,
  route: "https://mount-kailash-school-temp.netlify.app",
  external: true,
  image: pillarSchool,
  icon: GraduationCap
}];


function PillarCard({ pillar, index }: {pillar: typeof pillars[number];index: number;}) {
  const IconComp = pillar.icon;
  const isAboveFold = index === 0;
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {if (entry.isIntersecting) {setDrawn(true);obs.disconnect();}},
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const isExternal = 'external' in pillar && pillar.external;
  
  if (isExternal) {
    return (
      <a
        ref={cardRef as any}
        href={pillar.route}
        target="_blank"
        rel="noopener noreferrer"
        className="pillar-card group relative overflow-hidden rounded-2xl block transition-all duration-500"
        style={{
          background: "hsl(152 48% 20% / 0.9)",
          animationDelay: `${index * 200}ms`
        }}
        data-drawn={drawn}>
        <div className="pillar-border-glow absolute inset-0 rounded-2xl pointer-events-none z-20" />
        <img
          src={pillar.image}
          alt={`${pillar.title} — ${pillar.description}`}
          className="absolute right-0 top-0 h-full w-3/4 object-contain object-right opacity-100 group-hover:scale-110 transition-transform duration-500"
          style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))", transform: "scale(1.1)" }}
          loading="lazy"
          width={643}
          height={388} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, hsl(152 48% 20%) 40%, hsl(152 48% 20% / 0.9) 60%, transparent 100%)" }} />
        <div className="relative z-10 w-3/5 h-full flex flex-col justify-center p-3 lg:p-4">
          <IconComp className="w-4 h-4 mb-1.5 text-gold" />
          <h3 className="font-serif text-base lg:text-lg font-bold text-cream mb-0.5 leading-tight">{pillar.title}</h3>
          <div className="text-xs text-cream/70 mb-2 font-sans font-light leading-snug">{pillar.description}</div>
          <span className={`inline-flex items-center gap-1.5 text-sm ${pillar.ctaWeight} mt-auto text-gold`}>
            {pillar.cta}
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </a>
    );
  }

  return (
    <Link
      ref={cardRef}
      to={pillar.route}
      className="pillar-card group relative overflow-hidden rounded-2xl block transition-all duration-500"
      style={{
        background: "hsl(152 48% 20% / 0.9)",
        animationDelay: `${index * 200}ms`
      }}
      data-drawn={drawn}>
      
      {/* Animated border wrapper */}
      <div className="pillar-border-glow absolute inset-0 rounded-2xl pointer-events-none z-20" />

      {/* Illustration */}
      <img
        src={pillar.image}
        alt={`${pillar.title} — ${pillar.description}`}
        className="absolute right-0 top-0 h-full w-3/4 object-contain object-right opacity-100 group-hover:scale-110 transition-transform duration-500"
        style={{
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
          transform: "scale(1.1)"
        }}
        loading={isAboveFold ? "eager" : "lazy"}
        {...isAboveFold ? { fetchPriority: "high" as const } : {}}
        width={643}
        height={388} />
      

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to right, hsl(152 48% 20%) 40%, hsl(152 48% 20% / 0.9) 60%, transparent 100%)"
        }} />
      

      {/* Text Content */}
      <div className="relative z-10 w-3/5 h-full flex flex-col justify-center p-3 lg:p-4">
        <IconComp className="w-4 h-4 mb-1.5 text-gold" />
        <h3 className="font-serif text-base lg:text-lg font-bold text-cream mb-0.5 leading-tight">
          {pillar.title}
        </h3>
        <div className="text-xs text-cream/70 mb-2 font-sans font-light leading-snug">
          {pillar.description}
        </div>
        <span className={`inline-flex items-center gap-1.5 text-sm ${pillar.ctaWeight} mt-auto text-gold`}>
          {pillar.cta}
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>);

}

export function HeroSection() {
  return (
    <section className="relative flex flex-col bg-forest-dark hero-viewport-fit">
      {/* Main content — vertically centered */}
      <div className="flex-1 flex items-center">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-4 lg:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
            {/* Left Column — 7 cols */}
            <div className="lg:col-span-7 flex flex-col">
              {/* Headline Block */}
              <div className="max-w-[600px] mb-6 lg:mb-10">
                <h1
                  className="text-[28px] sm:text-[34px] lg:text-[44px] leading-[1.1]"
                  style={{ color: '#F4EFEA', fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                  Reclaim Your Balance.{' '}
                  <span className="block">Reconnect with your essence.</span>
                </h1>
                <p
                  className="text-[18px] sm:text-[22px] lg:text-[26px] mt-3"
                  style={{ color: '#D4AF37', fontStyle: 'normal', fontWeight: 300, letterSpacing: '0.05em' }}>
                  Welcome to Mount Kailash.
                </p>
                <p
                  className="text-[13px] sm:text-[14px] lg:text-[15px] mt-3"
                  style={{ color: 'rgba(244, 239, 234, 0.8)', fontWeight: 300, letterSpacing: '0.04em' }}>
                  21 years restoring what modern life took away.
                </p>
              </div>

              {/* 4-Pillar Grid */}
              <div className="grid grid-cols-2 gap-3 lg:gap-4 flex-1">
                {pillars.map((pillar, i) =>
                <PillarCard key={pillar.route} pillar={pillar} index={i} />
                )}
              </div>
            </div>

            {/* Right Column — 5 cols (hidden on mobile) */}
            <div className="hidden lg:flex lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl w-full z-[1]">
                <img
                  src={priestPhoto}
                  alt="Priest Kailash Leyonce at the volcanic ridge in Saint Lucia"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "center top", minHeight: "400px" }}
                  loading="eager"
                  fetchPriority="high"
                  width={600}
                  height={800} />
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Micro-Bar */}
      <div
        className="overflow-hidden bg-forest-light shrink-0"
        style={{ height: "44px", display: "flex", alignItems: "center" }}>
        
        <div
          style={{
            display: "flex",
            width: "max-content",
            animation: "marquee-scroll 30s linear infinite"
          }}>
          
          {[0, 1].map((dup) =>
          <div
            key={dup}
            className="flex items-center gap-8 px-4 font-sans text-xs uppercase tracking-widest text-cream whitespace-nowrap">
            
              <span>✦ FEATURED BY ST. LUCIA TOURISM</span>
              <span>✦ 3-DAY US DELIVERY</span>
              <span>✦ COA DOCUMENTATION</span>
              <span>✦ 500+ PHYSICIANS TRAINED</span>
              <span>✦ 21+ YEARS CLINICAL PRACTICE</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* Hero viewport fitting */
        .hero-viewport-fit {
          min-height: 100vh;
          padding-top: 80px;
          box-sizing: border-box;
          overflow: hidden;
        }
        @media (max-height: 800px) and (min-width: 1024px) {
          .hero-viewport-fit {
            padding-top: 64px;
          }
        }
        @media (max-width: 1023px) {
          .hero-viewport-fit {
            min-height: auto;
            padding-top: 80px;
            overflow: visible;
          }
        }

        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* === Pillar Card Premium Borders === */

        /* Shimmer gradient border (idle — slow 20s loop) */
        .pillar-card {
          position: relative;
          border: 1.5px solid rgba(212, 175, 55, 0.35);
          border-radius: 16px;
        }

        .pillar-border-glow {
          border: 1.5px solid transparent;
          border-radius: 16px;
          transition: box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.5s ease;
        }

        /* Shimmer overlay via pseudo-element */
        .pillar-card::before {
          content: '';
          position: absolute;
          inset: -1.5px;
          border-radius: 17px;
          padding: 1.5px;
          background: linear-gradient(
            var(--shimmer-angle, 0deg),
            rgba(212, 175, 55, 0.1) 0%,
            rgba(212, 175, 55, 0.6) 25%,
            rgba(245, 245, 220, 0.4) 50%,
            rgba(212, 175, 55, 0.6) 75%,
            rgba(212, 175, 55, 0.1) 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          z-index: 21;
          opacity: 0;
          animation: shimmer-rotate 20s linear infinite;
          pointer-events: none;
        }

        /* Draw-in on scroll — uses stroke-like reveal */
        .pillar-card[data-drawn="false"]::before {
          opacity: 0;
        }
        .pillar-card[data-drawn="true"]::before {
          animation: border-draw-in 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards,
                     shimmer-rotate 20s linear 1.2s infinite;
        }

        @keyframes border-draw-in {
          0% {
            opacity: 0;
            clip-path: inset(0 100% 100% 0);
          }
          50% {
            opacity: 0.8;
            clip-path: inset(0 0 50% 0);
          }
          100% {
            opacity: 1;
            clip-path: inset(0 0 0 0);
          }
        }

        @keyframes shimmer-rotate {
          0% { --shimmer-angle: 0deg; }
          100% { --shimmer-angle: 360deg; }
        }

        /* Fallback for browsers without @property */
        @supports not (background: paint(something)) {
          @keyframes shimmer-rotate {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(0deg); }
          }
          .pillar-card::before {
            background: linear-gradient(
              135deg,
              rgba(212, 175, 55, 0.15) 0%,
              rgba(212, 175, 55, 0.5) 50%,
              rgba(212, 175, 55, 0.15) 100%
            );
            background-size: 300% 300%;
            animation: shimmer-slide 8s ease-in-out infinite;
          }
          .pillar-card[data-drawn="true"]::before {
            animation: border-draw-in 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards,
                       shimmer-slide 8s ease-in-out 1.2s infinite;
          }
        }

        @keyframes shimmer-slide {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Hover: glow pulse + lift + border brighten */
        .pillar-card:hover {
          transform: translateY(-4px);
          border-color: rgba(212, 175, 55, 0.7);
          box-shadow:
            0 0 20px rgba(212, 175, 55, 0.25),
            0 8px 32px rgba(0, 0, 0, 0.3);
          background: hsl(152 48% 21% / 0.95) !important;
        }

        .pillar-card:hover::before {
          opacity: 1;
          animation-duration: 4s;
        }

        .pillar-card:hover .pillar-border-glow {
          box-shadow: 0 0 24px rgba(212, 175, 55, 0.3);
        }

        /* Staggered draw-in delay per card */
        .pillar-card:nth-child(1) { --draw-delay: 0ms; }
        .pillar-card:nth-child(2) { --draw-delay: 200ms; }
        .pillar-card:nth-child(3) { --draw-delay: 400ms; }
        .pillar-card:nth-child(4) { --draw-delay: 600ms; }

        .pillar-card[data-drawn="true"]::before {
          animation-delay: var(--draw-delay), calc(var(--draw-delay) + 1.2s);
        }
      `}</style>
    </section>);

}