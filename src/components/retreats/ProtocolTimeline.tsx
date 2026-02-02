import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ClipboardCheck, Leaf, Utensils, Heart, Package, Flower2 } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Assess",
    description: "Personalized intake and consultation to understand your body, lifestyle, and goals.",
  },
  {
    icon: Leaf,
    title: "Cleanse",
    description: "Targeted herbal detox protocols using natural formulations designed for cellular support.",
  },
  {
    icon: Utensils,
    title: "Nourish",
    description: "Plant-based meals and formulations grown in volcanic soil to replenish minerals and energy.",
  },
  {
    icon: Heart,
    title: "Integrate",
    description: "Breathwork, bush walks, stillness, and guided practices to lock in results.",
  },
  {
    icon: Package,
    title: "Sustain",
    description: "Post-experience support, follow-up consultation, and ongoing formulation access.",
  },
];

export function ProtocolTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 60%"],
  });

  // Vine path draw animation based on scroll
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={containerRef} className="py-20 md:py-28 bg-muted/30 overflow-hidden">
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

        {/* Magical Vine Timeline */}
        <div className="relative">
          {/* SVG Flowing Vine Connector - Desktop */}
          <svg
            className="hidden md:block absolute top-1/2 left-0 w-full h-32 -translate-y-1/2 z-0"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            style={{ overflow: "visible" }}
          >
            {/* Main vine path - organic wavy line */}
            <motion.path
              d="M0,60 C100,30 150,90 240,60 C330,30 380,90 480,60 C570,30 620,90 720,60 C810,30 860,90 960,60 C1050,30 1100,90 1200,60"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ pathLength }}
              opacity={0.6}
            />
            {/* Secondary thinner vine */}
            <motion.path
              d="M0,60 C80,45 170,75 240,60 C310,45 400,75 480,60 C550,45 640,75 720,60 C790,45 880,75 960,60 C1030,45 1120,75 1200,60"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{ pathLength }}
              opacity={0.3}
            />
            
            {/* Small decorative leaves along the vine */}
            {[120, 360, 600, 840, 1080].map((x, i) => (
              <motion.g
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.4 }}
              >
                <path
                  d={`M${x},55 Q${x + 8},45 ${x + 4},38 Q${x - 4},42 ${x},55`}
                  fill="hsl(var(--primary))"
                  opacity={0.4}
                />
                <path
                  d={`M${x},65 Q${x - 8},75 ${x - 4},82 Q${x + 4},78 ${x},65`}
                  fill="hsl(var(--primary))"
                  opacity={0.3}
                />
              </motion.g>
            ))}
          </svg>

          {/* Mobile vertical vine */}
          <svg
            className="md:hidden absolute left-8 top-0 w-8 h-full z-0"
            viewBox="0 0 32 800"
            preserveAspectRatio="none"
            style={{ overflow: "visible" }}
          >
            <motion.path
              d="M16,0 C8,50 24,100 16,150 C8,200 24,250 16,300 C8,350 24,400 16,450 C8,500 24,550 16,600 C8,650 24,700 16,750 C8,800 24,850 16,900"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pathLength }}
              opacity={0.5}
            />
          </svg>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-4 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  className="relative flex flex-col items-center md:items-center text-center group pl-16 md:pl-0"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  {/* Blossom node - appears at milestone */}
                  <motion.div
                    className="absolute -top-3 md:top-auto md:-translate-y-16 left-4 md:left-1/2 md:-translate-x-1/2"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.15, duration: 0.5, type: "spring" }}
                  >
                    <Flower2 className="w-5 h-5 text-accent" />
                  </motion.div>

                  {/* Main Icon Circle with glow effect on hover */}
                  <motion.div
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center mb-6 relative shadow-lg cursor-pointer group-hover:border-primary transition-all duration-300"
                    whileHover={{ 
                      scale: 1.08, 
                      boxShadow: "0 0 30px rgba(31, 58, 46, 0.25)",
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Soft glow ring on hover */}
                    <div className="absolute inset-0 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm scale-110" />
                    
                    <Icon className="w-8 h-8 md:w-10 md:h-10 text-primary relative z-10" />
                    
                    {/* Pulsing ring animation */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary/20"
                      initial={{ scale: 1, opacity: 0 }}
                      whileHover={{ scale: 1.3, opacity: [0, 0.5, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  </motion.div>

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
