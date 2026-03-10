import { Waves, Leaf, FlaskConical, Coffee, ArrowRight } from "lucide-react";
import seamossImage from "@/assets/seamoss-harvest.jpg";
import herbProcessing from "@/assets/herb-processing.jpg";
import labProcessing from "@/assets/lab-processing.png";
import priestHarvesting from "@/assets/priest-kailash-harvesting.png";

const productCategories = [
  {
    id: "ocean",
    title: "Ocean Botanicals",
    icon: Waves,
    image: seamossImage,
    specs: ["Golden Seamoss & Bladderwrack", "Full Spectrum Sea Capsules", "Handcrafted Seamoss Soaps"],
  },
  {
    id: "bush",
    title: "Traditional Bush Medicine",
    icon: Leaf,
    image: priestHarvesting,
    specs: ["Soursop Leaves (Whole & Powder)", "Guinea Hen Weed (Anamu)", "Gully Root, Blue Vervaine, Cassia"],
  },
  {
    id: "clinical",
    title: "Clinical Formulations",
    icon: FlaskConical,
    image: labProcessing,
    specs: ["The Answer (Immune Protocol)", "Prosperity (Men's Vitality)", "Fertility, Dewormer, Nerve Tonic"],
  },
  {
    id: "teas",
    title: "Single Herbs & Teas",
    icon: Coffee,
    image: herbProcessing,
    specs: ["Vervine & Bitter Melon", "Red Raspberry Leaf, Patchouli", "Curated Wellness Tea Blends"],
  },
];

interface ProductGridProps {
  onScrollToForm: () => void;
}

export const ProductGrid = ({ onScrollToForm }: ProductGridProps) => {
  return (
    <section className="py-24 md:py-28" style={{ background: "#0F281E", fontFamily: "'Jost', sans-serif" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p
            className="mb-3"
            style={{ fontSize: "12px", fontWeight: 400, color: "var(--site-gold)", textTransform: "uppercase", letterSpacing: "0.15em" }}
          >
            Product Categories
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 44px)", color: "#F5F1E8" }}>
            Caribbean Botanicals, Sourced at Origin
          </h2>
          <p className="mt-3" style={{ color: "#A8B5A0", fontWeight: 300, fontSize: "16px", maxWidth: "560px", margin: "12px auto 0" }}>
            Single-origin St. Lucian herbs, naturally harvested with full documentation for every batch.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {productCategories.map((category) => (
            <div 
              key={category.id} 
              className="rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] group"
              style={{ background: "#1B4332", border: "1px solid #2D6A4F" }}
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ filter: "brightness(1.1)" }}
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(27,67,50,0.9) 100%)" }} />
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  <category.icon className="w-5 h-5" style={{ color: "var(--site-gold)" }} />
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "20px", color: "#F5F1E8" }}>
                    {category.title}
                  </h3>
                </div>
              </div>
              
              <div className="p-5">
                <ul className="space-y-2.5 mb-5">
                  {category.specs.map((spec) => (
                    <li key={spec} className="flex items-start gap-2" style={{ fontSize: "14px", color: "#F5F1E8", fontWeight: 300 }}>
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--site-gold)" }} />
                      {spec}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={onScrollToForm}
                  className="flex items-center gap-1 transition-colors hover:underline group/link w-full"
                  style={{ color: "var(--site-gold)", fontWeight: 500, fontSize: "14px" }}
                >
                  Request Specs
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
