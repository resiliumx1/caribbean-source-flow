import { ArrowRight, MessageCircle } from "lucide-react";
import heroImage from "@/assets/wholesale-hero-botanical.webp";

interface HeroProps {
  onScrollToForm: () => void;
}

export const Hero = ({ onScrollToForm }: HeroProps) => {
  const whatsappMessage = encodeURIComponent(
    "Hi, I'm interested in wholesale botanicals from St. Lucia for my business. Can you help with availability and custom pricing?"
  );

  return (
    <section
      className="hero-section relative min-h-screen flex items-center pt-16"
      style={{ fontFamily: "'Jost', sans-serif", background: "transparent" }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        data-hero-bg="true"
        style={{ backgroundImage: `url(${heroImage})`, backgroundColor: "transparent" }}
      />

      {/* Dark Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(5,20,5,0.75) 0%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* Content */}
      <div className="hero-content relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl">
          <h1
            className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--site-hero-text-on-dark)",
            }}
          >
            Eliminate Batch Variability: Direct-From-Farm Caribbean Botanicals
          </h1>

          <p
            className="mb-8 text-lg md:text-xl leading-relaxed"
            style={{ fontWeight: 300, color: "var(--site-hero-text-on-dark)" }}
          >
            St. Lucian natural herbs with full documentation and Miami warehousing.
            No customs surprises. No quality gaps. Custom pricing for your volume.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button
              onClick={onScrollToForm}
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full font-medium transition-all hover:brightness-110 hover:scale-[1.02]"
              style={{
                color: "#090909",
                background: "#c9a84c",
                fontFamily: "'Jost', sans-serif",
                fontWeight: 500,
                fontSize: "16px",
              }}
            >
              Request Custom Quote
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href={`https://wa.me/13059429407?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full border-2 transition-all hover:bg-white/10"
              style={{
                borderColor: "#c9a84c",
                color: "var(--site-hero-text-on-dark)",
                fontFamily: "'Jost', sans-serif",
                fontWeight: 500,
                fontSize: "16px",
              }}
            >
              <MessageCircle className="w-5 h-5" />
              Speak with Our Sourcing Team
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-4">
            {["US & UK Export Ready", "Batch Traceability", "Miami Warehousing"].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  color: "var(--site-hero-text-on-dark)",
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(201,168,76,0.4)",
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 400,
                  fontSize: "13px",
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: "#c9a84c" }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 flex justify-center pt-2" style={{ borderColor: "rgba(245,240,224,0.6)" }}>
          <div className="w-1.5 h-3 rounded-full" style={{ background: "rgba(245,240,224,0.85)" }} />
        </div>
      </div>
    </section>
  );
};
