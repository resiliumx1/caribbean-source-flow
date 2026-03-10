import { useEffect, useState, useCallback, useRef } from "react";
import { TrinityHero } from "@/components/trinity/TrinityHero";
import { OriginStory } from "@/components/trinity/OriginStory";
import { PriestKailashConsultation } from "@/components/trinity/PriestKailashConsultation";
import { PriestKailashQuote } from "@/components/trinity/PriestKailashQuote";
import { SocialProofMatrix } from "@/components/trinity/SocialProofMatrix";
import { ByTheNumbers } from "@/components/trinity/ByTheNumbers";
import FadeInStagger from "@/components/FadeInStagger";
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
      const section = document.getElementById("priest-kailash-consultation");
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
          style={{ background: '#c9a84c', color: '#090909', fontFamily: "'Jost', sans-serif", fontWeight: 500 }}
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

    // Animate main content: opacity 0→1 and scale 0.95→1 between 70-90% progress
    if (contentRef.current) {
      if (progress < 0.7) {
        contentRef.current.style.opacity = '0';
        contentRef.current.style.transform = 'scale(0.95)';
      } else if (progress < 0.9) {
        const t = (progress - 0.7) / 0.2; // 0→1 over 70-90%
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
    // Ensure content is fully visible
    if (contentRef.current) {
      contentRef.current.style.opacity = '1';
      contentRef.current.style.transform = 'scale(1)';
    }
    // Dispatch gate-complete — header & chat widget listen for this
    window.dispatchEvent(new CustomEvent('gate-complete'));
    window.dispatchEvent(new CustomEvent('gate-progress', { detail: 1 }));
    // Reset scroll to top so homepage hero is visible
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, []);

  // If gate already done (returning visitor), dispatch immediately
  useEffect(() => {
    if (gateComplete) {
      window.dispatchEvent(new CustomEvent('gate-complete'));
      window.dispatchEvent(new CustomEvent('gate-progress', { detail: 1 }));
    }
  }, [gateComplete]);

  return (
    <main className="min-h-screen">
      {/* Gate Entrance — only on first visit. Renders as fixed overlay on top. */}
      {!gateComplete && (
        <GateEntrance onProgressChange={handleGateProgress} onGateComplete={handleGateComplete} />
      )}

      {/* Homepage content — always in DOM, starts hidden behind gate overlay */}
      <div
        ref={contentRef}
        style={{
          opacity: gateComplete ? 1 : 0,
          transform: gateComplete ? 'scale(1)' : 'scale(0.95)',
          transition: gateComplete ? 'none' : undefined,
          willChange: gateComplete ? 'auto' : 'opacity, transform',
        }}
      >
        <FadeInStagger delay={gateComplete ? 0.1 : 0}>
          <TrinityHero />
        </FadeInStagger>
        <FadeInStagger delay={gateComplete ? 0.2 : 0}>
          <OriginStory />
        </FadeInStagger>
        <FadeInStagger delay={gateComplete ? 0.3 : 0}>
          <div id="priest-kailash-consultation">
            <PriestKailashConsultation />
          </div>
        </FadeInStagger>
        <FadeInStagger delay={gateComplete ? 0.4 : 0}>
          <PriestKailashQuote />
        </FadeInStagger>
        <FadeInStagger delay={gateComplete ? 0.5 : 0}>
          <SocialProofMatrix />
        </FadeInStagger>
        <FadeInStagger delay={gateComplete ? 0.6 : 0}>
          <ByTheNumbers />
        </FadeInStagger>
        <FadeInStagger delay={gateComplete ? 0.7 : 0}>
          <UnifiedFooter />
        </FadeInStagger>
      </div>
      {gateComplete && <GoddessWhatsApp />}
      <ConsultationToast />
    </main>
  );
};

export default TrinityHomepage;
