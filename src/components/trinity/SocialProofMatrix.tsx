import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2, ShoppingBag, Mountain, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  audience: "b2b" | "b2c" | "retreat";
  quote: string;
  author_name: string;
  author_title: string | null;
  condition_addressed: string | null;
  results: string | null;
}

const audienceConfig = {
  b2b: {
    icon: Building2,
    label: "Practitioners",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  b2c: {
    icon: ShoppingBag,
    label: "Customers",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  retreat: {
    icon: Mountain,
    label: "Retreat Guests",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
};

export function SocialProofMatrix() {
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

  // Group testimonials by audience
  const groupedTestimonials = {
    b2b: testimonials.filter((t) => t.audience === "b2b"),
    b2c: testimonials.filter((t) => t.audience === "b2c"),
    retreat: testimonials.filter((t) => t.audience === "retreat"),
  };

  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="section-header mb-4">Trusted By Those Who Know</h2>
          <p className="section-subheader mx-auto">
            From naturopathic physicians to wellness seekers, our formulations
            speak for themselves.
          </p>
        </div>

        {/* Three Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(["b2b", "b2c", "retreat"] as const).map((audience) => {
            const config = audienceConfig[audience];
            const Icon = config.icon;
            const audienceTestimonials = groupedTestimonials[audience];

            return (
              <div key={audience} className="space-y-6">
                {/* Column Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <span className="font-semibold text-foreground">
                    {config.label}
                  </span>
                </div>

                {/* Testimonial Cards */}
                {audienceTestimonials.slice(0, 2).map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-background rounded-xl p-6 shadow-sm border border-border"
                  >
                    <Quote className="w-8 h-8 text-accent/30 mb-4" />
                    <p className="text-foreground leading-relaxed mb-4">
                      "{testimonial.quote}"
                    </p>
                    <div className="border-t border-border pt-4">
                      <div className="font-semibold text-foreground">
                        {testimonial.author_name}
                      </div>
                      {testimonial.author_title && (
                        <div className="text-sm text-muted-foreground">
                          {testimonial.author_title}
                        </div>
                      )}
                      {testimonial.results && (
                        <div className="mt-2 text-sm text-success font-medium">
                          ✓ {testimonial.results}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
