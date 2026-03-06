import { ArrowRight } from "lucide-react";
import wholesaleCollage from "@/assets/wholesale-collage.png";
import schoolFaculty from "@/assets/school-faculty-ceremony.jpg";

export function OriginStory() {
  return (
    <section className="py-24 md:py-28" style={{ background: 'var(--site-bg-secondary)' }}>
      <div className="container mx-auto max-w-6xl px-4">
        {/* Photo + Caption */}
        <div className="mb-16">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--site-border)' }}>
            <img
              src={wholesaleCollage}
              alt="Priest Kailash Kay Leonce inspecting medicinal herbs at Mount Kailash processing facility, Saint Lucia"
              className="w-full h-auto object-cover transition-all duration-300 hover:brightness-110"
              loading="lazy"
              width={1200}
              height={600}
            />
          </div>
          <p className="text-center mt-4" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontStyle: 'italic', fontSize: '14px', color: 'var(--site-gold-text)' }}>
            Wildcrafted in Saint Lucia. Processed by hand. Delivered to the world.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content — Left */}
          <div className="lg:pl-8">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6" style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--site-gold-text)' }}>
              From Volcanic Soil
            </span>

            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(2rem, 3.5vw, 40px)', color: 'var(--site-text-primary)', marginBottom: '24px', lineHeight: 1.2 }}>
              Where Traditional Bush Medicine Meets Clinical Precision
            </h2>

            <div className="space-y-4 mb-8" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '16px', color: 'var(--site-text-muted)', lineHeight: 1.7 }}>
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

            {/* Stats in cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { value: "500+", label: "Herbal Physicians Trained" },
                { value: "43,000+", label: "Bottles Formulated Annually" },
                { value: "21+", label: "Years Clinical Practice" },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-xl text-center" style={{ background: 'var(--site-bg-card)', border: '1px solid var(--site-border)', boxShadow: 'var(--site-shadow-card)' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 56px)', color: 'var(--site-gold)', lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '14px', color: 'var(--site-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '8px' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — School Photo */}
          <div className="flex flex-col items-start">
            <span style={{ fontFamily: "'Jost', sans-serif", fontWeight: 500, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--site-gold-text)', marginBottom: '8px' }}>
              MOUNT KAILASH SCHOOL OF ESOTERIC KNOWLEDGE
            </span>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontStyle: 'italic', fontSize: '18px', color: 'var(--site-text-primary)', marginBottom: '20px' }}>
              Ancient Caribbean wisdom. Formally taught.
            </p>
            <div
              className="rounded-2xl overflow-hidden w-full mb-6"
              style={{
                border: '1px solid var(--site-border)',
                boxShadow: 'var(--site-shadow-card)',
              }}
            >
              <img
                src={schoolFaculty}
                alt="Priest Kailash Kay Leonce with Mount Kailash School of Esoteric Knowledge faculty in ceremonial robes, Saint Lucia"
                className="w-full h-auto object-cover"
                style={{ objectPosition: 'center top' }}
                loading="lazy"
                width={800}
                height={533}
              />
            </div>
            <a
              href="https://mount-kailash-school-temp.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full transition-all hover:bg-[#c9a84c] hover:text-[#090909]"
              style={{ border: '1px solid var(--site-gold)', color: 'var(--site-gold)', fontFamily: "'Jost', sans-serif", fontWeight: 500, fontSize: '14px' }}
            >
              Explore The School <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
