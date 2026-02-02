import { useState } from "react";
import { Waves, Leaf, FlaskConical, Coffee, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColorClass: string;
  iconBgClass: string;
  products: string[];
}

const productCategories: ProductCategory[] = [
  {
    id: "ocean",
    title: "Ocean Botanicals",
    description: "Premium sea moss and ocean-derived healing minerals",
    icon: Waves,
    iconColorClass: "text-primary",
    iconBgClass: "bg-primary/10",
    products: [
      "Golden Seamoss",
      "Sea Capsules",
      "Seamoss Full Spectrum",
      "Bladderwrack (Whole & Powder)",
      "Handcrafted Seamoss Soaps",
    ],
  },
  {
    id: "bush",
    title: "Traditional Bush Medicine",
    description: "Authentic Caribbean healing herbs wildcrafted from St. Lucia",
    icon: Leaf,
    iconColorClass: "text-primary",
    iconBgClass: "bg-primary/10",
    products: [
      "Soursop Leaves",
      "Gully Root (Anamu) - Roots & Leaves",
      "St. John's Bush (Justicia secunda)",
      "Blue Vervaine",
      "Cassia Alata (King of the Forest)",
      "Carpenter Bush",
    ],
  },
  {
    id: "clinical",
    title: "Clinical Formulations",
    description: "Professionally formulated herbal compounds for targeted support",
    icon: FlaskConical,
    iconColorClass: "text-muted-foreground",
    iconBgClass: "bg-muted",
    products: [
      "The Answer (Immune Booster)",
      "Prosperity (Men's Vitality)",
      "Fertility (Women's Balance)",
      "Dewormer",
      "Pure Green",
      "Nerve Tonic",
    ],
  },
  {
    id: "teas",
    title: "Single Herbs & Teas",
    description: "Curated herbal blends for daily wellness rituals",
    icon: Coffee,
    iconColorClass: "text-accent",
    iconBgClass: "bg-accent/10",
    products: [
      "Red Raspberry Leaf",
      "Patchouli",
      "Bay Leaf (Whole & Powder)",
      "Medina Tea",
      "Moon Cycle Tea",
      "Virili-Tea",
      "Digestive Rescue Tea",
      "Urinary Cleanse Tea",
      "Restful Tea",
    ],
  },
];

interface ProductGridProps {
  onScrollToForm: () => void;
}

export const ProductGrid = ({ onScrollToForm }: ProductGridProps) => {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">
            Our <span className="text-gradient-gold">Product Catalog</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Authentic St. Lucian botanicals, naturally harvested and processed with care. 
            Custom pricing based on your volume requirements.
          </p>
        </div>
        
        {/* 3-Column Grid on Desktop */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {productCategories.map((category) => (
            <div 
              key={category.id} 
              className="bg-card rounded-xl border border-border p-6 transition-all duration-300 hover:shadow-soft hover:border-primary/20 group"
            >
              {/* Icon + Title Row */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl ${category.iconBgClass} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}>
                  <category.icon className={`w-6 h-6 ${category.iconColorClass}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground font-serif leading-tight">
                    {category.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </div>
              
              {/* Product List */}
              <ul className="space-y-2 mb-4">
                {category.products.slice(0, 6).map((product) => (
                  <li 
                    key={product}
                    className="flex items-center gap-2 py-1.5 px-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group/item"
                    onMouseEnter={() => setHoveredProduct(product)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                    <span className="text-sm text-foreground group-hover/item:text-primary transition-colors">
                      {product}
                    </span>
                  </li>
                ))}
                {category.products.length > 6 && (
                  <li className="text-sm text-muted-foreground italic pl-4">
                    + {category.products.length - 6} more products
                  </li>
                )}
              </ul>

              {/* Request Link */}
              <button 
                onClick={onScrollToForm}
                className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 group/link"
              >
                Request Price List
                <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
              </button>
            </div>
          ))}
        </div>
        
        {/* CTA */}
        <div className="text-center">
          <Button 
            variant="submit" 
            size="xl" 
            onClick={onScrollToForm}
            className="group gap-2"
          >
            Request Custom Pricing & Availability
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No pricing displayed. All quotes customized for your volume.
          </p>
        </div>
      </div>
    </section>
  );
};
