import { Package, MapPin, Headphones } from "lucide-react";

const guarantees = [
  {
    icon: Package,
    title: "Sample Program",
    desc: "Evaluate quality before committing. 100g samples with full COAs.",
  },
  {
    icon: MapPin,
    title: "Origin Guarantee",
    desc: "Every batch traceable to Sulphur Ridge farms in St. Lucia.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    desc: "Miami-based account manager assigned to your business.",
  },
];

export const PartnershipGuarantees = () => {
  return (
    <section className="py-24 md:py-28" style={{ background: "var(--site-bg-primary)", fontFamily: "'Jost', sans-serif" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p
            className="mb-3"
            style={{ fontSize: "12px", fontWeight: 400, color: "var(--site-gold)", textTransform: "uppercase", letterSpacing: "0.15em" }}
          >
            Our Commitment
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 44px)", color: "var(--site-text-primary)" }}>
            Zero-Risk Partnership
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {guarantees.map((g) => (
            <div
              key={g.title}
              className="rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: "var(--site-bg-card)",
                borderTop: "3px solid var(--site-gold)",
                borderLeft: "1px solid var(--site-border)",
                borderRight: "1px solid var(--site-border)",
                borderBottom: "1px solid var(--site-border)",
                boxShadow: "var(--site-shadow-card)",
              }}
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ background: "rgba(188,138,95,0.08)" }}>
                <g.icon className="w-8 h-8" style={{ color: "var(--site-gold)" }} />
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "22px", color: "var(--site-text-primary)", marginBottom: "8px" }}>
                {g.title}
              </h3>
              <p style={{ fontWeight: 300, fontSize: "15px", color: "var(--site-text-muted)", lineHeight: 1.7 }}>
                {g.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
