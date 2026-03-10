import { MessageSquare, FileText, Package, Truck } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Tell Us Your Needs",
    description: "Brief consultation to understand your product requirements and volume.",
    icon: MessageSquare,
  },
  {
    step: 2,
    title: "Receive Custom Quote",
    description: "Tailored pricing and availability built around your specific volume.",
    icon: FileText,
  },
  {
    step: 3,
    title: "Sample Approval",
    description: "100g samples with full documentation. Evaluate before you commit.",
    icon: Package,
  },
  {
    step: 4,
    title: "Direct Delivery",
    description: "Miami warehouse or farm-direct shipping to your door.",
    icon: Truck,
  },
];

export const SourcingProcess = () => {
  return (
    <section className="py-24 md:py-28" style={{ background: "var(--site-bg-primary)", fontFamily: "'Jost', sans-serif" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p
            className="mb-3"
            style={{ fontSize: "12px", fontWeight: 400, color: "var(--site-gold)", textTransform: "uppercase", letterSpacing: "0.15em" }}
          >
            How It Works
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 44px)", color: "var(--site-text-primary)" }}>
            From First Call to First Delivery
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-px" style={{ background: "var(--site-gold)", opacity: 0.3 }} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                {/* Step number */}
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center mb-6 relative z-10"
                  style={{ background: "var(--site-bg-card)", border: "2px solid var(--site-gold)", boxShadow: "var(--site-shadow-card)" }}
                >
                  <item.icon className="w-10 h-10" style={{ color: "var(--site-gold)" }} />
                </div>

                <span
                  className="mb-2"
                  style={{ fontSize: "12px", fontWeight: 500, color: "var(--site-gold)", textTransform: "uppercase", letterSpacing: "0.15em" }}
                >
                  Step {item.step}
                </span>

                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "22px", color: "var(--site-text-primary)", marginBottom: "8px" }}>
                  {item.title}
                </h3>
                <p style={{ fontWeight: 300, fontSize: "14px", color: "var(--site-text-muted)", lineHeight: 1.7 }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
