import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import priestPhoto from "@/assets/priest-kailash-host.webp";

export function PriestKailashConsultation() {
  return (
    <section
      className="relative py-24 md:py-28"
      style={{
        background: 'var(--site-green-dark)',
        borderTop: '1px solid var(--site-border)',
        borderBottom: '1px solid var(--site-border)',
      }}
    >
      {/* Subtle grain overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundSize: '128px' }} />

      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left — Photo (45%) */}
          <div className="lg:col-span-5 relative">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: '1px solid var(--site-border)',
                boxShadow: '0 0 60px rgba(201,168,76,0.1)',
              }}
            >
              <img
                src={priestPhoto}
                alt="Rt Hon Priest Kailash K Leonce, Master Herbalist with 21+ years clinical practice in Saint Lucia"
                className="w-full h-auto object-cover"
                style={{ objectPosition: 'center top', minHeight: '400px' }}
                loading="lazy"
                width={600}
                height={800}
              />
            </div>
            {/* Floating credential badge */}
            <div
              className="absolute -bottom-4 left-4 right-4 md:left-6 md:right-6 flex flex-col items-center text-center px-5 py-3 rounded-full"
              style={{
                background: 'var(--site-credential-bg)',
                border: '1px solid var(--site-card-hover-border)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: '13px', color: '#f2ead8' }}>
                Rt Hon Priest Kailash K Leonce
              </span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '12px', color: 'var(--site-gold)' }}>
                Master Herbalist · 21+ Years Practice
              </span>
            </div>
          </div>

          {/* Right — Content (55%) */}
          <div className="lg:col-span-7">
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--site-gold)', marginBottom: '12px', display: 'block' }}>
              PERSONAL CONSULTATIONS
            </span>

            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(2rem, 4vw, 48px)', color: '#f2ead8', marginBottom: '24px', lineHeight: 1.15 }}>
              Heal With Guidance.
            </h2>

            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '16px', color: '#c5bfb3', lineHeight: 1.8, marginBottom: '32px', maxWidth: '560px' }}>
              Priest Kailash offers one-on-one herbal consultations for individuals seeking personalised wellness protocols. Drawing from 21 years of clinical bush medicine practice, each session is tailored to your body, your history, and your goals.
            </p>

            {/* Credential pills */}
            <div className="flex flex-wrap gap-3 mb-8">
              {["Herbal Medicine", "Nutrition", "Holistic Wellness"].map((c) => (
                <span
                  key={c}
                  className="px-4 py-2 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(201,168,76,0.3)', fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '13px', color: 'var(--site-gold)' }}
                >
                  {c}
                </span>
              ))}
            </div>

            {/* CTA */}
            <Link
              to="/retreats"
              className="inline-flex items-center gap-3 rounded-full transition-all hover:brightness-110"
              style={{
                background: '#c9a84c',
                color: '#090909',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: '16px',
                padding: '18px 40px',
              }}
            >
              Book a Consultation with Priest Kailash <ArrowRight className="w-5 h-5" />
            </Link>

            {/* Trust notes */}
            <div className="mt-4 space-y-1">
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '12px', color: 'var(--site-gold)', fontStyle: 'italic' }}>
                ✦ Limited sessions available each month
              </p>
              <p className="flex items-center gap-2" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '12px', color: '#c5bfb3' }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
                Accepting consultations for March 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
