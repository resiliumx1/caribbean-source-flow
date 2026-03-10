import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import priestPhoto from "@/assets/priest-kailash-host.jpg";

export function ConsultationCTA() {
  return (
    <section style={{ background: 'hsl(var(--mk-forest))', padding: 'clamp(80px, 10vw, 120px) 0' }}>
      <div className="container mx-auto max-w-[1400px] px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left — Image (40%) */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <img
              src={priestPhoto}
              alt="Priest Kailash consultation portrait"
              style={{
                width: '100%',
                borderRadius: '4px',
                objectFit: 'cover',
                objectPosition: 'center top',
                aspectRatio: '4/5',
              }}
              loading="lazy"
              width={500}
              height={625}
            />
          </motion.div>

          {/* Right — Content (60%) */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            {/* Decorative gold line */}
            <div
              className="mb-6"
              style={{
                width: '60px',
                height: '2px',
                background: 'hsl(var(--mk-gold))',
              }}
            />

            <span className="mk-label block mb-4" style={{ color: 'hsl(var(--mk-gold))', letterSpacing: '0.2em' }}>
              Private Consultations
            </span>

            <h2
              className="font-serif"
              style={{
                fontSize: 'clamp(36px, 4.5vw, 48px)',
                color: 'hsl(var(--mk-cream))',
                marginBottom: '8px',
              }}
            >
              Clinical Guidance
            </h2>

            <p
              className="font-serif italic"
              style={{
                fontSize: '24px',
                color: 'hsl(var(--mk-gold))',
                marginBottom: '32px',
              }}
            >
              With Priest Kailash Leyonce
            </p>

            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '18px',
                fontWeight: 400,
                color: 'hsl(var(--mk-cream) / 0.9)',
                lineHeight: 1.7,
                maxWidth: '500px',
                marginBottom: '40px',
              }}
            >
              Bring your labs or your symptoms. Leave with a protocol. Sessions are limited; current wait for new patients is eight weeks.
            </p>

            <Link to="/retreats" className="mk-btn-gold">
              Request Admission
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
