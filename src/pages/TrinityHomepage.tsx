import { useEffect, useState, useCallback, useRef, lazy, Suspense } from "react";
import { HeroSection } from "@/components/homepage/HeroSection";
import { MessageCircle, ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";

// Lazy load below-fold sections
const SourceStory = lazy(() => import("@/components/homepage/SourceStory").then(m => ({ default: m.SourceStory })));
const RotatingApothecary = lazy(() => import("@/components/homepage/RotatingApothecary").then(m => ({ default: m.RotatingApothecary })));
const WholesaleAuthority = lazy(() => import("@/components/homepage/WholesaleAuthority").then(m => ({ default: m.WholesaleAuthority })));
const RidgeRetreat = lazy(() => import("@/components/homepage/RidgeRetreat").then(m => ({ default: m.RidgeRetreat })));
const SchoolSection = lazy(() => import("@/components/homepage/SchoolSection").then(m => ({ default: m.SchoolSection })));
const ConsultationCTA = lazy(() => import("@/components/homepage/ConsultationCTA").then(m => ({ default: m.ConsultationCTA })));
const HomepageFooter = lazy(() => import("@/components/homepage/HomepageFooter").then(m => ({ default: m.HomepageFooter })));
const SocialProofMatrix = lazy(() => import("@/components/trinity/SocialProofMatrix").then(m => ({ default: m.SocialProofMatrix })));
const GateEntrance = lazy(() => import("@/components/gate-entrance").then(m => ({ default: m.GateEntrance })));

/** Check if gate was seen within last 7 days */
function shouldShowGate(): boolean {
  try {
    const stamp = localStorage.getItem("mkrc-gate-seen");
    if (!stamp) return true;
    const ts = parseInt(stamp, 10);
    if (isNaN(ts)) return true;
    return Date.now() - ts > 7 * 24 * 60 * 60 * 1000;
  } catch {
    return true;
  }
}

const GoddessWhatsApp = () => (
  <a
    href={`https://wa.me/13059429407?text=${encodeURIComponent("Hello Goddess Itopia, I have a question about Mount Kailash products.")}`}
    target="_blank"
    rel="noopener noreferrer"
    className="whatsapp-float group"
    aria-label="Chat with Goddess Itopia on WhatsApp"
  >
    <MessageCircle className="w-6 h-6" />
  </a>
);

function ConsultationToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("mkrc-consult-toast-shown")) return;

    const timer = setTimeout(() => {
      setShow(true);
      sessionStorage.setItem("mkrc-consult-toast-shown", "1");
      setTimeout(() => setShow(false), 6000);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed bottom-6 left-6 z-50 flex items-start gap-3 p-4 rounded-2xl animate-fade-in max-w-sm"
      style={{ background: 'var(--site-bg-card)', border: '1px solid var(--site-card-hover-border)', boxShadow: 'var(--site-shadow-card)' }}
    >
      <div className="flex-1">
        <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 400, fontSize: '14px', color: 'var(--site-text-primary)', marginBottom: '8px' }}>
          🌿 Priest Kailash has limited consultation slots this month
        </p>
        <Link
          to="/retreats"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
          style={{ background: 'var(--site-gold)', color: '#0F281E', fontFamily: "'Jost', sans-serif", fontWeight: 500 }}
        >
          Book Now <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <button onClick={() => setShow(false)} className="p-1" style={{ color: 'var(--site-text-muted)' }} aria-label="Dismiss">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/** Minimal placeholder for lazy sections */
function SectionFallback() {
  return <div className="min-h-[200px]" />;
}

const TrinityHomepage = () => {
  const showGate = shouldShowGate();
  const [gateComplete, setGateComplete] = useState(!showGate);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleGateProgress = useCallback((progress: number) => {
    window.dispatchEvent(new CustomEvent('gate-progress', { detail: progress }));

    if (contentRef.current) {
      if (progress < 0.7) {
        contentRef.current.style.opacity = '0';
        contentRef.current.style.transform = 'scale(0.95)';
      } else if (progress < 0.9) {
        const t = (progress - 0.7) / 0.2;
        contentRef.current.style.opacity = String(t);
        contentRef.current.style.transform = `scale(${0.95 + t * 0.05})`;
      } else {
        contentRef.current.style.opacity = '1';
        contentRef.current.style.transform = 'scale(1)';
      }
    }
  }, []);

  const handleGateComplete = useCallback(() => {
    setGateComplete(true);
    if (contentRef.current) {
      contentRef.current.style.opacity = '1';
      contentRef.current.style.transform = 'scale(1)';
    }
    window.dispatchEvent(new CustomEvent('gate-complete'));
    window.dispatchEvent(new CustomEvent('gate-progress', { detail: 1 }));
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, []);

  useEffect(() => {
    if (gateComplete) {
      window.dispatchEvent(new CustomEvent('gate-complete'));
      window.dispatchEvent(new CustomEvent('gate-progress', { detail: 1 }));
    }
  }, [gateComplete]);

  return (
    <main className="min-h-screen">
      {!gateComplete && (
        <Suspense fallback={<div className="h-[300vh]" />}>
          <GateEntrance onProgressChange={handleGateProgress} onGateComplete={handleGateComplete} />
        </Suspense>
      )}

      <div
        ref={contentRef}
        style={{
          opacity: gateComplete ? 1 : 0,
          transform: gateComplete ? 'scale(1)' : 'scale(0.95)',
          transition: gateComplete ? 'none' : undefined,
          willChange: gateComplete ? 'auto' : 'opacity, transform',
        }}
      >
        <HeroSection />
        <Suspense fallback={<SectionFallback />}>
          <SourceStory />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <RotatingApothecary />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <WholesaleAuthority />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <RidgeRetreat />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <SchoolSection />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <ConsultationCTA />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <SocialProofMatrix />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <HomepageFooter />
        </Suspense>
      </div>
      {gateComplete && <GoddessWhatsApp />}
      <ConsultationToast />
    </main>
  );
};

export default TrinityHomepage;
