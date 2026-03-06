import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Quote, MapPin, Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Testimonial {
  id: string;
  quote: string;
  author_name: string;
  author_title: string | null;
  condition_addressed: string | null;
  results: string | null;
}

const avatarImages = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
];

export function TransformationStories() {
  const { data: testimonials = [] } = useQuery({
    queryKey: ["retreat-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("audience", "retreat")
        .eq("is_featured", true)
        .order("display_order", { ascending: true })
        .limit(3);

      if (error) throw error;
      return data as Testimonial[];
    },
  });

  const displayTestimonials = testimonials.length > 0 ? testimonials : [
    { id: "1", quote: "After years of trying everything, Mt. Kailash gave me clarity and a system I could finally trust.", author_name: "Aisha", author_title: "Toronto", condition_addressed: null, results: null },
    { id: "2", quote: "The transformation was deeper than I expected. I left feeling truly renewed from the inside out.", author_name: "Marcus", author_title: "New York", condition_addressed: null, results: null },
    { id: "3", quote: "Priest Kailash's approach is unlike anything else. Traditional wisdom with real, measurable results.", author_name: "Sophia", author_title: "London", condition_addressed: null, results: null },
  ];

  return (
    <section className="py-24 md:py-28" style={{ background: 'var(--site-bg-primary)' }}>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(2rem, 4vw, 48px)', color: 'var(--site-text-primary)', marginBottom: '16px' }}>
            Real Transformations
          </h2>
          <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '16px', color: 'var(--site-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Stories from guests who experienced lasting change.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayTestimonials.map((story, index) => (
            <div
              key={story.id}
              className="rounded-2xl p-10 transition-all hover:scale-[1.02]"
              style={{ background: 'var(--site-bg-card)', border: '1px solid var(--site-border)', boxShadow: 'var(--site-shadow-card)' }}
            >
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-14 h-14" style={{ border: '2px solid #c9a84c' }}>
                  <AvatarImage src={avatarImages[index % avatarImages.length]} alt={story.author_name} className="object-cover" />
                  <AvatarFallback style={{ background: 'linear-gradient(135deg, #c9a84c, #a07830)', color: '#090909', fontSize: '18px', fontWeight: 700 }}>
                    {story.author_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: '20px', color: 'var(--site-text-primary)' }}>
                    {story.author_name}
                  </div>
                  {story.author_title && (
                    <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '13px', color: '#c9a84c' }}>
                      {story.author_title}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#c9a84c] text-[#c9a84c]" />
                ))}
              </div>

              <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontStyle: 'italic', fontSize: '15px', color: 'var(--site-text-primary)', lineHeight: 1.8 }}>
                "{story.quote}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
