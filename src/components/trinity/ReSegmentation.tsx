import { Link } from "react-router-dom";
import { Building2, ShoppingBag, Mountain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const paths = [
  {
    icon: Building2,
    title: "For Practitioners & Retailers",
    description:
      "Access wholesale pricing with graduate volume discounts. Full COA documentation, bulk packaging, and dedicated account support for your dispensary or practice.",
    features: [
      "10-25% volume discounts",
      "COA documentation included",
      "Miami warehouse fulfillment",
      "Private labeling available",
    ],
    cta: "Access Wholesale Portal",
    route: "/wholesale",
  },
  {
    icon: ShoppingBag,
    title: "For Wellness Seekers",
    description:
      "Shop our full catalog of liquid tinctures, capsules, powders, and traditional teas. Each formulation crafted with natural herbs from St. Lucia's volcanic soil.",
    features: [
      "Ships in 3 business days",
      "Local St. Lucia delivery",
      "Edu-commerce product pages",
      "WhatsApp consultation",
    ],
    cta: "Browse Remedies",
    route: "/shop",
  },
  {
    icon: Mountain,
    title: "For Transformation Seekers",
    description:
      "Experience medically-informed cellular detox at our rainforest centre. Group immersions or personalized solo retreats guided by Master Herbalist Priest Kailash.",
    features: [
      "7-day group immersions",
      "3-14 day solo retreats",
      "Pre-arrival protocols",
      "Post-retreat formulations",
    ],
    cta: "Check Availability",
    route: "/retreats",
  },
];

export function ReSegmentation() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="section-header mb-4">Choose Your Path</h2>
          <p className="section-subheader mx-auto">
            Three distinct journeys, one mission: restoring cellular wellness
            through traditional St. Lucian bush medicine.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {paths.map((path, index) => {
            const Icon = path.icon;
            return (
              <div
                key={path.route}
                className="group bg-card rounded-2xl border border-border p-8 transition-all duration-300 hover:border-accent hover:shadow-lg animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
                  <Icon className="w-7 h-7 text-accent group-hover:text-accent-foreground transition-colors" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {path.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {path.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-8">
                  {path.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link to={path.route}>
                  <Button className="w-full group/btn">
                    {path.cta}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
