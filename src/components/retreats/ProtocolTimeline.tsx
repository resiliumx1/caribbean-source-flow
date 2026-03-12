import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ClipboardCheck, Leaf, Utensils, Heart, Package } from "lucide-react";

const steps = [
  { icon: ClipboardCheck, title: "Assess", description: "Personalized intake and consultation to understand your body, lifestyle, and goals." },
  { icon: Leaf, title: "Cleanse", description: "Targeted herbal detox protocols using natural formulations designed for cellular support." },
  { icon: Utensils, title: "Nourish", description: "Plant-based meals and formulations grown in volcanic soil to replenish minerals and energy." },
  { icon: Heart, title: "Integrate", description: "Breathwork, bush walks, stillness, and guided practices to lock in results." },
  { icon: Package, title: "Sustain", description: "Post-experience support, follow-up consultation, and ongoing formulation access." },
];

export function ProtocolTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 60%"],
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={containerRef} className="py-24 md:py-28 overflow-hidden" style={{ background: 'var(--site-bg-primary)' }}>
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 44px)', color: 'var(--site-text-primary)', marginBottom: '16px' }}>
            Your Transformation Journey
          </h2>
          <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '16px', color: 'var(--site-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            A guided path from assessment to lasting vitality—designed to restore balance, not overwhelm the body.
          </p>
        </div>

        <div className="relative">
          {/* SVG Connecting Line - Desktop */}
          <svg
            className="hidden md:block absolute top-[30px] left-0 w-full h-4 z-0"
            preserveAspectRatio="none"
            style={{ overflow: "visible" }}
          >
            <motion.line
              x1="10%"
              y1="2"
              x2="90%"
              y2="2"
              stroke="var(--site-gold)"
              strokeWidth="2"
              strokeDasharray="8 6"
              style={{ pathLength }}
              opacity={0.6}
            />
            <line
              x1="10%"
              y1="2"
              x2="90%"
              y2="2"
              stroke="var(--site-border-subtle)"
              strokeWidth="2"
              strokeDasharray="8 6"
            />
          </svg>

          {/* Mobile vertical line */}
          <svg
            className="md:hidden absolute left-[27px] top-0 w-4 h-full z-0"
            style={{ overflow: "visible" }}
          >
            <motion.line
              x1="2"
              y1="30"
              x2="2"
              y2="95%"
              stroke="var(--site-gold)"
              strokeWidth="2"
              strokeDasharray="8 6"
              style={{ pathLength }}
              opacity={0.5}
            />
          </svg>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-4 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;
              return (
                <motion.div
                  key={step.title}
                  className="relative flex flex-col items-start md:items-center text-left md:text-center pl-16 md:pl-0 cursor-pointer"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  onMouseEnter={() => setActiveStep(index)}
                  onMouseLeave={() => setActiveStep(null)}
                >
                  {/* Circle */}
                  <motion.div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-300 absolute md:relative left-0 md:left-auto"
                    style={{
                      width: '56px',
                      height: '56px',
                      background: isActive ? 'var(--site-gold)' : 'var(--site-bg-deep)',
                      border: '2px solid var(--site-gold)',
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Icon className="w-6 h-6 transition-colors" style={{ color: isActive ? '#FFFFFF' : 'var(--site-gold)' }} />
                  </motion.div>

                  <div className="md:mt-2">
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '14px', color: 'var(--site-gold)', display: 'block', marginBottom: '4px' }}>
                      0{index + 1}
                    </span>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: '18px', color: isActive ? 'var(--site-gold)' : 'var(--site-text-primary)', marginBottom: '8px', transition: 'color 0.3s' }}>
                      {step.title}
                    </h3>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '13px', color: 'var(--site-text-muted)', maxWidth: '200px', lineHeight: 1.6 }}>
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
