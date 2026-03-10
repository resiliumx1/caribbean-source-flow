import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "@/styles/gate-entrance.css";

gsap.registerPlugin(ScrollTrigger);

function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

interface GateEntranceProps {
  onProgressChange?: (progress: number) => void;
  onGateComplete?: () => void;
}

export function GateEntrance({ onProgressChange, onGateComplete }: GateEntranceProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const gateLeftRef = useRef<HTMLDivElement>(null);
  const gateRightRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);
  const [visible, setVisible] = useState(true);

  const particles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => {
      const s = 1 + Math.random() * 2;
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${10 + Math.random() * 80}%`,
        width: s,
        height: s,
        dur: `${7 + Math.random() * 14}s`,
        del: `-${Math.random() * 12}s`,
        op: 0.08 + Math.random() * 0.4,
        dx: `${(Math.random() - 0.5) * 80}px`,
        dy: `${-(30 + Math.random() * 80)}px`,
      };
    });
  }, []);

  useEffect(() => {
    const trigger = triggerRef.current;
    const overlay = overlayRef.current;
    if (!trigger || !overlay) return;

    const st = ScrollTrigger.create({
      trigger,
      start: "top top",
      end: "bottom top",
      pin: overlay,
      pinSpacing: false,
      scrub: 1,
      onUpdate: (self) => {
        const raw = self.progress; // 0 → 1

        onProgressChange?.(raw);

        // Gate opening: eased, complete by ~55% scroll
        const gateRaw = clamp(raw / 0.55, 0, 1);
        const gP = gateRaw * gateRaw * (3 - 2 * gateRaw); // smoothstep

        if (gateLeftRef.current) {
          gateLeftRef.current.style.transform = `translateX(${-gP * 100}%)`;
          gateLeftRef.current.style.visibility = gP >= 0.999 ? 'hidden' : 'visible';
        }
        if (gateRightRef.current) {
          gateRightRef.current.style.transform = `translateX(${gP * 100}%)`;
          gateRightRef.current.style.visibility = gP >= 0.999 ? 'hidden' : 'visible';
        }

        // Seam opacity
        const seamOp = clamp(1 - gateRaw * 2.5, 0, 1);
        gateLeftRef.current?.style.setProperty('--seam-op', String(seamOp));
        gateRightRef.current?.style.setProperty('--seam-op', String(seamOp));

        // Seal: rises and fades
        if (sealRef.current) {
          const riseP = clamp(raw / 0.4, 0, 1);
          const eased = riseP * riseP * (3 - 2 * riseP);
          const vh = window.innerHeight;
          const sealY = -(vh * 0.48) * eased;
          const sealS = 1 - eased * 0.5;
          const sealO = clamp(1 - eased * 1.8, 0, 1);
          sealRef.current.style.transform = `translate(-50%,calc(-50% + ${sealY}px)) scale(${sealS})`;
          sealRef.current.style.opacity = String(sealO);
          sealRef.current.style.visibility = sealO <= 0 ? 'hidden' : 'visible';
        }

        // Cue: fades out early
        if (cueRef.current) {
          const cueOp = raw < 0.05 ? 1 : clamp(1 - (raw - 0.05) / 0.15, 0, 1);
          cueRef.current.style.opacity = String(cueOp);
          cueRef.current.style.visibility = cueOp <= 0 ? 'hidden' : 'visible';
        }

        // Overlay fade out at 80-100%
        if (raw >= 0.8) {
          const fadeP = clamp((raw - 0.8) / 0.2, 0, 1);
          overlay.style.opacity = String(1 - fadeP);
        } else {
          overlay.style.opacity = '1';
        }

        // Completion
        if (raw >= 0.95 && !completedRef.current) {
          completedRef.current = true;
          onGateComplete?.();
        }
      },
    });

    return () => {
      st.kill();
    };
  }, [onProgressChange, onGateComplete]);

  // Once complete, fade out and hide after a short delay
  useEffect(() => {
    if (completedRef.current) {
      // Allow GSAP to finish the fade, then remove from DOM
      const timer = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible && completedRef.current) return (
    <div ref={triggerRef} style={{ height: '300vh' }} />
  );

  return (
    <>
      {/* Spacer that ScrollTrigger uses for pin distance */}
      <div ref={triggerRef} className="gate-trigger-spacer" />

      {/* Fixed overlay */}
      <div
        ref={overlayRef}
        className="gate-overlay"
      >
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
                width: p.width,
                height: p.height,
                background: 'var(--gold)',
                '--dur': p.dur,
                '--del': p.del,
                '--op': p.op,
                '--dx': p.dx,
                '--dy': p.dy,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Left Gate */}
        <div className="gate gate-left" ref={gateLeftRef}>
          <div className="wreath-half wreath-half-left">
            <div className="wreath-half-mirror">
              <GateWreathSVG className="wreath-half-svg" />
            </div>
          </div>
        </div>

        {/* Right Gate */}
        <div className="gate gate-right" ref={gateRightRef}>
          <div className="wreath-half wreath-half-right">
            <GateWreathSVG className="wreath-half-svg" />
          </div>
        </div>

        {/* Central Seal */}
        <div id="logo-seal" ref={sealRef}>
          <div className="star-seal-inner" style={{
            width: 160,
            height: 160,
            backgroundColor: '#c9a96e',
            WebkitMaskImage: "url('/star-seal-for-lovable.png')",
            maskImage: "url('/star-seal-for-lovable.png')",
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            filter: 'drop-shadow(0 0 18px rgba(201,169,110,0.4))',
            position: 'relative',
            zIndex: 2,
          }} />
        </div>

        {/* Hero Text */}
        <div className="hero-content">
          <span className="h-eyebrow">Welcome to</span>
          <h1 className="h-title">Mount Kailash</h1>
          <p className="h-sub">Rejuvenation Centre</p>
          <div className="h-divider"><div className="diam" /></div>
          <p className="h-tagline">
            Nature's answer for optimum health and well being.<br />
            Ancient botanical wisdom, Caribbean roots, whole-body renewal.
          </p>
        </div>

        {/* Scroll to Enter Prompt */}
        <div id="enter-cue" ref={cueRef}>
          <div className="enter-pill">
            <span className="enter-text">Scroll to Enter</span>
            <div className="enter-arrow">
              <div className="chev" />
              <div className="chev" />
              <div className="chev" />
            </div>
          </div>
          <div className="enter-line" />
        </div>
      </div>
    </>
  );
}


/** Wreath SVG used on both gate halves */
function GateWreathSVG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 520 520" xmlns="http://www.w3.org/2000/svg" fill="none" style={{ opacity: 1, filter: "drop-shadow(0 0 8px var(--gold))" }}>
      <circle cx="260" cy="260" r="192" stroke="rgba(201,169,110,0.22)" strokeWidth="1.2" strokeDasharray="5 5"/>
      <circle cx="260" cy="260" r="207" stroke="rgba(201,169,110,0.08)" strokeWidth="0.8"/>

      <g transform="rotate(0,260,260)">
        <line x1="260" y1="70" x2="260" y2="44" stroke="#c9a96e" strokeWidth="0.95"/>
        <ellipse cx="260" cy="42" rx="3" ry="5" fill="rgba(201,169,110,0.6)" stroke="#c9a96e" strokeWidth="0.65"/>
        <ellipse cx="256" cy="50" rx="2.4" ry="4" fill="rgba(201,169,110,0.45)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(-18,256,50)"/>
        <ellipse cx="264" cy="50" rx="2.4" ry="4" fill="rgba(201,169,110,0.45)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(18,264,50)"/>
        <ellipse cx="254" cy="58" rx="2" ry="3.5" fill="rgba(201,169,110,0.35)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(-25,254,58)"/>
        <ellipse cx="266" cy="58" rx="2" ry="3.5" fill="rgba(201,169,110,0.35)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(25,266,58)"/>
        <path d="M260 70 Q248 74 244 82 Q254 78 260 70Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 70 Q272 74 276 82 Q266 78 260 70Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.5"/>
        <circle cx="260" cy="68" r="1.4" fill="rgba(201,169,110,0.45)"/>
      </g>

      <g transform="rotate(36,260,260)">
        <line x1="260" y1="70" x2="260" y2="50" stroke="#c9a96e" strokeWidth="0.9"/>
        <ellipse cx="260" cy="41" rx="4" ry="7.5" fill="rgba(201,169,110,0.16)" stroke="#c9a96e" strokeWidth="0.55"/>
        <ellipse cx="260" cy="41" rx="4" ry="7.5" fill="rgba(201,169,110,0.16)" stroke="#c9a96e" strokeWidth="0.55" transform="rotate(30,260,41)"/>
        <ellipse cx="260" cy="41" rx="4" ry="7.5" fill="rgba(201,169,110,0.16)" stroke="#c9a96e" strokeWidth="0.55" transform="rotate(60,260,41)"/>
        <ellipse cx="260" cy="41" rx="4" ry="7.5" fill="rgba(201,169,110,0.16)" stroke="#c9a96e" strokeWidth="0.55" transform="rotate(90,260,41)"/>
        <ellipse cx="260" cy="41" rx="4" ry="7.5" fill="rgba(201,169,110,0.16)" stroke="#c9a96e" strokeWidth="0.55" transform="rotate(120,260,41)"/>
        <ellipse cx="260" cy="41" rx="4" ry="7.5" fill="rgba(201,169,110,0.16)" stroke="#c9a96e" strokeWidth="0.55" transform="rotate(150,260,41)"/>
        <circle cx="260" cy="41" r="5.5" fill="rgba(201,169,110,0.42)" stroke="#c9a96e" strokeWidth="0.7"/>
        <circle cx="259" cy="40" r="0.8" fill="#c9a96e" opacity="0.7"/>
        <circle cx="261" cy="39" r="0.8" fill="#c9a96e" opacity="0.7"/>
        <circle cx="262" cy="42" r="0.8" fill="#c9a96e" opacity="0.7"/>
        <circle cx="260" cy="68" r="1.3" fill="rgba(201,169,110,0.38)"/>
      </g>

      <g transform="rotate(72,260,260)">
        <path d="M260 70 Q260 54 260 38" stroke="#c9a96e" strokeWidth="0.95"/>
        <path d="M260 65 Q251 60 247 53" stroke="#c9a96e" strokeWidth="0.65"/>
        <path d="M247 53 Q243 49 243 45 Q248 48 250 52Z" fill="rgba(201,169,110,0.24)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 57 Q251 51 248 44" stroke="#c9a96e" strokeWidth="0.65"/>
        <path d="M248 44 Q244 40 243 36 Q248 40 250 44Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 65 Q269 60 273 53" stroke="#c9a96e" strokeWidth="0.65"/>
        <path d="M273 53 Q277 49 277 45 Q272 48 270 52Z" fill="rgba(201,169,110,0.24)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 57 Q269 51 272 44" stroke="#c9a96e" strokeWidth="0.65"/>
        <path d="M272 44 Q276 40 277 36 Q272 40 270 44Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 50 Q252 46 251 40 Q257 43 260 49Z" fill="rgba(201,169,110,0.16)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 50 Q268 46 269 40 Q263 43 260 49Z" fill="rgba(201,169,110,0.16)" stroke="#c9a96e" strokeWidth="0.5"/>
        <circle cx="260" cy="68" r="1.3" fill="rgba(201,169,110,0.35)"/>
      </g>

      <g transform="rotate(108,260,260)">
        <line x1="260" y1="70" x2="260" y2="54" stroke="#c9a96e" strokeWidth="0.9"/>
        <path d="M260 54 Q252 47 250 39 Q258 43 261 52Z" fill="rgba(201,169,110,0.24)" stroke="#c9a96e" strokeWidth="0.6"/>
        <path d="M260 54 Q268 47 270 39 Q262 43 259 52Z" fill="rgba(201,169,110,0.24)" stroke="#c9a96e" strokeWidth="0.6"/>
        <path d="M260 54 Q256 44 250 41 Q254 47 258 53Z" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 54 Q264 44 270 41 Q266 47 262 53Z" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 54 Q260 42 260 37 Q257 44 259 53Z" fill="rgba(201,169,110,0.16)" stroke="#c9a96e" strokeWidth="0.5"/>
        <line x1="260" y1="52" x2="260" y2="44" stroke="#c9a96e" strokeWidth="0.85"/>
        <circle cx="260" cy="43" r="2.8" fill="rgba(201,169,110,0.65)" stroke="#c9a96e" strokeWidth="0.55"/>
        <path d="M260 68 Q252 70 250 77 Q257 73 260 68Z" fill="rgba(201,169,110,0.2)" stroke="#c9a96e" strokeWidth="0.4"/>
        <path d="M260 68 Q268 70 270 77 Q263 73 260 68Z" fill="rgba(201,169,110,0.2)" stroke="#c9a96e" strokeWidth="0.4"/>
        <circle cx="260" cy="68" r="1.3" fill="rgba(201,169,110,0.35)"/>
      </g>

      <g transform="rotate(144,260,260)">
        <path d="M260 72 L260 36" stroke="#c9a96e" strokeWidth="1.05"/>
        <path d="M260 67 L252 62 M260 67 L268 62" stroke="#c9a96e" strokeWidth="0.7"/>
        <path d="M260 60 L251 55 M260 60 L269 55" stroke="#c9a96e" strokeWidth="0.7"/>
        <path d="M260 53 L252 48 M260 53 L268 48" stroke="#c9a96e" strokeWidth="0.7"/>
        <path d="M260 46 L253 42 M260 46 L267 42" stroke="#c9a96e" strokeWidth="0.7"/>
        <path d="M260 40 L255 37 M260 40 L265 37" stroke="#c9a96e" strokeWidth="0.6"/>
        <circle cx="252" cy="62" r="1.3" fill="rgba(201,169,110,0.55)"/>
        <circle cx="268" cy="62" r="1.3" fill="rgba(201,169,110,0.55)"/>
        <circle cx="251" cy="55" r="1.3" fill="rgba(201,169,110,0.55)"/>
        <circle cx="269" cy="55" r="1.3" fill="rgba(201,169,110,0.55)"/>
        <circle cx="252" cy="48" r="1.2" fill="rgba(201,169,110,0.45)"/>
        <circle cx="268" cy="48" r="1.2" fill="rgba(201,169,110,0.45)"/>
        <circle cx="260" cy="72" r="1.4" fill="rgba(201,169,110,0.4)"/>
      </g>

      <g transform="rotate(180,260,260)">
        <line x1="260" y1="70" x2="260" y2="50" stroke="#c9a96e" strokeWidth="0.9"/>
        <line x1="260" y1="52" x2="250" y2="45" stroke="#c9a96e" strokeWidth="0.55"/>
        <line x1="260" y1="52" x2="255" y2="43" stroke="#c9a96e" strokeWidth="0.55"/>
        <line x1="260" y1="52" x2="260" y2="41" stroke="#c9a96e" strokeWidth="0.55"/>
        <line x1="260" y1="52" x2="265" y2="43" stroke="#c9a96e" strokeWidth="0.55"/>
        <line x1="260" y1="52" x2="270" y2="45" stroke="#c9a96e" strokeWidth="0.55"/>
        <circle cx="250" cy="44" r="2.5" fill="rgba(201,169,110,0.48)" stroke="#c9a96e" strokeWidth="0.55"/>
        <circle cx="255" cy="42" r="2.5" fill="rgba(201,169,110,0.48)" stroke="#c9a96e" strokeWidth="0.55"/>
        <circle cx="260" cy="40" r="3" fill="rgba(201,169,110,0.55)" stroke="#c9a96e" strokeWidth="0.65"/>
        <circle cx="265" cy="42" r="2.5" fill="rgba(201,169,110,0.48)" stroke="#c9a96e" strokeWidth="0.55"/>
        <circle cx="270" cy="44" r="2.5" fill="rgba(201,169,110,0.48)" stroke="#c9a96e" strokeWidth="0.55"/>
        <path d="M260 40 L258 37 M260 40 L262 37 M260 40 L260 37" stroke="#c9a96e" strokeWidth="0.45"/>
        <circle cx="260" cy="68" r="1.4" fill="rgba(201,169,110,0.4)"/>
      </g>

      <g transform="rotate(216,260,260)">
        <path d="M260 72 Q260 56 260 44" stroke="#c9a96e" strokeWidth="0.9"/>
        <path d="M260 48 Q250 42 248 35 Q257 39 260 46Z" fill="rgba(201,169,110,0.24)" stroke="#c9a96e" strokeWidth="0.65"/>
        <path d="M260 48 Q270 42 272 35 Q263 39 260 46Z" fill="rgba(201,169,110,0.24)" stroke="#c9a96e" strokeWidth="0.65"/>
        <path d="M260 48 Q256 37 254 31 Q260 36 261 46Z" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 48 Q264 37 266 31 Q260 36 259 46Z" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.5"/>
        <line x1="260" y1="46" x2="258" y2="37" stroke="#c9a96e" strokeWidth="0.55"/>
        <line x1="260" y1="46" x2="262" y2="37" stroke="#c9a96e" strokeWidth="0.55"/>
        <line x1="260" y1="46" x2="260" y2="35" stroke="#c9a96e" strokeWidth="0.55"/>
        <circle cx="258" cy="36" r="1.3" fill="rgba(201,169,110,0.65)"/>
        <circle cx="262" cy="36" r="1.3" fill="rgba(201,169,110,0.65)"/>
        <circle cx="260" cy="34" r="1.5" fill="rgba(201,169,110,0.7)"/>
        <path d="M260 64 Q248 66 244 74 Q254 70 260 64Z" fill="rgba(201,169,110,0.2)" stroke="#c9a96e" strokeWidth="0.45"/>
        <path d="M260 64 Q272 66 276 74 Q266 70 260 64Z" fill="rgba(201,169,110,0.2)" stroke="#c9a96e" strokeWidth="0.45"/>
        <circle cx="260" cy="70" r="1.4" fill="rgba(201,169,110,0.4)"/>
      </g>

      <g transform="rotate(252,260,260)">
        <path d="M260 72 Q257 58 255 47 Q260 53 260 44" stroke="#c9a96e" strokeWidth="0.9"/>
        <path d="M260 72 Q263 58 265 47 Q260 53 260 44" stroke="#c9a96e" strokeWidth="0.65" strokeDasharray="2 1.5"/>
        <ellipse cx="256" cy="67" rx="2.6" ry="1.5" fill="rgba(201,169,110,0.32)" stroke="#c9a96e" strokeWidth="0.45" transform="rotate(-20,256,67)"/>
        <ellipse cx="264" cy="65" rx="2.6" ry="1.5" fill="rgba(201,169,110,0.32)" stroke="#c9a96e" strokeWidth="0.45" transform="rotate(20,264,65)"/>
        <ellipse cx="255" cy="59" rx="2.5" ry="1.5" fill="rgba(201,169,110,0.3)" stroke="#c9a96e" strokeWidth="0.45" transform="rotate(-25,255,59)"/>
        <ellipse cx="265" cy="57" rx="2.5" ry="1.5" fill="rgba(201,169,110,0.3)" stroke="#c9a96e" strokeWidth="0.45" transform="rotate(25,265,57)"/>
        <ellipse cx="257" cy="51" rx="2.2" ry="1.4" fill="rgba(201,169,110,0.28)" stroke="#c9a96e" strokeWidth="0.4" transform="rotate(-15,257,51)"/>
        <circle cx="259" cy="44" r="1.6" fill="rgba(201,169,110,0.55)" stroke="#c9a96e" strokeWidth="0.4"/>
        <circle cx="261" cy="42" r="1.6" fill="rgba(201,169,110,0.55)" stroke="#c9a96e" strokeWidth="0.4"/>
        <circle cx="260" cy="70" r="1.4" fill="rgba(201,169,110,0.4)"/>
      </g>

      <g transform="rotate(288,260,260)">
        <line x1="260" y1="72" x2="260" y2="52" stroke="#c9a96e" strokeWidth="0.9"/>
        <ellipse cx="260" cy="43" rx="3.5" ry="8" fill="rgba(201,169,110,0.13)" stroke="#c9a96e" strokeWidth="0.5"/>
        <ellipse cx="260" cy="43" rx="3.5" ry="8" fill="rgba(201,169,110,0.13)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(36,260,43)"/>
        <ellipse cx="260" cy="43" rx="3.5" ry="8" fill="rgba(201,169,110,0.13)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(72,260,43)"/>
        <ellipse cx="260" cy="43" rx="3.5" ry="8" fill="rgba(201,169,110,0.13)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(108,260,43)"/>
        <ellipse cx="260" cy="43" rx="3.5" ry="8" fill="rgba(201,169,110,0.13)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(144,260,43)"/>
        <circle cx="260" cy="43" r="5.5" stroke="rgba(201,169,110,0.38)" strokeWidth="0.55" fill="none"/>
        <circle cx="260" cy="43" r="3.2" fill="rgba(201,169,110,0.45)" stroke="#c9a96e" strokeWidth="0.65"/>
        <path d="M260 72 Q254 77 250 74 Q256 80 260 72" stroke="#c9a96e" strokeWidth="0.5" fill="none"/>
        <path d="M260 67 Q268 70 272 66 Q265 74 260 67" stroke="#c9a96e" strokeWidth="0.45" fill="none"/>
        <circle cx="260" cy="70" r="1.4" fill="rgba(201,169,110,0.4)"/>
      </g>

      <g transform="rotate(324,260,260)">
        <path d="M260 72 L260 42" stroke="#c9a96e" strokeWidth="0.95"/>
        <path d="M260 67 Q250 61 248 53 Q256 57 260 65Z" fill="rgba(201,169,110,0.24)" stroke="#c9a96e" strokeWidth="0.58"/>
        <line x1="260" y1="67" x2="248" y2="53" stroke="#c9a96e" strokeWidth="0.32" strokeDasharray="1.5 1.5"/>
        <path d="M260 67 Q270 61 272 53 Q264 57 260 65Z" fill="rgba(201,169,110,0.24)" stroke="#c9a96e" strokeWidth="0.58"/>
        <line x1="260" y1="67" x2="272" y2="53" stroke="#c9a96e" strokeWidth="0.32" strokeDasharray="1.5 1.5"/>
        <path d="M260 57 Q251 51 250 43 Q257 47 260 55Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.52"/>
        <path d="M260 57 Q269 51 270 43 Q263 47 260 55Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.52"/>
        <path d="M260 48 Q256 41 256 37 Q260 41 261 47Z" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.46"/>
        <path d="M260 48 Q264 41 264 37 Q260 41 259 47Z" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.46"/>
        <line x1="254" y1="62" x2="252" y2="56" stroke="#c9a96e" strokeWidth="0.3" opacity="0.5"/>
        <line x1="266" y1="62" x2="268" y2="56" stroke="#c9a96e" strokeWidth="0.3" opacity="0.5"/>
        <circle cx="260" cy="70" r="1.4" fill="rgba(201,169,110,0.4)"/>
      </g>
    </svg>
  );
}
