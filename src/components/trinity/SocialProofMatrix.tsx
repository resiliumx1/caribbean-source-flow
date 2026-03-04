import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Quote, User, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface Testimonial {
  id: string;
  audience: "b2b" | "b2c" | "retreat";
  quote: string;
  author_name: string;
  author_title: string | null;
  condition_addressed: string | null;
  results: string | null;
}

export function SocialProofMatrix() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1 },
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
    return () => { emblaApi.off("select", onSelect); };
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

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 md:py-28 overflow-hidden" style={{ background: '#0a0a0a' }}>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 44px)', color: '#f2ead8', marginBottom: '16px' }}>
            Trusted by People on Their Wellness Journey
          </h2>
          <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '16px', color: '#8a8070', maxWidth: '600px', margin: '0 auto' }}>
            Real stories from practitioners, wellness seekers, and retreat guests who've experienced the Mt. Kailash difference.
          </p>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="flex-shrink-0 w-[85%] md:w-[45%] lg:w-[32%]"
              >
                <div className="h-full rounded-2xl p-9" style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.2)' }}>
                  {/* Credentials at top */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #c9a84c, #a07830)', border: '2px solid #c9a84c' }}>
                      <User className="w-6 h-6" style={{ color: '#090909' }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: '20px', color: '#f2ead8' }}>
                        {testimonial.author_name}
                      </div>
                      {testimonial.author_title && (
                        <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 400, fontSize: '13px', color: '#c9a84c' }}>
                          {testimonial.author_title}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#c9a84c] text-[#c9a84c]" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontStyle: 'italic', fontSize: '15px', color: '#f2ead8', lineHeight: 1.8, marginBottom: '16px' }}>
                    "{testimonial.quote}"
                  </p>

                  {testimonial.results && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}>
                      ✓ {testimonial.results}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${index === selectedIndex ? "w-8" : "w-2"}`}
              style={{ background: index === selectedIndex ? '#c9a84c' : 'rgba(201,168,76,0.3)' }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
