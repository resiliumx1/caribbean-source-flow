import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Leaf, Package, MountainSnow, ArrowRight } from "lucide-react";

const iconWrapperStyle: React.CSSProperties = {
  background: 'rgba(201,168,76,0.1)',
  border: '1px solid rgba(201,168,76,0.3)',
  borderRadius: '16px',
  padding: '16px',
  width: 'fit-content',
};

export default function HeroCtas() {
  const bandRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const el = bandRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const cardStyle = (delay: number): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 600ms ease-out ${delay}ms, transform 600ms ease-out ${delay}ms`,
  });

  return (
    <div
      ref={bandRef}
      className="w-full"
      style={{ borderTop: '1px solid var(--site-border)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex flex-col md:flex-row">
        {/* Card 1 — Shop */}
        <Link
          to="/shop"
          className="hero-card group flex-1 flex flex-col justify-between"
          style={{
            ...cardStyle(0),
            background: hoveredCard === 1 ? 'rgba(20,20,20,0.85)' : 'rgba(9,9,9,0.75)',
            borderLeft: '3px solid #c9a84c',
            padding: '48px',
            minHeight: '380px',
          }}
          onMouseEnter={() => setHoveredCard(1)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div>
            <div className="mb-6" style={iconWrapperStyle}>
              <Leaf width={48} height={48} className="icon-sway" style={{ color: '#4ade80' }} />
            </div>
            <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '32px', color: '#f2ead8', lineHeight: 1.15, marginBottom: '16px' }}>
              Shop Natural Formulations
            </h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '15px', color: '#8a8070', lineHeight: 1.7 }}>
              Daily remedies crafted for balance, vitality, and long-term wellness.
            </p>
          </div>
          <button
            className="mt-8 w-full flex items-center justify-center gap-2 rounded-full transition-all hover:brightness-110"
            style={{ background: '#c9a84c', color: '#0a0a0a', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '15px', padding: '14px' }}
          >
            Explore Products <ArrowRight className="w-4 h-4" />
          </button>
        </Link>

        <div className="hidden md:block" style={{ width: '1px', background: 'rgba(201,168,76,0.2)' }} />

        {/* Card 2 — Wholesale */}
        <Link
          to="/wholesale"
          className="hero-card group flex-1 flex flex-col justify-between relative"
          style={{
            ...cardStyle(150),
            background: hoveredCard === 2 ? 'rgba(8,18,10,0.95)' : 'rgba(13,26,15,0.85)',
            borderTop: '3px solid #c9a84c',
            borderLeft: '3px solid #c9a84c',
            padding: '48px',
            minHeight: '380px',
          }}
          onMouseEnter={() => setHoveredCard(2)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <span
            className="absolute top-4 right-4 rounded-full px-3 py-1"
            style={{ border: '1px solid #c9a84c', fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c9a84c', background: 'rgba(0,0,0,0.5)' }}
          >
            Wholesale
          </span>
          <div>
            <div className="mb-6" style={iconWrapperStyle}>
              <Package width={48} height={48} className="icon-float" style={{ color: '#c9a84c' }} />
            </div>
            <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '32px', color: '#f2ead8', lineHeight: 1.15, marginBottom: '16px' }}>
              Wholesale &amp; Practitioners
            </h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '15px', color: '#8a8070', lineHeight: 1.7 }}>
              Bulk herbs and formulations trusted by clinics, retailers, and wellness brands.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '12px', color: '#c9a84c', fontStyle: 'italic', marginTop: '12px' }}>
              COA documentation · Miami warehouse · Custom pricing
            </p>
          </div>
          <button
            className="mt-8 w-full flex items-center justify-center gap-2 rounded-full transition-all hover:bg-[#c9a84c] hover:text-[#0a0a0a]"
            style={{ background: 'transparent', border: '1px solid #c9a84c', color: '#c9a84c', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '15px', padding: '14px' }}
          >
            Access Wholesale <ArrowRight className="w-4 h-4" />
          </button>
        </Link>

        <div className="hidden md:block" style={{ width: '1px', background: 'rgba(201,168,76,0.2)' }} />

        {/* Card 3 — Retreats */}
        <Link
          to="/retreats"
          className="hero-card group flex-1 flex flex-col justify-between"
          style={{
            ...cardStyle(300),
            background: hoveredCard === 3 ? 'rgba(20,20,20,0.85)' : 'rgba(9,9,9,0.75)',
            borderRight: '3px solid #c9a84c',
            borderLeft: '3px solid #c9a84c',
            padding: '48px',
            minHeight: '380px',
          }}
          onMouseEnter={() => setHoveredCard(3)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div>
            <div className="mb-6" style={iconWrapperStyle}>
              <MountainSnow width={48} height={48} className="icon-glow" style={{ color: '#67e8f9' }} />
            </div>
            <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '32px', color: '#f2ead8', lineHeight: 1.15, marginBottom: '16px' }}>
              Healing Retreats in Saint Lucia
            </h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '15px', color: '#8a8070', lineHeight: 1.7 }}>
              Immersive experiences designed for deep restoration and clarity.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '12px', color: '#c9a84c', fontStyle: 'italic', marginTop: '12px' }}>
              Private &amp; group programs · Led by Priest Kailash
            </p>
          </div>
          <button
            className="mt-8 w-full flex items-center justify-center gap-2 rounded-full transition-all hover:brightness-110"
            style={{ background: '#c9a84c', color: '#0a0a0a', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '15px', padding: '14px' }}
          >
            View Retreats <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      <style>{`
        @keyframes sway {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(103,232,249,0.3)); }
          50% { filter: drop-shadow(0 0 12px rgba(103,232,249,0.7)); }
        }
        .icon-sway { animation: sway 3s ease-in-out infinite; }
        .icon-float { animation: float 2.5s ease-in-out infinite; }
        .icon-glow { animation: glow 2s ease-in-out infinite; }
        .hero-card:hover .icon-sway { animation-duration: 0.8s; }
        .hero-card:hover .icon-float { animation-duration: 0.8s; }
        .hero-card:hover .icon-glow { animation-duration: 0.8s; }
        @media (max-width: 767px) {
          .flex-col > a {
            min-height: auto !important;
            padding: 36px !important;
            border-right: none !important;
            border-top: none !important;
            border-left: 3px solid #c9a84c !important;
          }
        }
      `}</style>
    </div>
  );
}
