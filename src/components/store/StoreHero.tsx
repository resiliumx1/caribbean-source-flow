import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Leaf, FlaskConical, Truck, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store-context";
import heroImage from "@/assets/hero-farm.jpg";

export function StoreHero() {
  const { whatsappNumber } = useStore();

  const whatsappMessage = encodeURIComponent(
    "Hello Goddess Itopia, I'm interested in learning which herbs are right for me."
  );

  return (
    <section className="hero-section relative min-h-[70vh] flex items-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="hero-overlay absolute inset-0" />
      </div>

      {/* Content */}
      <div className="hero-content container mx-auto px-4 relative z-10 py-16">
        <div className="max-w-3xl">
          <h1 className="hero-title text-cream mb-6">
            Medicine from the{" "}
            <span className="text-gradient-gold">Volcanic Soil</span> of St. Lucia
          </h1>

          <p className="hero-subtitle text-cream/90 mb-8 max-w-2xl">
            Hand-harvested by bush medicine practitioners, naturally fermented for 
            potency, and shipped directly from our rainforest facility to your doorstep.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <Button variant="hero" size="xl" asChild>
              <Link to="/shop" className="group">
                Explore the Collection
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button variant="heroSecondary" size="xl" asChild>
              <a
                href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Consult with Our Herbalist
              </a>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 text-cream/80">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-gold" />
              <span className="text-sm font-medium">Wildcrafted</span>
            </div>
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-gold" />
              <span className="text-sm font-medium">Fermented Formulations</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-gold" />
              <span className="text-sm font-medium">21+ Years Tradition</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-gold" />
              <span className="text-sm font-medium">Global Shipping</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
