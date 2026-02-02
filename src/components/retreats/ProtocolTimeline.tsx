import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ClipboardCheck, Leaf, Utensils, Heart, Package, Flower2, Sparkles } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Assess",
    description: "Personalized intake and consultation to understand your body, lifestyle, and goals.",
    color: "#4A9D6B", // Vibrant healing green
    glowColor: "rgba(74, 157, 107, 0.4)",
  },
  {
    icon: Leaf,
    title: "Cleanse",
    description: "Targeted herbal detox protocols using natural formulations designed for cellular support.",
    color: "#2E8B57", // Sea green
    glowColor: "rgba(46, 139, 87, 0.4)",
  },
  {
    icon: Utensils,
    title: "Nourish",
    description: "Plant-based meals and formulations grown in volcanic soil to replenish minerals and energy.",
    color: "#6B8E23", // Olive drab - earthy nourishing
    glowColor: "rgba(107, 142, 35, 0.4)",
  },
  {
    icon: Heart,
    title: "Integrate",
    description: "Breathwork, bush walks, stillness, and guided practices to lock in results.",
    color: "#8B4A6B", // Muted rose - heart-centered
    glowColor: "rgba(139, 74, 107, 0.4)",
  },
  {
    icon: Package,
    title: "Sustain",
    description: "Post-experience support, follow-up consultation, and ongoing formulation access.",
    color: "#5D7A4A", // Forest sage - sustaining growth
    glowColor: "rgba(93, 122, 74, 0.4)",
  },
];

export function ProtocolTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
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
            className="hidden md:block absolute top-[60px] left-0 w-full h-32 z-0"
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-16 md:gap-4 relative z-10 pt-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;
              return (
                <motion.div
                  key={step.title}
                  className="relative flex flex-col items-center md:items-center text-center group pl-16 md:pl-0 cursor-pointer"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  onMouseEnter={() => setActiveStep(index)}
                  onMouseLeave={() => setActiveStep(null)}
                >
                  {/* Blossom node - appears at milestone */}
                  <motion.div
                    className="absolute -top-6 md:-top-8 left-4 md:left-1/2 md:-translate-x-1/2"
                    initial={{ opacity: 0, scale: 0, rotate: -45 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + index * 0.15, duration: 0.5, type: "spring" }}
                  >
                    <motion.div
                      animate={isActive ? { scale: 1.3, rotate: 15 } : { scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Flower2 
                        className="w-6 h-6 drop-shadow-lg" 
                        style={{ color: step.color }}
                      />
                    </motion.div>
                  </motion.div>

                  {/* Main Icon Circle with colorful glow effect on hover */}
                  <motion.div
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-4 relative shadow-lg cursor-pointer transition-all duration-300"
                    style={{
                      backgroundColor: isActive ? step.color : 'hsl(var(--background))',
                      border: `3px solid ${step.color}`,
                      boxShadow: isActive ? `0 0 30px ${step.glowColor}, 0 0 60px ${step.glowColor}` : `0 4px 20px rgba(0,0,0,0.1)`,
                    }}
                    whileHover={{ 
                      scale: 1.1, 
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Animated sparkle effect on hover */}
                    {isActive && (
                      <motion.div
                        className="absolute -top-2 -right-2"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Sparkles className="w-5 h-5 text-amber-400" />
                      </motion.div>
                    )}
                    
                    <Icon 
                      className="w-9 h-9 md:w-11 md:h-11 relative z-10 transition-colors duration-300" 
                      style={{ color: isActive ? 'white' : step.color }}
                    />
                    
                    {/* Pulsing ring animation */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: `2px solid ${step.color}` }}
                      initial={{ scale: 1, opacity: 0 }}
                      animate={isActive ? { scale: 1.4, opacity: [0, 0.6, 0] } : {}}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  </motion.div>

                  {/* Content - moved lower with more spacing */}
                  <div className="mt-4">
                    <h3 
                      className="text-xl md:text-2xl font-bold mb-3 transition-colors duration-300"
                      style={{ color: step.color }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-[15px] text-foreground font-medium leading-relaxed max-w-[220px]">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
