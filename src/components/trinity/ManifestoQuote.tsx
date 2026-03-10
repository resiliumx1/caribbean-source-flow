import { motion } from "framer-motion";

export function ManifestoQuote() {
  return (
    <section style={{ background: 'var(--site-bg-primary)', padding: 'clamp(80px, 12vw, 160px) 24px' }}>
      <div className="container mx-auto max-w-[900px] text-center">
        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12"
          style={{
            width: '100px',
            height: '2px',
            background: 'hsl(var(--mk-gold))',
            transformOrigin: 'center',
          }}
        />

        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-serif italic"
          style={{
            fontSize: 'clamp(24px, 3.5vw, 36px)',
            lineHeight: 1.4,
            color: 'var(--site-text-primary)',
            marginBottom: '32px',
          }}
        >
          "Western medicine treats symptoms. We address terrain — the cellular environment where disease takes root."
        </motion.blockquote>

        <motion.cite
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mk-label block"
          style={{
            color: 'hsl(var(--mk-gold))',
            fontStyle: 'normal',
            letterSpacing: '0.15em',
          }}
        >
          — Priest Kailash Leyonce, Master Herbalist
        </motion.cite>
      </div>
    </section>
  );
}
