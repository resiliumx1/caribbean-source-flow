import { Link } from "react-router-dom";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { Leaf, Package, ArrowRight } from "lucide-react";

const Player = lazy(() =>
  import("@lottiefiles/react-lottie-player").then((mod) => ({ default: mod.Player }))
);

// Lottie CDN URLs
const LOTTIE_URLS = {
  plant: "https://assets2.lottiefiles.com/packages/lf20_mDnz2m.json",
  package: "https://assets10.lottiefiles.com/packages/lf20_wnqlfojb.json",
  meditation: "https://assets4.lottiefiles.com/packages/lf20_szlepvdh.json",
};

function GradientMountainIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

function LottieIcon({
  src,
  fallback,
  hovered,
}: {
  src: string;
  fallback: React.ReactNode;
  hovered: boolean;
}) {
  const playerRef = useRef<any>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    try {
      playerRef.current?.setPlayerSpeed?.(hovered ? 1.5 : 1);
    } catch {}
  }, [hovered]);

  if (failed) return <>{fallback}</>;

  return (
    <div
      className="flex items-center justify-center rounded-2xl p-2 transition-all duration-300"
      style={{
        width: '96px',
        height: '96px',
        background: hovered ? 'rgba(201,168,76,0.14)' : 'rgba(201,168,76,0.08)',
        border: `1px solid ${hovered ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.2)'}`,
        borderRadius: '16px',
      }}
    >
      <Suspense fallback={<>{fallback}</>}>
        <Player
          ref={playerRef}
          autoplay
          loop
          src={src}
          style={{ height: '80px', width: '80px' }}
          rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
          onEvent={(event: string) => {
            if (event === 'error') setFailed(true);
          }}
        />
      </Suspense>
    </div>
  );
}

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
      style={{ borderTop: '1px solid rgba(201,168,76,0.3)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex flex-col md:flex-row">
        {/* Card 1 — Shop */}
        <Link
          to="/shop"
          className="group flex-1 flex flex-col justify-between"
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
            {visible ? (
              <div className="mb-6">
                <LottieIcon
                  src={LOTTIE_URLS.plant}
                  hovered={hoveredCard === 1}
                  fallback={<Leaf className="w-12 h-12" style={{ color: '#c9a84c' }} />}
                />
              </div>
            ) : (
              <Leaf className="w-12 h-12 mb-6" style={{ color: '#c9a84c' }} />
            )}
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
            style={{ border: '1px solid #c9a84c', fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c9a84c', background: 'rgba(0,0,0,0.5)' }}
          >
            Wholesale
          </span>
          <div>
            {visible ? (
              <div className="mb-6">
                <LottieIcon
                  src={LOTTIE_URLS.package}
                  hovered={hoveredCard === 2}
                  fallback={<Package className="w-12 h-12" style={{ color: '#c9a84c' }} />}
                />
              </div>
            ) : (
              <Package className="w-12 h-12 mb-6" style={{ color: '#c9a84c' }} />
            )}
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
            {visible ? (
              <div className="mb-6">
                <LottieIcon
                  src={LOTTIE_URLS.meditation}
                  hovered={hoveredCard === 3}
                  fallback={<GradientMountainIcon style={{ color: '#c9a84c' }} />}
                />
              </div>
            ) : (
              <GradientMountainIcon className="mb-6" style={{ color: '#c9a84c' }} />
            )}
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
