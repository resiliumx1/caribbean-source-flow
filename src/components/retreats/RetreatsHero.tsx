import { MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/retreat-hero-yoga.jpg";

const whatsappNumber = "+17582855195";

export function RetreatsHero() {
  const scrollToCalendar = () => {
    document.getElementById("retreat-calendar")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section className="hero-section relative min-h-[80vh] flex items-center pt-20" style={{ overflow: 'visible' }}>
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Healing retreat in Saint Lucia rainforest, Mount Kailash Rejuvenation Centre private and group wellness programs"
          className="w-full h-full object-cover"
          style={{ filter: 'sepia(20%) saturate(120%) hue-rotate(-10deg)' }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="hero-content relative z-10 container mx-auto max-w-6xl px-4 py-20">
        <div className="max-w-2xl">
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(3rem, 6vw, 72px)', color: '#f2ead8', lineHeight: 1.05, marginBottom: '24px' }}>
            Restore. Reset. <span style={{ borderBottom: '3px solid #c9a84c', paddingBottom: '4px' }}>Reconnect.</span>
          </h1>

          <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '18px', color: '#f2ead8', lineHeight: 1.7, marginBottom: '32px', maxWidth: '540px' }}>
            Private and group healing retreats in the heart of Saint Lucia. Led by Right Honourable Priest Kailash Kay Leonce — 21 years of transformational practice.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Priest Kailash, I'd like to consult about your healing retreats.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-full"
              style={{ background: '#c9a84c', color: '#090909', fontFamily: "'Jost', sans-serif", fontWeight: 500, padding: '16px 36px', fontSize: '16px' }}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Consult with Kailash
            </a>
            <Button
              size="lg"
              onClick={scrollToCalendar}
              className="w-full sm:w-auto rounded-full"
              style={{ background: 'transparent', border: '1px solid #c9a84c', color: '#c9a84c', fontFamily: "'Jost', sans-serif", fontWeight: 500, padding: '16px 36px' }}
            >
              <Calendar className="w-5 h-5 mr-2" />
              View Group Dates
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3">
            {["🌿 All-Inclusive", "✦ Led by Priest Kailash", "🌍 Guests from 20+ Countries"].map((badge) => (
              <span key={badge} className="px-3 py-1.5 rounded-full text-xs" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(201,168,76,0.4)', color: '#f2ead8', fontFamily: "'Jost', sans-serif", fontWeight: 300 }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
