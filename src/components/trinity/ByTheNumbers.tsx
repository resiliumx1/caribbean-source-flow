import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Leaf, GraduationCap, Truck, Calendar } from "lucide-react";

interface Stat {
  value: number;
  suffix: string;
  label: string;
  icon: React.ElementType;
}

const stats: Stat[] = [
  { value: 43000, suffix: "+", label: "Bottles formulated annually", icon: Leaf },
  { value: 21, suffix: "+", label: "Years clinical practice", icon: Calendar },
  { value: 500, suffix: "+", label: "Herbal physicians trained", icon: GraduationCap },
  { value: 3, suffix: "", label: "Days to US door", icon: Truck },
];

function AnimatedCounter({ target, suffix, isVisible }: { target: number; suffix: string; isVisible: boolean }) {
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

  const formattedCount = target >= 1000 ? count.toLocaleString() : count.toString();
  return <span>{formattedCount}{suffix}</span>;
}

export function ByTheNumbers() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section ref={sectionRef} className="py-24 md:py-28 relative overflow-hidden" style={{ background: 'var(--site-bg-primary)' }}>
      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <motion.h2
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 44px)', color: 'var(--site-text-primary)', marginBottom: '16px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Rooted in Real Results
          </motion.h2>
          <motion.p
            style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '16px', color: 'var(--site-text-muted)', maxWidth: '560px', margin: '0 auto' }}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Two decades of dedication to cellular wellness and traditional medicine.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="rounded-xl p-8 text-center"
                style={{ background: 'var(--site-bg-card)', border: '1px solid var(--site-border)', boxShadow: 'var(--site-shadow-card)' }}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(201,168,76,0.1)' }}>
                  <Icon className="w-6 h-6" style={{ color: 'var(--site-gold)' }} />
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 56px)', color: 'var(--site-gold)', lineHeight: 1, marginBottom: '8px' }}>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} isVisible={isInView} />
                </div>
                <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '14px', color: 'var(--site-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
