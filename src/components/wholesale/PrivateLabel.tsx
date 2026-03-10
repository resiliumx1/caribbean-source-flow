import { ArrowRight, CheckCircle2 } from "lucide-react";
import labProcessing from "@/assets/lab-processing.png";

interface PrivateLabelProps {
  onScrollToForm: () => void;
}

const features = [
  "Custom blends from 50 units",
  "White-label ready packaging",
  "Full regulatory support",
  "MOQ flexibility for growing brands",
];

export const PrivateLabel = ({ onScrollToForm }: PrivateLabelProps) => {
  return (
    <section className="py-24 md:py-28" style={{ background: "var(--site-bg-primary)", fontFamily: "'Jost', sans-serif" }}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
            <img
              src={labProcessing}
              alt="Processing facility for custom formulations"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,40,30,0.5) 0%, transparent 50%)" }} />
          </div>

          {/* Content */}
          <div>
            <p
              className="mb-3"
              style={{ fontSize: "12px", fontWeight: 400, color: "var(--site-gold)", textTransform: "uppercase", letterSpacing: "0.15em" }}
            >
              Private Label & Custom Manufacturing
            </p>
            <h2
              className="mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 40px)", color: "var(--site-text-primary)", lineHeight: 1.15 }}
            >
              Your Formulations,{" "}
              <span style={{ color: "var(--site-gold)" }}>Our Infrastructure</span>
            </h2>
            <p className="mb-8" style={{ fontWeight: 300, fontSize: "16px", color: "var(--site-text-muted)", lineHeight: 1.7 }}>
              Leverage our certified St. Lucian processing facility and 21 years
              of formulation expertise to bring your vision to market.
            </p>

            <ul className="space-y-4 mb-10">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "var(--site-gold)" }} />
                  <span style={{ fontWeight: 400, fontSize: "16px", color: "var(--site-text-primary)" }}>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={onScrollToForm}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full transition-all hover:brightness-110 hover:scale-[1.02]"
              style={{ background: "var(--site-gold)", color: "#0F281E", fontWeight: 600, fontSize: "16px" }}
            >
              Discuss Custom Manufacturing
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
