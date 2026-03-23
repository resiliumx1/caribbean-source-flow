import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Quote, Star } from "lucide-react";
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
    <section className="py-24 md:py-28 overflow-hidden" style={{ background: 'var(--site-bg-primary)' }}>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 44px)', color: 'var(--site-text-primary)', marginBottom: '16px' }}>
            Trusted by People on Their Wellness Journey
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '16px', color: 'var(--site-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
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
                <div className="h-full rounded-2xl p-9" style={{ background: 'var(--site-bg-card)', border: '1px solid var(--site-border)', boxShadow: 'var(--site-shadow-card)' }}>
                  {/* Credentials at top */}
                  <div className="flex items-center gap-4 mb-5">
                    <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(testimonial.author_name.toLowerCase())}&backgroundColor=b6e3f4,c0aede,ffdfbf&radius=50`} alt={testimonial.author_name} width={48} height={48} style={{ borderRadius: '50%', border: '2px solid var(--site-gold)', flexShrink: 0 }} loading="lazy" />
                    <div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '20px', color: 'var(--site-text-primary)' }}>
                        {testimonial.author_name}
                      </div>
                      {testimonial.author_title && (
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: '13px', color: 'var(--site-gold-text)' }}>
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
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontStyle: 'italic', fontSize: '15px', color: 'var(--site-text-secondary)', lineHeight: 1.8, marginBottom: '16px' }}>
                    "{testimonial.quote}"
                  </p>

                  {testimonial.results && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--site-gold-text)' }}>
                      ✓ {testimonial.results}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-8" role="tablist" aria-label="Testimonial slides">
          {testimonials.map((_, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={index === selectedIndex}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`rounded-full transition-all duration-300 ${index === selectedIndex ? "w-8 h-3" : "w-3 h-3"}`}
              style={{
                background: index === selectedIndex ? '#c9a84c' : 'rgba(201,168,76,0.3)',
                minWidth: 24,
                minHeight: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                position: 'relative',
              }}
              aria-label={`Go to slide ${index + 1}`}
            >
              <span
                className={`block rounded-full transition-all duration-300 ${index === selectedIndex ? "w-8 h-2" : "w-2 h-2"}`}
                style={{ background: index === selectedIndex ? '#c9a84c' : 'rgba(201,168,76,0.3)' }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
