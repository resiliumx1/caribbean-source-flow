import { useEffect, useRef, useCallback, useMemo } from "react";
import { GateBotanicalArt } from "./GateBotanicalArt";
import { WreathSVG } from "./WreathSVG";
import "@/styles/gate-entrance.css";

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

interface GateEntranceProps {
  onProgressChange?: (progress: number) => void;
}

export function GateEntrance({ onProgressChange }: GateEntranceProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const gateLeftRef = useRef<HTMLDivElement>(null);
  const gateRightRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const particles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${60 + Math.random() * 50}%`,
      size: 1 + Math.random() * 2,
      duration: 7 + Math.random() * 14,
      delay: Math.random() * 10,
      opacity: 0.1 + Math.random() * 0.3,
    }));
  }, []);

  const handleScroll = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    const stageHeight = stage.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / stageHeight));

    onProgressChange?.(progress);

    // Gates open: ease from 0 to 1 over 0–52% scroll
    const gateT = easeInOutCubic(Math.min(1, progress / 0.52));
    if (gateLeftRef.current) {
      gateLeftRef.current.style.transform = `translateX(${-gateT * 100}%)`;
    }
    if (gateRightRef.current) {
      gateRightRef.current.style.transform = `translateX(${gateT * 100}%)`;
    }

    // Seam glow fade: 1 at 30%, 0 at 50%
    const seamOp = progress < 0.3 ? 1 : progress > 0.5 ? 0 : lerp(1, 0, (progress - 0.3) / 0.2);
    if (gateLeftRef.current) {
      gateLeftRef.current.style.setProperty("--seam-op", String(seamOp));
    }
    if (gateRightRef.current) {
      gateRightRef.current.style.setProperty("--seam-op", String(seamOp));
    }

    // Star seal: rises immediately, fades by 42%
    if (sealRef.current) {
      const sealT = easeInOutCubic(Math.min(1, progress / 0.42));
      const sealY = -sealT * 48; // vh
      const sealScale = lerp(1, 0.5, sealT);
      const sealOpacity = lerp(1, 0, sealT);
      sealRef.current.style.transform = `translate(-50%, calc(-50% + ${sealY}vh)) scale(${sealScale})`;
      sealRef.current.style.opacity = String(sealOpacity);
    }

    // Scroll cue: visible until 38%, fades 40-58%
    if (cueRef.current) {
      const cueOp = progress < 0.38 ? 1 : progress > 0.58 ? 0 : lerp(1, 0, (progress - 0.4) / 0.18);
      cueRef.current.style.opacity = String(Math.max(0, cueOp));
    }
  }, [onProgressChange]);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(handleScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll(); // initial
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  return (
    <div id="scroll-stage" ref={stageRef}>
      <div className="sticky-hero" ref={stickyRef}>
        {/* Forest background */}
        <div className="hero-bg" />

        {/* Gold particles */}
        <div className="particles">
          {particles.map((p) => (
            <div
              key={p.id}
              className="particle"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                "--p-opacity": p.opacity,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Left Gate */}
        <div className="gate-left" ref={gateLeftRef}>
          <GateBotanicalArt side="left" />
          <div className="wreath-half wreath-half-left">
            <WreathSVG className="wreath-half-svg" />
          </div>
        </div>

        {/* Right Gate */}
        <div className="gate-right" ref={gateRightRef}>
          <GateBotanicalArt side="right" />
          <div className="wreath-half wreath-half-right">
            <WreathSVG className="wreath-half-svg" />
          </div>
        </div>

        {/* Central Seal */}
        <div id="logo-seal" ref={sealRef}>
          <div className="seal-glow" />
          <div className="seal-ring" />
          <div className="star-seal" />
        </div>

        {/* Hero Text */}
        <div className="gate-hero-content">
          <p className="h-eyebrow">Welcome to</p>
          <h1 className="h-title">Mount Kailash</h1>
          <p className="h-sub">Rejuvenation Centre</p>
          <div className="h-divider">
            <span className="h-divider-line" />
            <span className="diam" />
            <span className="h-divider-line" />
          </div>
          <p className="h-tagline">
            Nature's answer for optimum health and well being. Ancient botanical
            wisdom, Caribbean roots, whole-body renewal.
          </p>
        </div>

        {/* Scroll to Enter Prompt */}
        <div id="enter-cue" ref={cueRef}>
          <div className="enter-pill">
            <span className="enter-text">SCROLL TO ENTER</span>
            <div className="chev-group">
              <span className="chev" />
              <span className="chev" />
              <span className="chev" />
            </div>
          </div>
          <div className="enter-line" />
        </div>
      </div>
    </div>
  );
}
