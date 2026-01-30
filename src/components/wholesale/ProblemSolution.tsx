import { AlertTriangle, CheckCircle2, ShieldCheck, Clock, Truck } from "lucide-react";
import seamossImage from "@/assets/seamoss-harvest.jpg";
import herbImage from "@/assets/herb-processing.jpg";
import warehouseImage from "@/assets/miami-warehouse.jpg";

const solutions = [
  {
    problem: "Inconsistent quality from aggregated suppliers",
    solution: "Single-origin St. Lucian harvesting. Meet the farmer.",
    icon: ShieldCheck,
    image: seamossImage,
  },
  {
    problem: "Documentation gaps cause customs delays",
    solution: "Pre-cleared COAs and import docs. FDA-compliant packaging.",
    icon: Clock,
    image: herbImage,
  },
  {
    problem: "Unpredictable 6-8 week lead times",
    solution: "Miami warehouse stock. 3-day US delivery available.",
    icon: Truck,
    image: warehouseImage,
  },
];

export const ProblemSolution = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="section-header">
            Your Sourcing Challenges, <span className="text-gradient-gold">Solved</span>
          </h2>
          <p className="section-subheader mx-auto">
            We understand the pain of unreliable Caribbean supply chains. Here's how we're different.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((item, index) => (
            <div 
              key={index} 
              className="solution-card group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.solution}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <item.icon className="absolute bottom-4 right-4 w-8 h-8 text-cream" />
              </div>
              
              {/* Problem */}
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    The Problem
                  </p>
                  <p className="text-foreground font-medium">
                    {item.problem}
                  </p>
                </div>
              </div>
              
              {/* Solution */}
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Our Solution
                  </p>
                  <p className="text-foreground font-semibold">
                    {item.solution}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
