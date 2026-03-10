import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function ThreeSystems() {
  return (
    <section style={{ background: 'var(--site-bg-primary)', padding: 'clamp(80px, 10vw, 120px) 0' }}>
      <div className="container mx-auto max-w-[1400px] px-6">
        {/* Header */}
        <motion.h2
          className="font-serif text-center"
          style={{
            fontSize: 'clamp(32px, 4vw, 42px)',
            color: 'var(--site-text-primary)',
            marginBottom: '60px',
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Three Systems of Care
        </motion.h2>

        {/* Bento grid */}
        <div
          className="rounded-lg"
          style={{
            background: 'var(--site-bg-secondary)',
            padding: 'clamp(32px, 5vw, 80px)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Patient Protocol */}
            <motion.div
              className="rounded-lg p-10 md:p-12 flex flex-col justify-between"
              style={{ background: 'hsl(var(--mk-forest))', minHeight: '380px' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <span className="mk-label" style={{ color: 'hsl(var(--mk-gold))', letterSpacing: '0.2em' }}>
                  Personal
                </span>
                <h3
                  className="font-serif"
                  style={{
                    fontSize: '32px',
                    color: 'hsl(var(--mk-cream))',
                    marginTop: '16px',
                    marginBottom: '24px',
                  }}
                >
                  The Patient Protocol
                </h3>
                <ul className="space-y-2" style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', color: 'hsl(var(--mk-cream))', lineHeight: 1.8 }}>
                  <li>Private consultation</li>
                  <li>Custom formulation</li>
                  <li>Direct guidance</li>
                </ul>
              </div>
              <Link
                to="/retreats"
                className="group inline-flex items-center gap-2 mt-8"
                style={{ color: 'hsl(var(--mk-gold))', fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px' }}
              >
                Schedule Assessment <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Box 2: Clinical Supply */}
            <motion.div
              className="rounded-lg p-10 md:p-12 flex flex-col justify-between"
              style={{
                background: 'var(--site-bg-primary)',
                border: '2px solid hsl(var(--mk-forest))',
                minHeight: '380px',
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div>
                <span className="mk-label" style={{ color: 'hsl(var(--mk-forest))', letterSpacing: '0.2em' }}>
                  Professional
                </span>
                <h3
                  className="font-serif"
                  style={{
                    fontSize: '28px',
                    color: 'var(--site-text-primary)',
                    marginTop: '16px',
                    marginBottom: '24px',
                  }}
                >
                  Clinical Supply
                </h3>
                <ul className="space-y-2" style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', color: 'var(--site-text-primary)', lineHeight: 1.8 }}>
                  <li>COAs &amp; Documentation</li>
                  <li>Wholesale accounts</li>
                  <li>Practitioner training</li>
                </ul>
              </div>
              <Link
                to="/wholesale"
                className="group inline-flex items-center gap-2 mt-8"
                style={{ color: 'hsl(var(--mk-forest))', fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px' }}
              >
                Access Supply Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Box 3: The Ridge Retreat */}
            <motion.div
              className="rounded-lg p-10 md:p-12 flex flex-col justify-between"
              style={{
                background: 'hsl(var(--mk-gold))',
                minHeight: '380px',
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div>
                <span className="mk-label" style={{ color: 'hsl(var(--mk-forest))', letterSpacing: '0.2em' }}>
                  Immersive
                </span>
                <h3
                  className="font-serif"
                  style={{
                    fontSize: '28px',
                    color: 'hsl(var(--mk-cream))',
                    marginTop: '16px',
                    marginBottom: '24px',
                  }}
                >
                  The Ridge Retreat
                </h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', color: 'hsl(var(--mk-cream))', lineHeight: 1.8 }}>
                  Admittance by application. Small cohorts. Deep immersion.
                </p>
              </div>
              <Link
                to="/retreats"
                className="group inline-flex items-center gap-2 mt-8"
                style={{ color: 'hsl(var(--mk-forest))', fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px' }}
              >
                Request Application <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
