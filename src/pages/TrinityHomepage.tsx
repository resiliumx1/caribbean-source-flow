import { useEffect, lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { HeroSection } from "@/components/homepage/HeroSection";
import { MessageCircle, ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { GateEntrance, isReturningVisitor } from "@/components/gate-entrance";

// Lazy load below-fold sections
const SourceStory = lazy(() => import("@/components/homepage/SourceStory").then(m => ({ default: m.SourceStory })));
const RotatingApothecary = lazy(() => import("@/components/homepage/RotatingApothecary").then(m => ({ default: m.RotatingApothecary })));
const WholesaleAuthority = lazy(() => import("@/components/homepage/WholesaleAuthority").then(m => ({ default: m.WholesaleAuthority })));
const RidgeRetreat = lazy(() => import("@/components/homepage/RidgeRetreat").then(m => ({ default: m.RidgeRetreat })));
const SchoolSection = lazy(() => import("@/components/homepage/SchoolSection").then(m => ({ default: m.SchoolSection })));
const ConsultationCTA = lazy(() => import("@/components/homepage/ConsultationCTA").then(m => ({ default: m.ConsultationCTA })));
const HomepageFooter = lazy(() => import("@/components/homepage/HomepageFooter").then(m => ({ default: m.HomepageFooter })));
const SocialProofMatrix = lazy(() => import("@/components/trinity/SocialProofMatrix").then(m => ({ default: m.SocialProofMatrix })));

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
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: '14px', color: 'var(--site-text-primary)', marginBottom: '8px' }}>
          🌿 Priest Kailash has limited consultation slots this month
        </p>
        <Link
          to="/retreats"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
          style={{ background: 'var(--site-gold)', color: '#0F281E', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
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
  const [showGate, setShowGate] = useState(() => !isReturningVisitor());

  // Dispatch gate-complete immediately so header/chat show
  useEffect(() => {
    if (!showGate) {
      window.dispatchEvent(new CustomEvent('gate-complete'));
      window.dispatchEvent(new CustomEvent('gate-progress', { detail: 1 }));
    }
  }, [showGate]);

  return (
    <main className="min-h-screen">
      {showGate && (
        <GateEntrance
          onGateComplete={() => {
            setShowGate(false);
            window.dispatchEvent(new CustomEvent('gate-complete'));
            window.dispatchEvent(new CustomEvent('gate-progress', { detail: 1 }));
          }}
        />
      )}

      <Helmet>
        <title>Mount Kailash Rejuvenation Centre | Caribbean Bush Medicine & Wellness</title>
        <meta name="description" content="Mount Kailash Rejuvenation Centre — 21+ years of Caribbean clinical bush medicine from Saint Lucia. Shop herbal tinctures, book a 7-day immersive healing retreat, or train as a certified herbal physician under Rt Hon Priest Kailash K Leonce." />
        <link rel="canonical" href="https://caribbean-source-flow.lovable.app/" />
      </Helmet>

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
      <Suspense fallback={null}><BotanicalBranch /></Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ConsultationCTA />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <SocialProofMatrix />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <HomepageFooter />
      </Suspense>

      <GoddessWhatsApp />
      <ConsultationToast />
    </main>
  );
};

export default TrinityHomepage;
