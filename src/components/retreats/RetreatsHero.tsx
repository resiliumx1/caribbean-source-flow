import { MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/retreat-hero-yoga.webp";

const whatsappNumber = "+17582855195";

export function RetreatsHero() {
  const scrollToCalendar = () => {
    document.getElementById("retreat-calendar")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Wellness retreat in Saint Lucia rainforest with golden light over the Pitons"
          className="w-full h-full object-cover"
          width={1400}
          height={933}
          style={{ filter: 'saturate(110%) brightness(105%)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.75) 100%)' }} />
      </div>

      {/* Content - Centered */}
      <div className="relative z-10 container mx-auto max-w-4xl px-4 text-center py-32">
        <h1
          className="mb-6"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            fontSize: 'clamp(3rem, 7vw, 80px)',
            color: '#F5F1E8',
            lineHeight: 1.05,
            textShadow: '0 2px 8px rgba(0,0,0,0.7), 0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          Restore. Reset. Reconnect.
        </h1>

        <p
          className="mx-auto mb-10"
          style={{
            fontFamily: "'Jost', sans-serif",
            fontWeight: 300,
            fontSize: 'clamp(18px, 2.2vw, 20px)',
            color: '#F5F1E8',
            opacity: 0.9,
            lineHeight: 1.7,
            maxWidth: '600px',
            textShadow: '0 2px 6px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          For those running on empty. Seven days of cellular restoration to repair your nervous system and reclaim your vital force.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Button
            size="lg"
            onClick={scrollToCalendar}
            className="rounded-full px-10 py-6 text-base font-medium"
            style={{
              background: 'var(--site-gold)',
              color: 'var(--site-green-dark)',
              fontFamily: "'Jost', sans-serif",
              fontWeight: 500,
            }}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Reserve Group Dates →
          </Button>
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello, I'd like to inquire about a private retreat at Mount Kailash.")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto rounded-full px-10 py-6 text-base font-medium"
              style={{
                background: 'transparent',
                border: '1px solid #F5F1E8',
                color: '#F5F1E8',
                fontFamily: "'Jost', sans-serif",
                fontWeight: 500,
              }}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Design Private Retreat →
            </Button>
          </a>
        </div>

        {/* Trust pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {["📅 7-Day Protocols", "🌿 Master Herbalist Guided", "💧 Cellular Detox", "✦ All-Inclusive"].map((badge) => (
            <span
              key={badge}
              className="px-4 py-2 rounded-full"
              style={{
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(245,241,232,0.2)',
                color: '#F5F1E8',
                fontFamily: "'Jost', sans-serif",
                fontWeight: 300,
                fontSize: '13px',
                letterSpacing: '0.02em',
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
