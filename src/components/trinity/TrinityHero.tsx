import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import priestPortrait from "@/assets/priest-kailash-host.jpg";

export function TrinityHero() {
  return (
    <section className="relative min-h-screen flex flex-col" style={{ background: 'var(--site-bg-primary)' }}>
      {/* Main hero content */}
      <div className="flex-1 flex items-center">
        <div className="container mx-auto max-w-[1400px] px-6 py-20 md:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left — Text (55%) */}
            <motion.div
              className="lg:col-span-7"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <h1
                className="font-serif"
                style={{
                  fontSize: 'clamp(48px, 6vw, 72px)',
                  fontWeight: 400,
                  lineHeight: 1.0,
                  letterSpacing: '-0.02em',
                  color: 'var(--site-text-primary)',
                  marginBottom: '0',
                }}
              >
                Clinical Bush Medicine
              </h1>
              <p
                className="font-serif italic"
                style={{
                  fontSize: 'clamp(24px, 3vw, 32px)',
                  fontWeight: 400,
                  color: 'hsl(var(--mk-forest-mid))',
                  marginTop: '-10px',
                  marginBottom: '32px',
                }}
              >
                from St. Lucia's Sulphur Ridge
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '20px',
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: 'var(--site-text-primary)',
                  maxWidth: '500px',
                  marginBottom: '40px',
                }}
              >
                Sulfur-rich volcanic ash increases alkaloid potency. Hand-harvested. Small-batch. Twenty-one years of case histories.
              </p>

              {/* Primary CTA */}
              <Link to="/shop" className="mk-btn-primary" style={{ marginBottom: '32px', display: 'inline-flex' }}>
                Review the Formulations
              </Link>

              {/* Secondary links */}
              <div className="flex flex-wrap gap-6" style={{ marginTop: '24px' }}>
                {[
                  { label: "For Practitioners", to: "/wholesale" },
                  { label: "For Patients", to: "/retreats" },
                  { label: "The Ridge Retreat", to: "/retreats" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="group inline-flex items-center gap-1"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                      fontWeight: 400,
                      color: 'var(--site-text-primary)',
                    }}
                  >
                    {link.label}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Right — Priest Portrait (45%) */}
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative">
                <img
                  src={priestPortrait}
                  alt="Priest Kailash in ceremonial robes"
                  className="w-full object-cover"
                  style={{
                    height: '80vh',
                    maxHeight: '700px',
                    borderRadius: '4px',
                    objectPosition: 'center top',
                    filter: 'saturate(0.85)',
                  }}
                  loading="eager"
                  fetchPriority="high"
                  width={600}
                  height={800}
                />
                {/* Warm overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'hsl(var(--mk-gold) / 0.12)',
                    mixBlendMode: 'multiply',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Trust indicator bar */}
      <div
        style={{
          background: 'var(--site-bg-secondary)',
          borderTop: '1px solid hsl(var(--mk-gold) / 0.15)',
          padding: '18px 0',
        }}
      >
        <div className="container mx-auto max-w-[1400px] px-6">
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
            {[
              "Featured by St. Lucia Tourism Authority",
              "21 Years Clinical Documentation",
              "Miami Warehouse · 3-Day US Delivery",
            ].map((text) => (
              <span
                key={text}
                className="mk-label"
                style={{ color: 'hsl(var(--mk-forest-mid))' }}
              >
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
