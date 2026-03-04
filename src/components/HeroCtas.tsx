import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Leaf, Package, ArrowRight } from "lucide-react";

function GradientMountainIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

export default function HeroCtas() {
  const bandRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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
      style={{ borderTop: '1px solid rgba(201,168,76,0.3)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex flex-col md:flex-row">
        {/* Card 1 — Shop */}
        <Link
          to="/shop"
          className="group flex-1 flex flex-col justify-between"
          style={{
            ...cardStyle(0),
            background: 'rgba(9,9,9,0.75)',
            borderLeft: '3px solid #c9a84c',
            padding: '48px',
            minHeight: '380px',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,20,20,0.85)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(9,9,9,0.75)'; }}
        >
          <div>
            <Leaf className="w-12 h-12 mb-6" style={{ color: '#c9a84c' }} />
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '32px', color: '#f2ead8', lineHeight: 1.15, marginBottom: '16px' }}>
              Shop Natural Formulations
            </h3>
            <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '15px', color: '#8a8070', lineHeight: 1.7 }}>
              Daily remedies crafted for balance, vitality, and long-term wellness.
            </p>
          </div>
          <button
            className="mt-8 w-full flex items-center justify-center gap-2 rounded-full transition-all hover:brightness-110"
            style={{ background: '#c9a84c', color: '#0a0a0a', fontFamily: "'Jost', sans-serif", fontWeight: 500, fontSize: '15px', padding: '14px' }}
          >
            Explore Products <ArrowRight className="w-4 h-4" />
          </button>
        </Link>

        {/* Divider */}
        <div className="hidden md:block" style={{ width: '1px', background: 'rgba(201,168,76,0.2)' }} />

        {/* Card 2 — Wholesale */}
        <Link
          to="/wholesale"
          className="group flex-1 flex flex-col justify-between relative"
          style={{
            ...cardStyle(150),
            background: 'rgba(13,26,15,0.85)',
            borderTop: '3px solid #c9a84c',
            borderLeft: '3px solid #c9a84c',
            padding: '48px',
            minHeight: '380px',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(8,18,10,0.95)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(13,26,15,0.85)'; }}
        >
          {/* Wholesale badge */}
          <span
            className="absolute top-4 right-4 rounded-full px-3 py-1"
            style={{ border: '1px solid #c9a84c', fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c9a84c', background: 'rgba(0,0,0,0.5)' }}
          >
            Wholesale
          </span>
          <div>
            <Package className="w-12 h-12 mb-6" style={{ color: '#c9a84c' }} />
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '32px', color: '#f2ead8', lineHeight: 1.15, marginBottom: '16px' }}>
              Wholesale &amp; Practitioners
            </h3>
            <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '15px', color: '#8a8070', lineHeight: 1.7 }}>
              Bulk herbs and formulations trusted by clinics, retailers, and wellness brands.
            </p>
            <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '12px', color: '#c9a84c', fontStyle: 'italic', marginTop: '12px' }}>
              COA documentation · Miami warehouse · Custom pricing
            </p>
          </div>
          <button
            className="mt-8 w-full flex items-center justify-center gap-2 rounded-full transition-all hover:bg-[#c9a84c] hover:text-[#0a0a0a]"
            style={{ background: 'transparent', border: '1px solid #c9a84c', color: '#c9a84c', fontFamily: "'Jost', sans-serif", fontWeight: 500, fontSize: '15px', padding: '14px' }}
          >
            Access Wholesale <ArrowRight className="w-4 h-4" />
          </button>
        </Link>

        {/* Divider */}
        <div className="hidden md:block" style={{ width: '1px', background: 'rgba(201,168,76,0.2)' }} />

        {/* Card 3 — Retreats */}
        <Link
          to="/retreats"
          className="group flex-1 flex flex-col justify-between"
          style={{
            ...cardStyle(300),
            background: 'rgba(9,9,9,0.75)',
            borderRight: '3px solid #c9a84c',
            borderLeft: window.innerWidth < 768 ? '3px solid #c9a84c' : 'none',
            padding: '48px',
            minHeight: '380px',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,20,20,0.85)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(9,9,9,0.75)'; }}
        >
          <div>
            <GradientMountainIcon className="mb-6" style={{ color: '#c9a84c' }} />
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '32px', color: '#f2ead8', lineHeight: 1.15, marginBottom: '16px' }}>
              Healing Retreats in Saint Lucia
            </h3>
            <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '15px', color: '#8a8070', lineHeight: 1.7 }}>
              Immersive experiences designed for deep restoration and clarity.
            </p>
            <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '12px', color: '#c9a84c', fontStyle: 'italic', marginTop: '12px' }}>
              Private &amp; group programs · Led by Priest Kailash
            </p>
          </div>
          <button
            className="mt-8 w-full flex items-center justify-center gap-2 rounded-full transition-all hover:brightness-110"
            style={{ background: '#c9a84c', color: '#0a0a0a', fontFamily: "'Jost', sans-serif", fontWeight: 500, fontSize: '15px', padding: '14px' }}
          >
            View Retreats <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      {/* Mobile: override border styles */}
      <style>{`
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
