import { motion } from "framer-motion";
import herbProcessing from "@/assets/herb-processing.jpg";
import labProcessing from "@/assets/lab-processing.png";

export function ProofSection() {
  return (
    <section style={{ background: 'var(--site-bg-primary)', padding: 'clamp(80px, 10vw, 120px) 0' }}>
      <div className="container mx-auto max-w-[1400px] px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left — Typography (7 cols) */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span
              className="font-serif block"
              style={{
                fontSize: 'clamp(80px, 10vw, 120px)',
                fontWeight: 400,
                lineHeight: 0.9,
                color: 'var(--site-text-primary)',
              }}
            >
              21 Years
            </span>
            <p
              className="font-serif"
              style={{
                fontSize: 'clamp(24px, 3vw, 32px)',
                color: 'hsl(var(--mk-forest-mid))',
                marginTop: '-10px',
              }}
            >
              of documented case histories.
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '18px',
                fontWeight: 600,
                color: 'hsl(var(--mk-gold))',
                marginTop: '16px',
              }}
            >
              Not trends. Traditions.
            </p>
          </motion.div>

          {/* Right — Image Stack (5 cols) */}
          <motion.div
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ minHeight: '400px' }}
          >
            {/* Top image */}
            <img
              src={herbProcessing}
              alt="Medicinal herbs harvested at dawn"
              className="relative z-10"
              style={{
                width: '80%',
                marginLeft: 'auto',
                borderRadius: '4px',
                objectFit: 'cover',
                height: '280px',
              }}
              loading="lazy"
              width={480}
              height={280}
            />
            {/* Bottom overlapping image */}
            <img
              src={labProcessing}
              alt="Herbal formulation processing"
              className="relative z-20"
              style={{
                width: '60%',
                borderRadius: '4px',
                objectFit: 'cover',
                height: '220px',
                marginTop: '-40px',
                border: '4px solid var(--site-bg-primary)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              }}
              loading="lazy"
              width={360}
              height={220}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
