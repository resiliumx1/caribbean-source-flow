import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Quote, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";

interface Testimonial {
  id: string;
  audience: "b2b" | "b2c" | "retreat";
  quote: string;
  author_name: string;
  author_title: string | null;
  condition_addressed: string | null;
  results: string | null;
}

const audienceColors = {
  b2b: { bg: "from-[hsl(39,55%,45%)]/20 to-[hsl(39,55%,45%)]/5", accent: "hsl(39, 55%, 50%)" },
  b2c: { bg: "from-[hsl(75,26%,53%)]/20 to-[hsl(75,26%,53%)]/5", accent: "hsl(75, 26%, 53%)" },
  retreat: { bg: "from-[hsl(200,15%,55%)]/20 to-[hsl(200,15%,55%)]/5", accent: "hsl(200, 25%, 55%)" },
};

export function SocialProofMatrix() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: "start",
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );
  
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const { data: testimonials = [] } = useQuery({
    queryKey: ["featured-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_featured", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Testimonial[];
    },
  });

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-muted/50 via-background to-muted/30 overflow-hidden">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="section-header mb-4">
            Trusted by People on Their Wellness Journey
          </h2>
          <p className="section-subheader mx-auto">
            Real stories from practitioners, wellness seekers, and retreat guests
            who've experienced the Mt. Kailash difference.
          </p>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {testimonials.map((testimonial, index) => {
              const colors = audienceColors[testimonial.audience] || audienceColors.b2c;
              const isActive = index === selectedIndex;
              
              return (
                <motion.div
                  key={testimonial.id}
                  className="flex-shrink-0 w-[85%] md:w-[45%] lg:w-[32%]"
                  animate={{
                    scale: isActive ? 1.02 : 1,
                    opacity: isActive ? 1 : 0.85,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div 
                    className={`relative h-full bg-gradient-to-br ${colors.bg} backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-border/50 transition-all duration-300 hover:border-accent/40 hover:shadow-lg group`}
                  >
                    {/* Quote Icon */}
                    <div 
                      className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity"
                      style={{ background: colors.accent }}
                    >
                      <Quote className="w-5 h-5 text-background" />
                    </div>

                    {/* Avatar */}
                    <div className="flex items-center gap-4 mb-5">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: colors.accent }}
                      >
                        <User className="w-6 h-6 text-background" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {testimonial.author_name}
                        </div>
                        {testimonial.author_title && (
                          <div className="text-sm text-muted-foreground">
                            {testimonial.author_title}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quote */}
                    <p className="text-foreground/90 leading-relaxed mb-4 text-sm md:text-base">
                      "{testimonial.quote}"
                    </p>

                    {/* Results badge */}
                    {testimonial.results && (
                      <div 
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{ 
                          background: `${colors.accent}20`,
                          color: colors.accent,
                        }}
                      >
                        ✓ {testimonial.results}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === selectedIndex 
                  ? "w-8 bg-accent" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
