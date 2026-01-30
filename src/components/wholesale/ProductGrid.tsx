import { useState } from "react";
import { Waves, Leaf, FlaskConical, Coffee, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  products: string[];
}

const productCategories: ProductCategory[] = [
  {
    id: "ocean",
    title: "Ocean Botanicals",
    icon: Waves,
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
    icon: Leaf,
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
    icon: FlaskConical,
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
    icon: Coffee,
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
          <h2 className="section-header">
            Our <span className="text-gradient-gold">Product Catalog</span>
          </h2>
          <p className="section-subheader mx-auto">
            Authentic St. Lucian botanicals, wildcrafted and processed with care. 
            Custom pricing based on your volume requirements.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {productCategories.map((category) => (
            <div key={category.id} className="product-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <category.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground font-serif">
                  {category.title}
                </h3>
              </div>
              
              <ul className="space-y-3">
                {category.products.map((product) => (
                  <li 
                    key={product}
                    className="flex items-center justify-between group cursor-pointer py-2 px-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors"
                    onMouseEnter={() => setHoveredProduct(product)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    <span className="text-foreground group-hover:text-primary transition-colors">
                      {product}
                    </span>
                    <span 
                      className={`text-xs text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}
                    >
                      Request specs
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Button 
            variant="submit" 
            size="xl" 
            onClick={onScrollToForm}
            className="group"
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
