import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
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
    { id: "1", quote: "I came exhausted from burnout. I left with clarity, new habits, and a sense of peace I haven't felt in years.", author_name: "Sarah B.", author_title: "Toronto", condition_addressed: null, results: null },
    { id: "2", quote: "The food alone was worth the trip — plus I learned so much about plants and traditional wellness.", author_name: "Michael O.", author_title: "New York", condition_addressed: null, results: null },
    { id: "3", quote: "A reset I didn't know I needed. The rainforest, the people, the practices — everything was perfect.", author_name: "Jennifer L.", author_title: "London", condition_addressed: null, results: null },
  ];

  return (
    <section className="py-24 md:py-28" style={{ background: 'var(--site-bg-card)' }}>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-14">
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 44px)', color: 'var(--site-text-primary)', marginBottom: '16px' }}>
            Guest Stories
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '16px', color: 'var(--site-text-muted)', maxWidth: '500px', margin: '0 auto' }}>
            Renewal, learning, and connection — in their own words.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayTestimonials.map((story, index) => (
            <div
              key={story.id}
              className="rounded-2xl p-8 transition-all hover:scale-[1.02]"
              style={{ background: 'var(--site-bg-primary)', border: '1px solid var(--site-border)', boxShadow: 'var(--site-shadow-card)' }}
            >
              <div className="flex items-center gap-0.5 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4" style={{ fill: 'var(--site-gold)', color: 'var(--site-gold)' }} />
                ))}
              </div>

              <p className="mb-6" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontStyle: 'italic', fontSize: '15px', color: 'var(--site-text-primary)', lineHeight: 1.8 }}>
                "{story.quote}"
              </p>

              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10" style={{ border: '2px solid var(--site-gold)' }}>
                  <AvatarImage src={avatarImages[index % avatarImages.length]} alt={story.author_name} className="object-cover" />
                  <AvatarFallback style={{ background: 'var(--site-gold)', color: 'var(--site-green-dark)', fontSize: '14px', fontWeight: 700 }}>
                    {story.author_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '16px', color: 'var(--site-text-primary)' }}>
                    {story.author_name}
                  </div>
                  {story.author_title && (
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '13px', color: 'var(--site-gold)' }}>
                      {story.author_title}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
