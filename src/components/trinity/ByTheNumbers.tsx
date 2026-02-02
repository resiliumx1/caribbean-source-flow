import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Leaf, Users, GraduationCap, Truck, Calendar } from "lucide-react";

interface Stat {
  value: number;
  suffix: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

const stats: Stat[] = [
  { value: 43000, suffix: "+", label: "Bottles formulated annually", icon: Leaf, color: "hsl(75, 26%, 53%)" },
  { value: 21, suffix: "", label: "Years clinical practice", icon: Calendar, color: "hsl(39, 55%, 50%)" },
  { value: 500, suffix: "+", label: "Herbal physicians trained", icon: GraduationCap, color: "hsl(150, 30%, 35%)" },
  { value: 3, suffix: "", label: "Days to US door", icon: Truck, color: "hsl(200, 25%, 55%)" },
  { value: 7, suffix: "", label: "Days average retreat", icon: Users, color: "hsl(39, 55%, 50%)" },
];

function AnimatedCounter({
  target,
  suffix,
  isVisible,
}: {
  target: number;
  suffix: string;
  isVisible: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = target / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(increment * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [target, isVisible]);

  const formattedCount =
    target >= 1000 ? count.toLocaleString() : count.toString();

  return (
    <span>
      {formattedCount}
      {suffix}
    </span>
  );
}

export function ByTheNumbers() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 bg-primary text-primary-foreground relative overflow-hidden"
    >
      {/* Organic flowing SVG background */}
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="absolute w-full h-full opacity-10"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
        >
          <path
            d="M0,200 Q300,100 600,200 T1200,200"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-accent"
          />
          <path
            d="M0,250 Q400,150 800,250 T1200,250"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-secondary"
          />
          <path
            d="M0,150 Q200,250 600,150 T1200,150"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-accent/50"
          />
        </svg>
      </div>

      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Rooted in Real Results
          </motion.h2>
          <motion.p 
            className="text-primary-foreground/80 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Two decades of dedication to cellular wellness and traditional
            medicine.
          </motion.p>
        </div>

        {/* Stats in organic flowing layout */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="flex flex-col items-center text-center w-36 md:w-44"
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
              >
                {/* Icon circle with gradient */}
                <motion.div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 relative"
                  style={{
                    background: `linear-gradient(135deg, ${stat.color}40 0%, ${stat.color}20 100%)`,
                    boxShadow: `0 8px 32px -8px ${stat.color}40`,
                  }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon 
                    className="w-7 h-7 md:w-8 md:h-8" 
                    style={{ color: stat.color }}
                  />
                </motion.div>

                {/* Number */}
                <div 
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2"
                  style={{ color: stat.color }}
                >
                  <AnimatedCounter
                    target={stat.value}
                    suffix={stat.suffix}
                    isVisible={isInView}
                  />
                </div>

                {/* Label */}
                <div className="text-xs md:text-sm text-primary-foreground/70 leading-tight">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
