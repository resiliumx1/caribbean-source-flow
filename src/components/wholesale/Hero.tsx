import { ArrowRight, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-farm.jpg";

interface HeroProps {
  onScrollToForm: () => void;
}

export const Hero = ({ onScrollToForm }: HeroProps) => {
  const whatsappMessage = encodeURIComponent(
    "Hi, I'm interested in wholesale botanicals from St. Lucia for my business. Can you help with availability and custom pricing?"
  );

  return (
    <section className="relative min-h-screen flex items-center pt-16">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Dark Overlay - NO white/cream */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(150,30%,10%)]/85 via-[hsl(150,25%,15%)]/70 to-[hsl(150,30%,10%)]/80" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl">
          <h1 className="hero-title text-cream mb-6 animate-slide-up">
            Eliminate Batch Variability: Direct-From-Farm Caribbean Botanicals
          </h1>
          
          <p className="hero-subtitle text-cream/90 mb-8 animate-slide-up delay-100">
            St. Lucian natural herbs with full documentation and Miami warehousing. 
            No customs surprises. No quality gaps. Custom pricing for your volume.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-slide-up delay-200">
            <Button 
              variant="hero" 
              size="xl" 
              onClick={onScrollToForm}
              className="group"
            >
              Request Custom Quote
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="heroSecondary" 
              size="xl" 
              asChild
            >
              <a 
                href={`https://wa.me/13059429407?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Speak with Our Sourcing Team
              </a>
            </Button>
          </div>
          
          {/* Trust Bar */}
          <div className="flex flex-wrap items-center gap-6 text-cream/90 text-sm font-medium animate-fade-in delay-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              US & UK Export Ready
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              Batch Traceability
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              Miami Warehousing
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-cream/50 flex justify-center pt-2">
          <div className="w-1.5 h-3 rounded-full bg-cream/70" />
        </div>
      </div>
    </section>
  );
};
