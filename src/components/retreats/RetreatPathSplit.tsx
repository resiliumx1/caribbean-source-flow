import { Users, User, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRetreatTypes } from "@/hooks/use-retreats";
import { useStore } from "@/lib/store-context";

const EXCHANGE_RATE = 2.70;

export function RetreatPathSplit() {
  const { data: retreatTypes = [] } = useRetreatTypes();
  const { formatPrice } = useStore();
  const groupRetreat = retreatTypes.find((r) => r.type === "group");
  const soloRetreat = retreatTypes.find((r) => r.type === "solo");

  const scrollToCalendar = () => {
    document.getElementById("retreat-calendar")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section className="py-24 md:py-28" style={{ background: 'var(--site-bg-secondary)' }}>
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 44px)', color: 'var(--site-text-primary)', marginBottom: '16px' }}>
            Two Paths to Transformation
          </h2>
          <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '16px', color: 'var(--site-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Whether you seek community wisdom or private healing, we have a protocol designed for your journey.
          </p>
        </div>

        {/* Two Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Private Retreats */}
          <div className="rounded-2xl p-12 relative transition-all hover:scale-[1.01]" style={{ background: 'var(--site-bg-card)', borderTop: '3px solid #c9a84c', border: '1px solid var(--site-border)', borderTopWidth: '3px', borderTopColor: '#c9a84c', minHeight: '500px', boxShadow: 'var(--site-shadow-card)' }}>
            <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#c9a84c', color: '#090909', fontFamily: "'Jost', sans-serif", fontWeight: 500 }}>
              MOST POPULAR
            </span>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)' }}>
                <User className="w-7 h-7" style={{ color: '#c9a84c' }} />
              </div>
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '28px', color: 'var(--site-text-primary)' }}>
                  Private Retreats
                </h3>
                <span style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '14px', color: 'var(--site-text-muted)' }}>
                  Personalized Experience
                </span>
              </div>
            </div>

            <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '15px', color: 'var(--site-text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>
              A fully personalized healing experience tailored to your body and goals. Work one-on-one with Priest Kailash in a private rainforest setting.
            </p>

            <ul className="space-y-3 mb-8">
              {(soloRetreat?.includes || [
                "Private rainforest cabin",
                "All ital plant-based meals",
                "Daily consultation with Priest Kailash",
                "Custom formulation protocol",
                "60-day post-retreat formulation supply",
              ]).slice(0, 5).map((item) => (
                <li key={item} className="flex items-center gap-3" style={{ fontSize: '15px', color: 'var(--site-text-primary)' }}>
                  <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#c9a84c' }} strokeWidth={3} />
                  {item}
                </li>
              ))}
            </ul>

            <div className="pt-6 mb-6" style={{ borderTop: '1px solid var(--site-border)' }}>
              <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '14px', color: 'var(--site-text-muted)', marginBottom: '4px' }}>From</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '48px', color: '#c9a84c', lineHeight: 1 }}>
                {formatPrice(soloRetreat?.base_price_usd || 350, (soloRetreat?.base_price_usd || 350) * EXCHANGE_RATE)}
                <span style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '16px', color: 'var(--site-text-muted)' }}> per night</span>
              </div>
            </div>

            <Button onClick={scrollToCalendar} className="w-full rounded-full" size="lg" style={{ background: '#c9a84c', color: '#090909', fontFamily: "'Jost', sans-serif", fontWeight: 500 }}>
              Request Consultation <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Group Retreats */}
          <div className="rounded-2xl p-12 relative transition-all hover:scale-[1.01]" style={{ background: 'var(--site-bg-card)', borderTop: '3px solid #2d5a3d', border: '1px solid rgba(45,90,61,0.2)', borderTopWidth: '3px', borderTopColor: '#2d5a3d', minHeight: '500px', boxShadow: 'var(--site-shadow-card)' }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'rgba(45,90,61,0.15)' }}>
                <Users className="w-7 h-7" style={{ color: '#4a9d6b' }} />
              </div>
              <div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '28px', color: 'var(--site-text-primary)' }}>
                  Group Retreats
                </h3>
                <span style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '14px', color: 'var(--site-text-muted)' }}>
                  Shared Experience
                </span>
              </div>
            </div>

            <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '15px', color: 'var(--site-text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>
              Guided experiences with like-minded participants seeking restoration and clarity. Join a transformative 7-day group immersion.
            </p>

            <ul className="space-y-3 mb-8">
              {(groupRetreat?.includes || [
                "Shared traditional accommodations",
                "All ital plant-based meals",
                "Airport transfers (UVF)",
                "Daily herbal workshops",
                "30-day post-retreat formulation supply",
              ]).slice(0, 5).map((item) => (
                <li key={item} className="flex items-center gap-3" style={{ fontSize: '15px', color: 'var(--site-text-primary)' }}>
                  <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#4a9d6b' }} strokeWidth={3} />
                  {item}
                </li>
              ))}
            </ul>

            <div className="pt-6 mb-6" style={{ borderTop: '1px solid rgba(45,90,61,0.2)' }}>
              <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '14px', color: 'var(--site-text-muted)', marginBottom: '4px' }}>From</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '48px', color: '#c9a84c', lineHeight: 1 }}>
                {formatPrice(groupRetreat?.base_price_usd || 2400, (groupRetreat?.base_price_usd || 2400) * EXCHANGE_RATE)}
                <span style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '16px', color: 'var(--site-text-muted)' }}> per person</span>
              </div>
            </div>

            <Button onClick={scrollToCalendar} className="w-full rounded-full" size="lg" style={{ background: '#2d5a3d', color: '#f2ead8', fontFamily: "'Jost', sans-serif", fontWeight: 500 }}>
              View 2026 Dates <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
