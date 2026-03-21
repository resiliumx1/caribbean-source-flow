import { Leaf, ArrowRight } from "lucide-react";
import priestPhoto from "@/assets/priest-kailash-host.webp";

export function PriestKailashBio() {
  return (
    <section className="py-24 md:py-28" style={{ background: 'var(--site-bg-primary)' }}>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden" style={{ border: '2px solid rgba(188,138,95,0.3)', boxShadow: '0 0 40px rgba(188,138,95,0.08)' }}>
              <img
                src={priestPhoto}
                alt="Priest Kailash Kay Leonce welcoming guests"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6" style={{ background: 'rgba(188,138,95,0.1)', color: 'var(--site-gold)', fontFamily: "'DM Sans', sans-serif" }}>
              <Leaf className="w-4 h-4" />
              Meet Your Host
            </span>

            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 44px)', color: 'var(--site-text-primary)', marginBottom: '8px' }}>
              Priest Kailash Kay Leonce
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontStyle: 'italic', fontSize: '16px', color: 'var(--site-gold)', marginBottom: '28px' }}>
              Traditional Wisdom Keeper · 21 Years of Practice
            </p>

            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '16px', color: 'var(--site-text-muted)', lineHeight: 1.8, marginBottom: '28px' }}>
              <p className="mb-4">
                For over two decades, Priest Kailash has welcomed people from around the world into the rainforests of Saint Lucia. His approach weaves traditional Caribbean bush medicine with deep reverence for nature — creating experiences that restore, educate, and inspire.
              </p>
              <p>
                Whether guiding a group through a morning herb harvest or sitting with you one-on-one, his warmth and knowledge make every guest feel at home in the healing process.
              </p>
            </div>

            {/* Quote */}
            <blockquote className="relative pl-6 mb-8" style={{ borderLeft: '4px solid var(--site-gold)' }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontStyle: 'italic', fontSize: '20px', lineHeight: 1.5, color: 'var(--site-text-primary)' }}>
                "Nature has everything we need to heal. My role is simply to guide you back to that connection."
              </p>
            </blockquote>

            {/* Credentials */}
            <div className="flex flex-wrap gap-3">
              {["21+ Years Practice", "Master Herbalist", "Retreat Facilitator", "500+ Guests Welcomed"].map((cred) => (
                <span key={cred} className="px-4 py-2 rounded-full text-sm" style={{ background: 'var(--site-bg-secondary)', border: '1px solid var(--site-border)', color: 'var(--site-text-primary)', fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
                  {cred}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
