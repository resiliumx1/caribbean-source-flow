import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, ShoppingBag, Mountain, GraduationCap } from "lucide-react";
import priestPhoto from "@/assets/priest-kailash-host.jpg";
import pillarWholesale from "@/assets/pillar-wholesale.png";
import pillarApothecary from "@/assets/pillar-apothecary.png";
import pillarRetreat from "@/assets/pillar-retreat.png";
import pillarSchool from "@/assets/pillar-school.png";

const pillars = [
  {
    title: "Wholesale Supply",
    description: "For practitioners",
    cta: "Access Portal",
    route: "/wholesale",
    image: pillarWholesale,
    icon: ClipboardList,
  },
  {
    title: "The Apothecary",
    description: "For personal use",
    cta: "Shop Remedies",
    route: "/shop",
    image: pillarApothecary,
    icon: ShoppingBag,
  },
  {
    title: "The Ridge Retreat",
    description: "7-day immersions",
    cta: "View Dates",
    route: "/retreats",
    image: pillarRetreat,
    icon: Mountain,
  },
  {
    title: "School of Bush Medicine",
    description: "Clinical training",
    cta: "Explore Courses",
    route: "/school/herbal-physician",
    image: pillarSchool,
    icon: GraduationCap,
  },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center" style={{ background: 'var(--site-bg-primary)' }}>
      <div className="container mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Left Column — 60% */}
          <div className="lg:col-span-3">
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontSize: "clamp(2.5rem, 5vw, 64px)",
                lineHeight: 1.08,
                color: "var(--site-text-primary)",
                marginBottom: "24px",
              }}
            >
              Clinical Bush Medicine from Sulphur Ridge
            </h1>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontWeight: 300,
                fontSize: "20px",
                lineHeight: 1.6,
                color: "var(--site-text-secondary)",
                marginBottom: "40px",
                maxWidth: "560px",
              }}
            >
              Hand-harvested formulations, practitioner training, and immersive
              retreats—backed by 21 years of clinical documentation.
            </p>

            {/* 4-Pillar Grid */}
            <div className="grid grid-cols-2 gap-4">
              {pillars.map((pillar) => {
                const IconComp = pillar.icon;
                return (
                  <Link
                    key={pillar.route + pillar.title}
                    to={pillar.route}
                    className="group block rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full"
                    style={{
                      background: "rgba(15,40,30,0.5)",
                      border: "1px solid rgba(188,138,95,0.3)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = "#BC8A5F";
                      el.style.boxShadow = "0 8px 30px rgba(188,138,95,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = "rgba(188,138,95,0.3)";
                      el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)";
                    }}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 h-full">
                      {/* Text side */}
                      <div className="flex-1 min-w-0">
                        <IconComp className="w-5 h-5 mb-3" style={{ color: "#BC8A5F" }} />
                        <h3
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 700,
                            fontSize: "20px",
                            color: "#F5F1E8",
                            marginBottom: "6px",
                          }}
                        >
                          {pillar.title}
                        </h3>
                        <div
                          style={{
                            fontFamily: "'Jost', sans-serif",
                            fontWeight: 300,
                            fontSize: "13px",
                            color: "rgba(245,241,232,0.7)",
                            marginBottom: "14px",
                          }}
                        >
                          {pillar.description}
                        </div>
                        <span
                          className="inline-flex items-center gap-1 text-sm font-medium"
                          style={{ color: "#BC8A5F" }}
                        >
                          {pillar.cta}{" "}
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                      {/* Illustration side */}
                      <img
                        src={pillar.image}
                        alt={pillar.title}
                        className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain flex-shrink-0 self-center opacity-100 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Column — 40% */}
          <div className="lg:col-span-2">
            <div className="rounded-lg overflow-hidden" style={{ boxShadow: "var(--site-shadow-card)" }}>
              <img
                src={priestPhoto}
                alt="Priest Kailash Leyonce at the volcanic ridge in Saint Lucia"
                className="w-full h-auto object-cover"
                style={{ minHeight: "480px", objectPosition: "center top" }}
                loading="eager"
                fetchPriority="high"
                width={600}
                height={800}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trust Micro-Bar */}
      <div
        className="py-3 overflow-hidden"
        style={{ background: "#1B4332", height: "48px", display: "flex", alignItems: "center" }}
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
              className="flex items-center gap-8 px-4"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontWeight: 400,
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#F5F1E8",
                whiteSpace: "nowrap",
              }}
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
