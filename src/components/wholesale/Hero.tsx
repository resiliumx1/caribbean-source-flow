import { ArrowRight, Download, MessageCircle } from "lucide-react";
import priestHarvesting from "@/assets/priest-kailash-harvesting.png";
import warehouseImage from "@/assets/wholesale-warehouse-hero.png";

interface HeroProps {
  onScrollToForm: () => void;
}

export const Hero = ({ onScrollToForm }: HeroProps) => {
  const whatsappMessage = encodeURIComponent(
    "Hi, I'm interested in wholesale botanicals from St. Lucia for my business. Can you help with availability and custom pricing?"
  );

  return (
    <section className="relative min-h-[90vh] flex items-center">
      {/* Split Background */}
      <div className="absolute inset-0 z-0 grid grid-cols-1 md:grid-cols-2">
        <div className="relative overflow-hidden">
          <img
            src={priestHarvesting}
            alt="Priest Kailash harvesting Caribbean botanicals"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className="relative overflow-hidden hidden md:block">
          <img
            src={warehouseImage}
            alt="Miami fulfillment warehouse"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
      </div>

      {/* Dark Overlay 60% */}
      <div className="absolute inset-0 z-[1]" style={{ background: "rgba(15,40,30,0.6)" }} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-3xl">
          <h1
            className="mb-6"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: "clamp(36px, 5vw, 56px)",
              lineHeight: 1.1,
              color: "var(--site-hero-text-on-dark)",
            }}
          >
            Eliminate Batch Variability
          </h1>

          <p
            className="mb-8 max-w-xl"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontSize: "18px",
              lineHeight: 1.7,
              color: "var(--site-hero-text-on-dark)",
            }}
          >
            Direct-from-farm Caribbean botanicals with full documentation and
            Miami warehousing. Custom solutions for your volume.
          </p>

          {/* Trust bar */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            {["US & UK Export Ready", "Batch-Level Traceability", "Miami 3-Day Shipping"].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  color: "var(--site-hero-text-on-dark)",
                  background: "rgba(0,0,0,0.45)",
                  border: "1px solid rgba(188,138,95,0.35)",
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 400,
                  fontSize: "12px",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.1em",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--site-gold)" }} />
                {label}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`https://wa.me/13059429407?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full font-medium transition-all hover:brightness-110 hover:scale-[1.02]"
              style={{
                background: "var(--site-gold)",
                color: "#0F281E",
                fontFamily: "'Jost', sans-serif",
                fontWeight: 600,
                fontSize: "16px",
              }}
            >
              <MessageCircle className="w-5 h-5" />
              Speak With Our Sourcing Team
            </a>

            <button
              onClick={onScrollToForm}
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full border-2 transition-all hover:bg-white/10"
              style={{
                borderColor: "var(--site-hero-text-on-dark)",
                color: "var(--site-hero-text-on-dark)",
                fontFamily: "'Jost', sans-serif",
                fontWeight: 500,
                fontSize: "16px",
              }}
            >
              <Download className="w-5 h-5" />
              Download Product Catalog
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
        <div className="w-6 h-10 rounded-full border-2 flex justify-center pt-2" style={{ borderColor: "rgba(245,240,224,0.5)" }}>
          <div className="w-1.5 h-3 rounded-full" style={{ background: "rgba(245,240,224,0.7)" }} />
        </div>
      </div>
    </section>
  );
};
