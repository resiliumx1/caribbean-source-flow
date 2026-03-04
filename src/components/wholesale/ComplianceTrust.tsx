import { FileCheck, Shield, Award, Globe, Download, ArrowRight } from "lucide-react";

const trustBadges = [
  { icon: FileCheck, label: "Certified Processing Facility", desc: "St. Lucian government certified" },
  { icon: Shield, label: "cGMP Compliant", desc: "Current Good Manufacturing Practice" },
  { icon: Award, label: "100% Natural", desc: "No synthetics or additives" },
  { icon: Globe, label: "US & UK Export Ready", desc: "Pre-cleared documentation" },
];

interface ComplianceTrustProps {
  onScrollToForm: () => void;
}

export const ComplianceTrust = ({ onScrollToForm }: ComplianceTrustProps) => {
  return (
    <section className="py-24 md:py-28" style={{ background: "#0d1a0f", fontFamily: "'Jost', sans-serif" }}>
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 44px)", color: "#f2ead8", marginBottom: "16px" }}>
              Documentation That Satisfies US & UK Customs
            </h2>
            <p style={{ fontSize: "16px", color: "#a09888", fontWeight: 300, maxWidth: "640px", margin: "0 auto" }}>
              Every shipment includes batch-level COAs, origin certificates, and export-compliant labeling. No surprises at the border.
            </p>
          </div>
          
          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {trustBadges.map((badge) => (
              <div 
                key={badge.label} 
                className="flex flex-col items-center gap-3 p-6 rounded-xl transition-colors text-center"
                style={{ background: "rgba(242,234,216,0.03)", border: "1px solid rgba(201,168,76,0.15)" }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(201,168,76,0.08)" }}>
                  <badge.icon className="w-10 h-10" style={{ color: "#c9a84c" }} />
                </div>
                <span style={{ fontWeight: 400, fontSize: "15px", color: "#f2ead8" }}>
                  {badge.label}
                </span>
                <span style={{ fontWeight: 300, fontSize: "13px", color: "#8a8070" }}>
                  {badge.desc}
                </span>
              </div>
            ))}
          </div>
          
          {/* Download CTA - Full Width Feature Card */}
          <div 
            className="rounded-2xl p-12 flex flex-col md:flex-row items-center justify-between gap-8"
            style={{ 
              background: "rgba(0,0,0,0.4)", 
              border: "1px solid rgba(201,168,76,0.3)" 
            }}
          >
            <div>
              <span className="inline-block mb-3" style={{ fontWeight: 400, fontSize: "12px", color: "#c9a84c", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                FREE RESOURCE
              </span>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "32px", color: "#f2ead8", marginBottom: "8px" }}>
                Caribbean Import Compliance Checklist
              </h3>
              <p style={{ fontWeight: 300, fontSize: "15px", color: "#a09888", maxWidth: "480px", lineHeight: 1.7 }}>
                Everything US and UK customs requires — COAs, origin certificates, region-compliant labeling. Pre-filled for St. Lucian botanicals.
              </p>
            </div>
            <div className="relative flex-shrink-0">
              {/* Gold glow */}
              <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)", transform: "scale(1.5)" }} />
              <button 
                onClick={onScrollToForm}
                className="relative inline-flex items-center gap-2 px-10 py-4 rounded-full transition-all hover:brightness-110 hover:scale-[1.02]"
                style={{ background: "#c9a84c", color: "#090909", fontWeight: 500, fontSize: "16px" }}
              >
                <Download className="w-5 h-5" />
                Download Free Guide
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
