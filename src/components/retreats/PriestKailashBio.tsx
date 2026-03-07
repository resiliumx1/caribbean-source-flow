import { Award, BookOpen, Calendar, MessageCircle, Leaf, Heart, Users, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import priestPhoto from "@/assets/priest-kailash-host.jpg";

const whatsappNumber = "+17582855195";

const experiencePoints = [
  "Personalized herbal protocol based on your unique constitution",
  "Daily one-on-one guidance and support throughout your journey",
  "Traditional bush medicine wisdom passed down through generations",
  "Integration practices to carry your transformation forward",
  "Connection to the healing power of St. Lucia's volcanic landscape",
];

export function PriestKailashBio() {
  const whatsappMessage = encodeURIComponent(
    "Hello, I would like to schedule a discovery call with Priest Kailash to discuss a retreat consultation."
  );

  return (
    <section className="py-24 md:py-28 relative overflow-hidden" style={{ background: '#0d1a0f' }}>
      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden" style={{ border: '2px solid rgba(201,168,76,0.3)', boxShadow: '0 0 60px rgba(201,168,76,0.1)' }}>
              <img
                src={priestPhoto}
                alt="Right Honourable Priest Kailash Kay Leonce"
                className="w-full h-full object-cover"
                width={600}
                height={800}
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border-4 rounded-2xl -z-10" style={{ borderColor: '#c9a84c' }} />
          </div>

          {/* Content */}
          <div className="lg:pl-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6" style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c' }}>
              <Leaf className="w-4 h-4" />
              Your Guide
            </span>

            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '48px', color: '#f2ead8', marginBottom: '8px' }}>
              Right Honourable Priest Kailash Kay Leonce
            </h2>
            <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontStyle: 'italic', fontSize: '16px', color: '#c9a84c', marginBottom: '32px' }}>
              Master Herbalist & Founder, Mount Kailash Rejuvenation Centre
            </p>

            {/* Credentials pills */}
            <div className="flex flex-wrap gap-3 mb-8">
              {["21+ Years Practice", "Master Herbalist", "Retreat Facilitator"].map((cred) => (
                <span key={cred} className="px-4 py-2 rounded-full text-sm" style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.4)', color: '#f2ead8', fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
                  {cred}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl" style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.2)' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '40px', color: '#c9a84c' }}>21+</div>
                <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '14px', color: '#f2ead8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Years Practice</div>
              </div>
              <div className="p-4 rounded-xl" style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.2)' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '40px', color: '#c9a84c' }}>500+</div>
                <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '14px', color: '#f2ead8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Herbalists Trained</div>
              </div>
            </div>

            {/* Quote */}
            <blockquote className="relative pl-6 mb-8" style={{ borderLeft: '4px solid #c9a84c' }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontStyle: 'italic', fontSize: '20px', lineHeight: 1.5, color: '#f2ead8', marginBottom: '12px' }}>
                "Western medicine treats symptoms. Bush medicine addresses
                terrain—the cellular environment where disease takes root. We
                don't fight the body; we restore its intelligence."
              </p>
            </blockquote>

            {/* Bio text */}
            <div className="mb-8" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '16px', color: '#f2ead8', lineHeight: 1.8, opacity: 0.85 }}>
              <p className="mb-4">
                For over two decades, Priest Kailash has guided thousands through transformational healing journeys in the rainforests of Saint Lucia. His approach combines traditional Caribbean bush medicine with modern understanding of cellular wellness.
              </p>
            </div>

            {/* What You'll Experience */}
            <div className="rounded-xl p-5 mb-8" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#f2ead8' }}>
                <Heart className="w-5 h-5" style={{ color: '#c9a84c' }} />
                What You'll Experience
              </h3>
              <ul className="space-y-3">
                {experiencePoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#c9a84c' }} />
                    <span style={{ color: '#f2ead8', lineHeight: 1.6 }}>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium transition-all hover:brightness-110 hover:scale-102" style={{ background: 'transparent', border: '1px solid #c9a84c', color: '#c9a84c', fontFamily: "'Jost', sans-serif", fontWeight: 500 }}>
                Book a Consultation with Priest Kailash <ArrowRight className="w-5 h-5" />
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
