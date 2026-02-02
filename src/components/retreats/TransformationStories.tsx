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

// Placeholder avatar images for testimonials
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

  // Fallback testimonials if none in DB
  const displayTestimonials = testimonials.length > 0 ? testimonials : [
    {
      id: "1",
      quote: "After years of trying everything, Mt. Kailash gave me clarity and a system I could finally trust.",
      author_name: "Aisha",
      author_title: "Toronto",
      condition_addressed: null,
      results: null,
    },
    {
      id: "2", 
      quote: "The transformation was deeper than I expected. I left feeling truly renewed from the inside out.",
      author_name: "Marcus",
      author_title: "New York",
      condition_addressed: null,
      results: null,
    },
    {
      id: "3",
      quote: "Priest Kailash's approach is unlike anything else. Traditional wisdom with real, measurable results.",
      author_name: "Sophia",
      author_title: "London",
      condition_addressed: null,
      results: null,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Real Transformations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stories from guests who experienced lasting change.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayTestimonials.map((story, index) => (
            <div
              key={story.id}
              className="bg-card rounded-2xl border border-border p-8 transition-all hover:shadow-lg"
            >
              {/* Circular photo avatar */}
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-16 h-16 border-2 border-primary/20">
                  <AvatarImage 
                    src={avatarImages[index % avatarImages.length]} 
                    alt={story.author_name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-xl font-bold text-primary">
                    {story.author_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-foreground">
                    {story.author_name}
                  </div>
                  {story.author_title && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {story.author_title}
                    </div>
                  )}
                  {/* Bright 5-star rating */}
                  <div className="flex items-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-4 h-4 fill-amber-400 text-amber-400" 
                      />
                    ))}
                  </div>
                </div>
              </div>

              <Quote className="w-8 h-8 text-primary/30 mb-4" />

              <p className="text-foreground leading-relaxed italic">
                "{story.quote}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}