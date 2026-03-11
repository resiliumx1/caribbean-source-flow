import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, ShoppingBag, Mountain, GraduationCap } from "lucide-react";
import priestPhoto from "@/assets/priest-kailash-host.webp";
import pillarWholesale from "@/assets/pillar-wholesale.png";
import pillarApothecary from "@/assets/pillar-apothecary.png";
import pillarRetreat from "@/assets/pillar-retreat.png";
import pillarSchool from "@/assets/pillar-school.png";

const pillars = [
  {
    title: "Professional Supply",
    description: "Clinical formulations for practitioners & retailers",
    cta: "Partner With Us →",
    ctaWeight: "font-medium" as const,
    route: "/wholesale",
    image: pillarWholesale,
    icon: ClipboardList,
  },
  {
    title: "The Apothecary",
    description: "Hand-crafted remedies for personal use",
    cta: "Shop Remedies →",
    ctaWeight: "font-medium" as const,
    route: "/shop",
    image: pillarApothecary,
    icon: ShoppingBag,
  },
  {
    title: "Sacred Immersions",
    description: "Seven-day stress recovery retreats",
    cta: "Reserve Dates →",
    ctaWeight: "font-semibold" as const,
    route: "/retreats",
    image: pillarRetreat,
    icon: Mountain,
  },
  {
    title: "Herbal Physician School",
    description: "Master-level clinical certification",
    cta: "Start Training →",
    ctaWeight: "font-semibold" as const,
    route: "/school/herbal-physician",
    image: pillarSchool,
    icon: GraduationCap,
  },
];

function PillarCard({ pillar, index }: { pillar: typeof pillars[number]; index: number }) {
  const IconComp = pillar.icon;
  const isAboveFold = index === 0;
  return (
    <Link
      to={pillar.route}
      className="group relative overflow-hidden rounded-2xl block transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(188,138,95,0.15)] border border-gold/20 hover:border-gold"
      style={{ background: "hsl(150 35% 12% / 0.8)" }}
    >
      {/* Illustration — right side, large & fully opaque */}
      <img
        src={pillar.image}
        alt={`${pillar.title} — ${pillar.description}`}
        className="absolute right-0 top-0 h-full w-3/4 object-contain object-right opacity-100 group-hover:scale-110 transition-transform duration-500"
        style={{
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
          transform: "scale(1.1)",
        }}
        loading={isAboveFold ? "eager" : "lazy"}
        {...(isAboveFold ? { fetchPriority: "high" as const } : {})}
        width={643}
        height={388}
      />

      {/* Gradient overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to right, hsl(150 35% 12%) 35%, hsl(150 35% 12% / 0.85) 55%, transparent 100%)",
        }}
      />

      {/* Text Content */}
      <div className="relative z-10 w-3/5 h-full flex flex-col justify-center p-5">
        <IconComp className="w-5 h-5 mb-2 text-gold" />
        <h3 className="font-serif text-lg font-bold text-cream mb-1">
          {pillar.title}
        </h3>
        <div className="text-xs text-cream/70 mb-3 font-sans font-light">
          {pillar.description}
        </div>
        <span className={`inline-flex items-center gap-1 text-sm ${pillar.ctaWeight} mt-auto text-gold`}>
          {pillar.cta}{" "}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col bg-forest-dark">
      {/* Main content — vertically centered */}
      <div className="flex-1 flex items-center">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column — 7 cols */}
            <div className="lg:col-span-7 flex flex-col">
              {/* Headline Block — static, no animation */}
              <div className="max-w-[600px] mb-16 md:mb-20">
                <h1
                  className="font-serif font-bold text-[32px] sm:text-[36px] lg:text-[46px] leading-[1.1]"
                  style={{ color: '#F5F5DC' }}
                >
                  Come back to yourself.
                </h1>
                <p
                  className="font-serif italic text-[20px] sm:text-[22px] lg:text-[28px] mt-2"
                  style={{ color: '#D4AF37' }}
                >
                  At Mount Kailash.
                </p>
                <p
                  className="font-sans uppercase tracking-[0.1em] text-[14px] sm:text-[16px] lg:text-[18px] font-medium mt-8"
                  style={{ color: '#D4AF37' }}
                >
                  Clinical Bush Medicine. Proven Results.
                  <span className="block mt-2 h-px w-[40%]" style={{ background: '#D4AF37' }} />
                </p>
                <p
                  className="font-serif italic text-[14px] sm:text-[15px] lg:text-[16px] font-light mt-4"
                  style={{ color: 'rgba(245, 245, 220, 0.8)' }}
                >
                  21 years restoring what modern life took away.
                </p>
              </div>

              {/* 4-Pillar Grid — fills remaining height */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                {pillars.map((pillar, i) => (
                  <PillarCard key={pillar.route} pillar={pillar} index={i} />
                ))}
              </div>
            </div>

            {/* Right Column — 5 cols, matched height */}
            <div className="lg:col-span-5 flex">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl w-full">
                <img
                  src={priestPhoto}
                  alt="Priest Kailash Leyonce at the volcanic ridge in Saint Lucia"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "center top", minHeight: "480px" }}
                  loading="eager"
                  fetchPriority="high"
                  width={600}
                  height={800}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Micro-Bar — pinned to bottom */}
      <div
        className="overflow-hidden bg-forest-light"
        style={{ height: "48px", display: "flex", alignItems: "center" }}
      >
        <div
          style={{
            display: "flex",
            width: "max-content",
            animation: "marquee-scroll 30s linear infinite",
          }}
        >
          {[0, 1].map((dup) => (
            <div
              key={dup}
              className="flex items-center gap-8 px-4 font-sans text-xs uppercase tracking-widest text-cream whitespace-nowrap"
            >
              <span>✦ FEATURED BY ST. LUCIA TOURISM</span>
              <span>✦ 3-DAY US DELIVERY</span>
              <span>✦ COA DOCUMENTATION</span>
              <span>✦ 500+ PHYSICIANS TRAINED</span>
              <span>✦ 21+ YEARS CLINICAL PRACTICE</span>
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
