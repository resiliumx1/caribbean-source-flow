import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { number: "500+", label: "Physicians Trained", context: "In our St. Lucia protocol since 2003" },
  { number: "43,000+", label: "Formulations", context: "Documented case outcomes" },
  { number: "40%", label: "Higher Sulfur Content", context: "Than mainland Caribbean soil" },
];

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section style={{ background: 'var(--site-bg-primary)', padding: 'clamp(60px, 8vw, 80px) 0' }}>
      <div className="container mx-auto max-w-[1400px] px-6" ref={ref}>
        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{
            borderTop: '1px solid hsl(var(--mk-gold) / 0.3)',
            borderBottom: '1px solid hsl(var(--mk-gold) / 0.3)',
          }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center py-12 md:py-16"
              style={{
                borderRight: index < stats.length - 1 ? '1px solid hsl(var(--mk-gold) / 0.15)' : 'none',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <span
                className="font-serif block"
                style={{
                  fontSize: 'clamp(48px, 6vw, 72px)',
                  fontWeight: 400,
                  color: 'var(--site-text-primary)',
                  lineHeight: 1,
                }}
              >
                {stat.number}
              </span>
              <span
                className="mk-label block mt-3"
                style={{ color: 'var(--site-text-primary)' }}
              >
                {stat.label}
              </span>
              <span
                className="block mt-2 font-serif italic"
                style={{
                  fontSize: '14px',
                  color: 'hsl(var(--mk-forest-mid))',
                }}
              >
                {stat.context}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
