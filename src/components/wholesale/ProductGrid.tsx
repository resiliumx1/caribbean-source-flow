import { Waves, Leaf, FlaskConical, Coffee, ArrowRight } from "lucide-react";

const productCategories = [
  {
    id: "ocean",
    title: "Ocean Botanicals",
    description: "Premium sea moss and ocean-derived healing minerals",
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
    description: "Authentic Caribbean healing herbs wildcrafted from St. Lucia",
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
    description: "Professionally formulated herbal compounds for targeted support",
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
    description: "Curated herbal blends for daily wellness rituals",
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
  return (
    <section className="py-24 md:py-28" style={{ background: "#0a0a0a", fontFamily: "'Jost', sans-serif" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 
            className="mb-4" 
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontStyle: "italic", fontSize: "clamp(2rem, 4vw, 48px)", color: "#f2ead8" }}
          >
            Caribbean Botanicals, Sourced at Origin
          </h2>
          <p className="max-w-2xl mx-auto leading-relaxed" style={{ color: "#8a8070", fontWeight: 300, fontSize: "16px" }}>
            Single-origin St. Lucian herbs, naturally harvested and processed with full documentation for every batch.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {productCategories.map((category, i) => (
            <div 
              key={category.id} 
              className="rounded-2xl p-9 transition-all duration-300 hover:scale-[1.02]"
              style={{ 
                background: "#111111", 
                border: "1px solid rgba(201,168,76,0.15)",
                animationDelay: `${i * 100}ms`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.15)")}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(201,168,76,0.1)" }}>
                <category.icon className="w-8 h-8" style={{ color: "#c9a84c" }} />
              </div>
              
              {/* Title */}
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "24px", color: "#f2ead8", marginBottom: "4px" }}>
                {category.title}
              </h3>
              <p style={{ fontWeight: 300, fontSize: "14px", color: "#c9a84c", fontStyle: "italic", marginBottom: "16px" }}>
                {category.description}
              </p>
              
              {/* Divider */}
              <div style={{ height: "1px", background: "rgba(201,168,76,0.2)", marginBottom: "16px" }} />
              
              {/* Product List */}
              <ul className="space-y-2 mb-6">
                {category.products.map((product) => (
                  <li key={product} className="flex items-start gap-2" style={{ fontSize: "14px", color: "#f2ead8", fontWeight: 300 }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: "#c9a84c" }} />
                    {product}
                  </li>
                ))}
              </ul>

              {/* Request Link */}
              <button 
                onClick={onScrollToForm}
                className="flex items-center gap-1 transition-colors hover:underline group"
                style={{ color: "#c9a84c", fontWeight: 400, fontSize: "14px" }}
              >
                Request Pricing
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ))}
        </div>
        
        {/* CTA */}
        <div className="text-center">
          <button 
            onClick={onScrollToForm}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full transition-all hover:brightness-110 hover:scale-[1.02]"
            style={{ background: "#c9a84c", color: "#090909", fontWeight: 500, fontSize: "16px" }}
          >
            Request Custom Pricing & Availability
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="mt-4" style={{ color: "#8a8070", fontSize: "14px", fontWeight: 300 }}>
            No pricing displayed. All quotes customized for your volume.
          </p>
        </div>
      </div>
    </section>
  );
};
