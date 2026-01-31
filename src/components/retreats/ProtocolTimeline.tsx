import { ClipboardCheck, Leaf, Utensils, Heart, Package } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Assess",
    description: "Pre-arrival questionnaire + Zoom consultation with Priest Kailash",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Leaf,
    title: "Cleanse",
    description: "Cellular detox using wildcrafted herbs (Colax, Blood Detox, Pure Green)",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Utensils,
    title: "Nourish",
    description: "Ital plant-based cuisine grown in volcanic soil",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Heart,
    title: "Integrate",
    description: "Bush walks, meditation, breathwork, and rest",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: Package,
    title: "Sustain",
    description: "30-day post-retreat formulation supply + follow-up consultation",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

export function ProtocolTimeline() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4">
            The Protocol
          </span>
          <h2 className="section-header mb-4">Your Transformation Journey</h2>
          <p className="section-subheader mx-auto">
            A medically-informed, five-phase approach to cellular wellness and
            lasting vitality.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connector Line - Desktop */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-border" />

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="relative flex flex-col items-center text-center animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Icon Circle */}
                  <div
                    className={`w-24 h-24 rounded-full ${step.bgColor} flex items-center justify-center mb-6 relative z-10 bg-background border-4 border-background shadow-lg`}
                  >
                    <Icon className={`w-10 h-10 ${step.color}`} />
                  </div>

                  {/* Step Number */}
                  <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-2 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
