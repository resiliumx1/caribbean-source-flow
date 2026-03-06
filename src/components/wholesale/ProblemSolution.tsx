import { AlertTriangle, CheckCircle2, ShieldCheck, Clock, Truck } from "lucide-react";
import priestHarvesting from "@/assets/priest-kailash-harvesting.png";
import labProcessing from "@/assets/lab-processing.png";
import warehouseImage from "@/assets/miami-warehouse.jpg";

const solutions = [
  {
    problem: "Inconsistent quality from aggregated suppliers",
    solution: "Single-origin St. Lucian harvesting. Meet the farmer.",
    icon: ShieldCheck,
    image: priestHarvesting,
  },
  {
    problem: "Documentation gaps cause customs delays",
    solution: "Pre-cleared COAs and import docs. FDA-compliant packaging.",
    icon: Clock,
    image: labProcessing,
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
    <section className="py-24 md:py-28" style={{ background: "var(--site-bg-primary)", fontFamily: "'Jost', sans-serif" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 44px)", color: "var(--site-text-primary)", marginBottom: "12px" }}>
            Your Sourcing Challenges, <span style={{ color: "#c9a84c" }}>Solved</span>
          </h2>
          <p style={{ color: "var(--site-text-muted)", fontWeight: 300, fontSize: "16px", maxWidth: "560px", margin: "0 auto" }}>
            We understand the pain of unreliable supply chains. Here's how we're different.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((item, index) => (
            <div 
              key={index} 
              className="rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
              style={{ background: "var(--site-bg-card)", border: "1px solid var(--site-border)", boxShadow: "var(--site-shadow-card)" }}
            >
              <div className="relative h-48 overflow-hidden">
                <img src={item.image} alt={item.solution} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.75) 60%)' }} />
                <item.icon className="absolute bottom-4 right-4" style={{ color: "#c9a84c", width: '52px', height: '52px' }} />
              </div>
              
              <div className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: 400, color: "#c9a84c", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>The Problem</p>
                    <p style={{ color: "var(--site-text-primary)", fontWeight: 400, fontSize: "15px" }}>{item.problem}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#c9a84c" }} />
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: 400, color: "#c9a84c", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Our Solution</p>
                    <p style={{ color: "var(--site-text-primary)", fontWeight: 500, fontSize: "15px" }}>{item.solution}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
