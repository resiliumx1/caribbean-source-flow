import { FileCheck, Shield, Award, Globe, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const trustBadges = [
  { icon: FileCheck, label: "FDA-Registered Facility" },
  { icon: Shield, label: "cGMP Compliant" },
  { icon: Award, label: "Organic Certified" },
  { icon: Globe, label: "US & UK Export Ready" },
];

interface ComplianceTrustProps {
  onScrollToForm: () => void;
}

export const ComplianceTrust = ({ onScrollToForm }: ComplianceTrustProps) => {
  return (
    <section className="py-20 md:py-28 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
              Documentation That Satisfies US & UK Customs
            </h2>
            <p className="text-lg text-primary-foreground/80">
              Every shipment includes batch-level COAs, origin certificates, 
              and FDA-compliant labeling. No surprises at the border.
            </p>
          </div>
          
          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {trustBadges.map((badge) => (
              <div 
                key={badge.label} 
                className="flex flex-col items-center gap-3 p-6 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-colors"
              >
                <badge.icon className="w-8 h-8 text-accent" />
                <span className="text-sm font-medium text-center">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
          
          {/* Download CTA */}
          <div className="bg-primary-foreground/10 rounded-2xl p-8 border border-primary-foreground/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                  <Download className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    Caribbean Import Compliance Checklist
                  </h3>
                  <p className="text-primary-foreground/70 text-sm">
                    Free PDF guide to navigating US & UK botanical imports
                  </p>
                </div>
              </div>
              <Button 
                variant="hero" 
                size="lg"
                onClick={onScrollToForm}
              >
                Download Free Guide
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
