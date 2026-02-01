import { Link } from "react-router-dom";
import { Building2, ShoppingBag, Mountain, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface TrinityDoor {
  icon: React.ReactNode;
  title: string;
  subtext: string;
  cta: string;
  route: string;
  urgency?: string;
}

export function TrinityHero() {
  // Fetch next available group retreat for urgency display
  const { data: nextRetreat } = useQuery({
    queryKey: ["next-group-retreat"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("retreat_dates")
        .select(`
          *,
          retreat_types!inner(slug, name, type)
        `)
        .eq("retreat_types.type", "group")
        .eq("is_published", true)
        .gte("start_date", new Date().toISOString().split("T")[0])
        .order("start_date", { ascending: true })
        .limit(1)
        .single();

      if (error) return null;
      return data;
    },
  });

  const spotsLeft = nextRetreat
    ? nextRetreat.spots_total - nextRetreat.spots_booked
    : null;

  const doors: TrinityDoor[] = [
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "Supply Your Dispensary",
      subtext: "Wildcrafted bulk herbs, graduate pricing, COA documentation",
      cta: "Access Wholesale",
      route: "/wholesale",
    },
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: "Shop The Formulations",
      subtext: "Immune tonics, detox blends, vitality elixirs. Ships in 3 days",
      cta: "Browse Remedies",
      route: "/shop",
    },
    {
      icon: <Mountain className="w-8 h-8" />,
      title: "Begin Your Transformation",
      subtext: "7-day cellular detox immersions. Limited availability",
      cta: "Check Availability",
      route: "/retreats",
      urgency:
        nextRetreat && spotsLeft !== null
          ? `Next Group: ${format(new Date(nextRetreat.start_date), "MMM d")} – ${spotsLeft} Spot${spotsLeft !== 1 ? "s" : ""} Left`
          : undefined,
    },
  ];

  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Background Video with Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/60 to-foreground/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-4 py-20 md:py-32">
        <div className="container mx-auto max-w-6xl">
          {/* Headlines */}
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <h1 className="hero-title text-background mb-6">
              Medicine from the Volcanic Soil of St. Lucia
            </h1>
            <p className="hero-subtitle text-background/90 max-w-3xl mx-auto">
              Hand-harvested by bush medicine practitioners, naturally fermented
              for cellular bioavailability
            </p>
          </div>

          {/* Three Doors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {doors.map((door, index) => (
              <Link
                key={door.route}
                to={door.route}
                className="group relative overflow-hidden rounded-2xl bg-background/10 backdrop-blur-md border-2 border-background/20 p-6 md:p-8 transition-all duration-300 hover:bg-background/20 hover:border-accent hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 text-accent mb-6 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  {door.icon}
                </div>

                {/* Content */}
                <h2 className="text-2xl font-bold text-background mb-3">
                  {door.title}
                </h2>
                <p className="text-background/80 mb-6 text-sm leading-relaxed">
                  {door.subtext}
                </p>

                {/* Urgency Badge */}
                {door.urgency && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/90 text-accent-foreground text-xs font-semibold mb-4">
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    {door.urgency}
                  </div>
                )}

                {/* CTA */}
                <div className="flex items-center gap-2 text-accent font-semibold group-hover:gap-3 transition-all">
                  {door.cta}
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="relative z-10 bg-secondary/95 backdrop-blur-sm py-4 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-secondary-foreground/90">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              21+ Years Clinical Practice
            </span>
            <span className="hidden md:inline text-secondary-foreground/40">|</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              FDA-Registered Facility
            </span>
            <span className="hidden md:inline text-secondary-foreground/40">|</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Featured by St. Lucia Tourism Authority
            </span>
            <span className="hidden md:inline text-secondary-foreground/40">|</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Miami Warehouse (3-Day US)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
