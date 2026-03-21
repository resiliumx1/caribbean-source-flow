import { useCallback, useRef, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";

const GateEntrance = lazy(() => import("@/components/gate-entrance").then(m => ({ default: m.GateEntrance })));

const GateEntrancePage = () => {
  const navigate = useNavigate();
  const [complete, setComplete] = useState(false);

  const handleGateProgress = useCallback((progress: number) => {
    window.dispatchEvent(new CustomEvent('gate-progress', { detail: progress }));
  }, []);

  const handleGateComplete = useCallback(() => {
    setComplete(true);
    window.dispatchEvent(new CustomEvent('gate-complete'));
    window.dispatchEvent(new CustomEvent('gate-progress', { detail: 1 }));
    // Navigate to home after gate completes
    setTimeout(() => navigate("/", { replace: true }), 300);
  }, [navigate]);

  return (
    <main className="min-h-screen">
      <Suspense fallback={<div className="h-[300vh]" />}>
        <GateEntrance onGateComplete={handleGateComplete} />
      </Suspense>
      {complete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: '#0a0a0a' }}>
          <img src="/favicon.ico" alt="Loading" width={48} height={48} style={{ opacity: 0.6, animation: 'pulse 2s ease-in-out infinite' }} />
        </div>
      )}
    </main>
  );
};

export default GateEntrancePage;
