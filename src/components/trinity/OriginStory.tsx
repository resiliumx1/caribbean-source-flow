import wholesaleCollage from "@/assets/wholesale-collage.png";

export function OriginStory() {
  return (
    <section className="py-24 md:py-28" style={{ background: '#0f0f0d' }}>
      <div className="container mx-auto max-w-6xl px-4">
        {/* Photo + Caption */}
        <div className="mb-16">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.2)' }}>
            <img
              src={wholesaleCollage}
              alt="Priest Kailash inspecting herbs, harvesting, lab processing, and Miami warehouse"
              className="w-full h-auto object-cover transition-all duration-300 hover:brightness-110"
              loading="lazy"
            />
          </div>
          <p className="text-center mt-4" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontStyle: 'italic', fontSize: '14px', color: '#c9a84c' }}>
            Wildcrafted in Saint Lucia. Processed by hand. Delivered to the world.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Content */}
          <div className="lg:pl-8">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6" style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}>
              From Volcanic Soil
            </span>

            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(2rem, 3.5vw, 40px)', color: '#f2ead8', marginBottom: '24px', lineHeight: 1.2 }}>
              Where Traditional Bush Medicine Meets Clinical Precision
            </h2>

            <div className="space-y-4 mb-8" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '16px', color: '#8a8070', lineHeight: 1.7 }}>
              <p>
                For over two decades, Right Honourable Priest Kailash Kay Leonce
                has cultivated the art of St. Lucian bush medicine in the shadow
                of the Pitons—where volcanic soil yields herbs of extraordinary
                potency.
              </p>
              <p>
                Our wildcrafters rise before dawn, harvesting at peak alkaloid
                concentration. Each batch undergoes natural fermentation,
                amplifying bioavailability in ways industrial extraction cannot
                replicate.
              </p>
            </div>

            {/* Stats in dark cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { value: "500+", label: "Herbal Physicians Trained" },
                { value: "43,000+", label: "Bottles Formulated Annually" },
                { value: "21+", label: "Years Clinical Practice" },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-xl text-center" style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.2)' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 56px)', color: '#c9a84c', lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '14px', color: '#f2ead8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '8px' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Priest Kailash Quote */}
      <div className="mt-24" style={{ background: '#0d1a0f', borderTop: '1px solid rgba(201,168,76,0.3)', borderBottom: '1px solid rgba(201,168,76,0.3)', padding: '80px 24px' }}>
        <div className="container mx-auto max-w-3xl text-center relative">
          {/* Large decorative quote mark */}
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '180px', color: '#c9a84c', opacity: 0.15, position: 'absolute', top: '-80px', left: '-20px', lineHeight: 1, pointerEvents: 'none' }}>
            "
          </span>
          <blockquote style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(1.5rem, 3vw, 32px)', color: '#f2ead8', lineHeight: 1.5, marginBottom: '24px' }}>
            "Western medicine treats symptoms. Bush medicine addresses
            terrain — the cellular environment where disease takes root."
          </blockquote>
          <cite style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '14px', color: '#c9a84c', fontStyle: 'normal' }}>
            — Priest Kailash Kay Leonce, Master Herbalist
          </cite>
        </div>
      </div>
    </section>
  );
}
