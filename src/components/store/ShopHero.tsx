import { Leaf, CheckCircle, MapPin, Sparkles } from "lucide-react";

const trustBadges = [
  { icon: Sparkles, label: "100% Natural" },
  { icon: Leaf, label: "Vegan" },
  { icon: CheckCircle, label: "Non-GMO" },
  { icon: MapPin, label: "Made in St. Lucia" },
];

export function ShopHero() {
  return (
    <section className="relative h-[400px] md:h-[480px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2400"
          alt="St. Lucian rainforest"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/70 via-forest/50 to-forest/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
        <h1 className="hero-title text-cream mb-4">
          Premium Herbal <span className="text-gradient-gold">Products</span>
        </h1>
        <p className="hero-subtitle text-cream/90 max-w-2xl mb-8">
          Wildcrafted from Mount Kailash and the surrounding Saint Lucian rainforest.
          <br />
          100% natural, vegan formulations for optimal health.
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-3">
          {trustBadges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 px-4 py-2.5 bg-cream/95 rounded-full text-sm font-medium text-forest shadow-soft"
            >
              <badge.icon className="w-4 h-4 text-gold" />
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
