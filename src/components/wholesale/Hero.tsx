import { ArrowRight, MessageCircle } from "lucide-react";
import heroImage from "@/assets/wholesale-hero.jpg";

interface HeroProps {
  onScrollToForm: () => void;
}

export const Hero = ({ onScrollToForm }: HeroProps) => {
  const whatsappMessage = encodeURIComponent(
    "Hi, I'm interested in wholesale botanicals from St. Lucia for my business. Can you help with availability and custom pricing?"
  );

  return (
    <section className="relative min-h-screen flex items-center pt-16" style={{ fontFamily: "'Jost', sans-serif" }}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#090909]/85 via-[#0d1a0f]/70 to-[#090909]/80" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-[#f2ead8] mb-6 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Eliminate Batch Variability: Direct-From-Farm Caribbean Botanicals
          </h1>
          
          <p className="text-[#f2ead8]/90 mb-8 text-lg md:text-xl leading-relaxed" style={{ fontWeight: 300 }}>
            St. Lucian natural herbs with full documentation and Miami warehousing. 
            No customs surprises. No quality gaps. Custom pricing for your volume.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button 
              onClick={onScrollToForm}
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full text-[#090909] font-medium transition-all hover:brightness-110 hover:scale-[1.02]"
              style={{ background: "#c9a84c", fontFamily: "'Jost', sans-serif", fontWeight: 500, fontSize: "16px" }}
            >
              Request Custom Quote
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <a 
              href={`https://wa.me/13059429407?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full border-2 transition-all hover:bg-[#f2ead8]/10"
              style={{ borderColor: "#c9a84c", color: "#f2ead8", fontFamily: "'Jost', sans-serif", fontWeight: 500, fontSize: "16px" }}
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[#f2ead8]"
                style={{ 
                  background: "rgba(0,0,0,0.5)", 
                  border: "1px solid rgba(201,168,76,0.4)",
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 400,
                  fontSize: "13px"
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
        <div className="w-6 h-10 rounded-full border-2 flex justify-center pt-2" style={{ borderColor: "rgba(242,234,216,0.5)" }}>
          <div className="w-1.5 h-3 rounded-full" style={{ background: "rgba(242,234,216,0.7)" }} />
        </div>
      </div>
    </section>
  );
};
