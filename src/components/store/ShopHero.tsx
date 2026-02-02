import { Leaf, CheckCircle, MapPin, Heart } from "lucide-react";

const trustBadges = [
  { icon: Leaf, label: "100% Natural" },
  { icon: Heart, label: "Vegan" },
  { icon: CheckCircle, label: "Non-GMO" },
  { icon: MapPin, label: "Made in St. Lucia" },
];

export function ShopHero() {
  return (
    <section className="relative h-[400px] md:h-[480px] overflow-hidden pt-16">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2400"
          alt="St. Lucian rainforest"
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay - works in both modes */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      {/* Content - using explicit light colors for text on dark overlay */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4 max-w-3xl">
          Premium Herbal Formulations for Daily Balance
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-4">
          100% natural, vegan, non-GMO remedies made in Saint Lucia using traditional bush medicine and mineral-rich volcanic soil.
        </p>
        <p className="text-sm text-white/70 mb-8">
          Crafted for consistency • Designed for integration • Rooted in tradition
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-3">
          {trustBadges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/95 dark:bg-card/95 rounded-full text-sm font-medium text-foreground shadow-sm"
            >
              <badge.icon className="w-4 h-4 text-primary" />
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}