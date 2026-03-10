import { Users, User, Check, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRetreatTypes, useNextGroupRetreat } from "@/hooks/use-retreats";
import { useStore } from "@/lib/store-context";
import { format } from "date-fns";

const EXCHANGE_RATE = 2.70;
const whatsappNumber = "+17582855195";

const groupIncludes = [
  "Daily bush medicine workshops",
  "Traditional plant-based meals",
  "Volcanic rainforest excursions",
  "Personal wellness consultation",
  "Integration practices",
  "Airport transfers",
];

const privateIncludes = [
  "Flexible scheduling",
  "One-on-one sessions with Priest Kailash",
  "Custom wellness protocols",
  "Private accommodation",
  "All meals included",
  "Dedicated guide",
];

export function RetreatPathSplit() {
  const { data: retreatTypes = [] } = useRetreatTypes();
  const { data: nextGroup } = useNextGroupRetreat();
  const { formatPrice } = useStore();
  const groupRetreat = retreatTypes.find((r) => r.type === "group");
  const soloRetreat = retreatTypes.find((r) => r.type === "solo");

  const scrollToCalendar = () => {
    document.getElementById("retreat-calendar")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const nextGroupLabel = nextGroup
    ? `Next retreat: ${format(new Date(nextGroup.start_date), "MMMM yyyy")}`
    : null;

  return (
    <section className="py-24 md:py-28" style={{ background: 'var(--site-bg-secondary)' }}>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-14">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 44px)', color: 'var(--site-text-primary)', marginBottom: '16px' }}>
            Choose Your Path
          </h2>
          <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '16px', color: 'var(--site-text-muted)', maxWidth: '560px', margin: '0 auto' }}>
            Whether you seek community connection or private renewal, there's a retreat designed for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Group Retreat */}
          <div className="rounded-2xl p-10 md:p-12 relative transition-all hover:scale-[1.01]" style={{ background: 'var(--site-bg-card)', border: '1px solid var(--site-border)', borderTop: '3px solid var(--site-gold)', boxShadow: 'var(--site-shadow-card)' }}>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-6" style={{ background: 'rgba(188,138,95,0.12)', color: 'var(--site-gold)', fontFamily: "'Jost', sans-serif", fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Group Experience
            </span>

            {nextGroupLabel && (
              <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--site-gold)', color: 'var(--site-green-dark)', fontFamily: "'Jost', sans-serif", fontWeight: 500 }}>
                {nextGroupLabel}
              </span>
            )}

            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '32px', color: 'var(--site-text-primary)', marginBottom: '16px' }}>
              The 7-Day Immersion
            </h3>
            <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '15px', color: 'var(--site-text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>
              Join a curated group of wellness seekers for guided healing, learning, and connection. Fixed dates with full programming.
            </p>

            <ul className="space-y-3 mb-8">
              {groupIncludes.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--site-gold)' }} strokeWidth={3} />
                  <span style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '14px', color: 'var(--site-text-primary)' }}>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-6 mb-6" style={{ borderTop: '1px solid var(--site-border)' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '40px', color: 'var(--site-gold)', lineHeight: 1 }}>
                {formatPrice(groupRetreat?.base_price_usd || 2400, (groupRetreat?.base_price_usd || 2400) * EXCHANGE_RATE)}
                <span style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '16px', color: 'var(--site-text-muted)' }}> per person</span>
              </div>
            </div>

            <Button onClick={scrollToCalendar} className="w-full rounded-full" size="lg" style={{ background: 'var(--site-gold)', color: 'var(--site-green-dark)', fontFamily: "'Jost', sans-serif", fontWeight: 500 }}>
              See Available Dates <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Private Retreat */}
          <div className="rounded-2xl p-10 md:p-12 relative transition-all hover:scale-[1.01]" style={{ background: 'var(--site-bg-card)', border: '1px solid var(--site-border)', borderTop: '3px solid var(--site-green-mid)', boxShadow: 'var(--site-shadow-card)' }}>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-6" style={{ background: 'rgba(27,67,50,0.1)', color: 'var(--site-green-mid)', fontFamily: "'Jost', sans-serif", fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Private Experience
            </span>

            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '32px', color: 'var(--site-text-primary)', marginBottom: '16px' }}>
              Your Personal Sanctuary
            </h3>
            <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '15px', color: 'var(--site-text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>
              Custom dates and personalized attention. Ideal for couples, friends, or solo travelers seeking privacy and flexibility.
            </p>

            <ul className="space-y-3 mb-8">
              {privateIncludes.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--site-green-mid)' }} strokeWidth={3} />
                  <span style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '14px', color: 'var(--site-text-primary)' }}>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-6 mb-6" style={{ borderTop: '1px solid var(--site-border)' }}>
              <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '14px', color: 'var(--site-text-muted)', marginBottom: '4px' }}>From</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '40px', color: 'var(--site-gold)', lineHeight: 1 }}>
                {formatPrice(soloRetreat?.base_price_usd || 350, (soloRetreat?.base_price_usd || 350) * EXCHANGE_RATE)}
                <span style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '16px', color: 'var(--site-text-muted)' }}> per night · 5-night min</span>
              </div>
            </div>

            <a
              href={`https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${encodeURIComponent("Hello, I'm interested in a private retreat. Can you share available dates?")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full rounded-full" size="lg" style={{ background: 'var(--site-green-mid)', color: '#F5F1E8', fontFamily: "'Jost', sans-serif", fontWeight: 500 }}>
                Check Private Availability <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
