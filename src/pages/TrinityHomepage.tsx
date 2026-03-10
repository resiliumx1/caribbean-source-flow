import { useEffect, useState, useCallback, useRef } from "react";
import { TrinityHero } from "@/components/trinity/TrinityHero";
import { ManifestoQuote } from "@/components/trinity/ManifestoQuote";
import { ProofSection } from "@/components/trinity/ProofSection";
import { ThreeSystems } from "@/components/trinity/ThreeSystems";
import { StatsSection } from "@/components/trinity/StatsSection";
import { ConsultationCTA } from "@/components/trinity/ConsultationCTA";
import { UnifiedFooter } from "@/components/trinity/UnifiedFooter";
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

    const handleScroll = () => {
      const section = document.getElementById("consultation-cta");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0) {
        window.removeEventListener("scroll", handleScroll);
        setTimeout(() => {
          setShow(true);
          sessionStorage.setItem("mkrc-consult-toast-shown", "1");
          setTimeout(() => setShow(false), 6000);
        }, 3000);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed bottom-6 left-6 z-50 flex items-start gap-3 p-4 rounded-lg animate-fade-in max-w-sm"
      style={{ background: 'var(--site-bg-card)', border: '1px solid var(--site-card-hover-border)', boxShadow: 'var(--site-shadow-card)' }}
    >
      <div className="flex-1">
        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '14px', color: 'var(--site-text-primary)', marginBottom: '8px' }}>
          🌿 Priest Kailash has limited consultation slots this month
        </p>
        <Link
          to="/retreats"
          className="mk-btn-gold text-xs"
          style={{ padding: '8px 20px', fontSize: '12px' }}
        >
          Schedule Now <ArrowRight className="w-3 h-3" />
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
        <TrinityHero />
        <ManifestoQuote />
        <ProofSection />
        <ThreeSystems />
        <StatsSection />
        <div id="consultation-cta">
          <ConsultationCTA />
        </div>
        <UnifiedFooter />
      </div>
      {gateComplete && <GoddessWhatsApp />}
      <ConsultationToast />
    </main>
  );
};

export default TrinityHomepage;
