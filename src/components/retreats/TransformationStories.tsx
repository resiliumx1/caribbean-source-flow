import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Quote, TrendingUp } from "lucide-react";

interface Testimonial {
  id: string;
  quote: string;
  author_name: string;
  author_title: string | null;
  condition_addressed: string | null;
  results: string | null;
}

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

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="section-header mb-4">Transformation Stories</h2>
          <p className="section-subheader mx-auto">
            Real guests. Measurable outcomes. Lasting change.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((story, index) => (
            <div
              key={story.id}
              className="bg-card rounded-2xl border border-border p-8 transition-all hover:shadow-lg animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Condition Badge */}
              {story.condition_addressed && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-xs font-medium text-muted-foreground mb-6">
                  <span className="w-2 h-2 rounded-full bg-warning" />
                  {story.condition_addressed}
                </div>
              )}

              <Quote className="w-8 h-8 text-accent/30 mb-4" />

              <p className="text-foreground leading-relaxed mb-6">
                "{story.quote}"
              </p>

              {/* Results */}
              {story.results && (
                <div className="flex items-start gap-3 p-4 bg-success/10 rounded-xl mb-6">
                  <TrendingUp className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-success font-medium">
                    {story.results}
                  </p>
                </div>
              )}

              {/* Author */}
              <div className="border-t border-border pt-4">
                <div className="font-semibold text-foreground">
                  {story.author_name}
                </div>
                {story.author_title && (
                  <div className="text-sm text-muted-foreground">
                    {story.author_title}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
