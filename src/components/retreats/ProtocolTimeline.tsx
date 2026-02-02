import { motion } from "framer-motion";
import { ClipboardCheck, Leaf, Utensils, Heart, Package } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Assess",
    description: "Personalized intake and consultation to understand your body, lifestyle, and goals.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Leaf,
    title: "Cleanse",
    description: "Targeted herbal detox protocols using natural formulations designed for cellular support.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    icon: Utensils,
    title: "Nourish",
    description: "Plant-based meals and formulations grown in volcanic soil to replenish minerals and energy.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    icon: Heart,
    title: "Integrate",
    description: "Breathwork, bush walks, stillness, and guided practices to lock in results.",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
  {
    icon: Package,
    title: "Sustain",
    description: "Post-experience support, follow-up consultation, and ongoing formulation access.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

export function ProtocolTimeline() {
  return (
    <section className="py-20 md:py-28 bg-muted/30 overflow-hidden">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Your Transformation Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A guided path from assessment to lasting vitality—designed to restore balance, not overwhelm the body.
          </p>
        </div>

        {/* Flowing Timeline */}
        <div className="relative">
          {/* Flowing connector line - Desktop */}
          <svg
            className="hidden md:block absolute top-1/2 left-0 w-full h-4 -translate-y-1/2 z-0"
            viewBox="0 0 1200 40"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M0,20 Q150,5 240,20 T480,20 T720,20 T960,20 T1200,20"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="2"
              strokeDasharray="8 4"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </svg>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  className="relative flex flex-col items-center text-center group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  {/* Organic Icon Circle with hover animation */}
                  <motion.div
                    className={`w-20 h-20 md:w-24 md:h-24 rounded-full ${step.bgColor} flex items-center justify-center mb-6 relative bg-background border-2 border-border shadow-lg cursor-pointer`}
                    whileHover={{ 
                      scale: 1.1, 
                      boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                      borderColor: "hsl(var(--primary))"
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className={`w-8 h-8 md:w-10 md:h-10 ${step.color}`} />
                    
                    {/* Subtle pulse ring on hover */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary/30"
                      initial={{ scale: 1, opacity: 0 }}
                      whileHover={{ scale: 1.2, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>

                  {/* Mobile connector */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden absolute left-1/2 -bottom-4 w-0.5 h-8 bg-border -translate-x-1/2" />
                  )}

                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}