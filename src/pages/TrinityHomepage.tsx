import { useEffect, useState, useCallback, useRef } from "react";
import { HeroSection } from "@/components/homepage/HeroSection";
import { SourceStory } from "@/components/homepage/SourceStory";
import { RotatingApothecary } from "@/components/homepage/RotatingApothecary";
import { WholesaleAuthority } from "@/components/homepage/WholesaleAuthority";
import { RidgeRetreat } from "@/components/homepage/RidgeRetreat";
import { SchoolSection } from "@/components/homepage/SchoolSection";
import { ConsultationCTA } from "@/components/homepage/ConsultationCTA";
import { HomepageFooter } from "@/components/homepage/HomepageFooter";
import { SocialProofMatrix } from "@/components/trinity/SocialProofMatrix";
import FadeInStagger from "@/components/FadeInStagger";
import { MessageCircle, ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { GateEntrance } from "@/components/gate-entrance";

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

const TrinityHomepage = () => {
  const isFirstVisit = !localStorage.getItem('mkrc-gate-seen');
  const [gateComplete, setGateComplete] = useState(!isFirstVisit);
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
    localStorage.setItem('mkrc-gate-seen', '1');
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
        <GateEntrance onProgressChange={handleGateProgress} onGateComplete={handleGateComplete} />
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
        <FadeInStagger delay={0.1}>
          <SourceStory />
        </FadeInStagger>
        <FadeInStagger delay={0.1}>
          <RotatingApothecary />
        </FadeInStagger>
        <FadeInStagger delay={0.1}>
          <WholesaleAuthority />
        </FadeInStagger>
        <FadeInStagger delay={0.1}>
          <RidgeRetreat />
        </FadeInStagger>
        <FadeInStagger delay={0.1}>
          <SchoolSection />
        </FadeInStagger>
        <FadeInStagger delay={0.1}>
          <ConsultationCTA />
        </FadeInStagger>
        <FadeInStagger delay={0.1}>
          <SocialProofMatrix />
        </FadeInStagger>
        <HomepageFooter />
      </div>
      {gateComplete && <GoddessWhatsApp />}
      <ConsultationToast />
    </main>
  );
};

export default TrinityHomepage;
