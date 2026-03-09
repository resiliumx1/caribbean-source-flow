import { useEffect, useRef, useCallback, useMemo } from "react";
import { GateArtLeft, GateArtRight } from "./GateArt";
import "@/styles/gate-entrance.css";

/* ── Scroll math — verbatim from HTML source ── */
function eio(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}
function remap(v: number, a: number, b: number, c: number, d: number): number {
  return c + (d - c) * clamp((v - a) / (b - a), 0, 1);
}

interface GateEntranceProps {
  onProgressChange?: (progress: number) => void;
}

export function GateEntrance({ onProgressChange }: GateEntranceProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const gateLeftRef = useRef<HTMLDivElement>(null);
  const gateRightRef = useRef<HTMLDivElement>(null);
  const sealRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  /* Generate particles once */
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

  const handleScroll = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = stage.offsetHeight - vh;
    const raw = clamp(-rect.top / total, 0, 1);

    onProgressChange?.(raw);

    /* Gates */
    const gP = eio(clamp(raw / 0.52, 0, 1));
    if (gateLeftRef.current) {
      gateLeftRef.current.style.transform = `translateX(${-gP * 100}%)`;
      gateLeftRef.current.style.visibility = gP >= 0.999 ? 'hidden' : 'visible';
    }
    if (gateRightRef.current) {
      gateRightRef.current.style.transform = `translateX(${gP * 100}%)`;
      gateRightRef.current.style.visibility = gP >= 0.999 ? 'hidden' : 'visible';
    }
    const seamOp = clamp(remap(raw, 0.30, 0.50, 1, 0), 0, 1);
    gateLeftRef.current?.style.setProperty('--seam-op', String(seamOp));
    gateRightRef.current?.style.setProperty('--seam-op', String(seamOp));

    /* Seal rises + fades — starts immediately on scroll */
    if (sealRef.current) {
      const riseP = eio(clamp(remap(raw, 0.0, 0.42, 0, 1), 0, 1));
      const sealY = -(vh * 0.48) * riseP;
      const sealS = 1 - riseP * 0.5;
      const sealO = clamp(1 - riseP * 1.8, 0, 1);
      sealRef.current.style.transform = `translate(-50%,calc(-50% + ${sealY}px)) scale(${sealS})`;
      sealRef.current.style.opacity = String(sealO);
      sealRef.current.style.visibility = sealO === 0 ? 'hidden' : 'visible';
    }

    /* Cue */
    if (cueRef.current) {
      const cueOp = raw < 0.38 ? 1 : clamp(remap(raw, 0.40, 0.58, 1, 0), 0, 1);
      cueRef.current.style.opacity = String(cueOp);
      cueRef.current.style.visibility = cueOp === 0 ? 'hidden' : 'visible';
    }
  }, [onProgressChange]);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(handleScroll);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  return (
    <div id="scroll-stage" ref={stageRef}>
      <div id="sticky-hero">
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
            <GateHalfWreath className="wreath-half-svg wreath-svg-l" />
          </div>
          <div className="gate-art" style={{ opacity: 0.1 }}>
            <GateArtLeft />
          </div>
        </div>

        {/* Right Gate */}
        <div className="gate gate-right" ref={gateRightRef}>
          <div className="wreath-half wreath-half-right">
            <GateHalfWreath className="wreath-half-svg wreath-svg-r" />
          </div>
          <div className="gate-art" style={{ opacity: 0.1 }}>
            <GateArtRight />
          </div>
        </div>

        {/* Central Seal */}
        <div id="logo-seal" ref={sealRef}>
          <div id="wreath-wrap">
            <CenterWreath />
            <div style={{
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
          <div className="chevrons" />
        </div>
      </div>
    </div>
  );
}

/** Half-wreath SVG for the gate panels — verbatim from HTML */
function GateHalfWreath({ className }: { className?: string }) {
  return (
     <svg className={className} viewBox="0 0 520 520" xmlns="http://www.w3.org/2000/svg" fill="none" style={{ opacity: 1, filter: "drop-shadow(0 0 8px var(--gold))" }}>
      <circle cx="260" cy="260" r="224" stroke="rgba(201,169,110,0.07)" strokeWidth="1"/>
      <circle cx="260" cy="260" r="192" stroke="rgba(201,169,110,0.13)" strokeWidth="1.2" fill="none" strokeDasharray="6 4"/>
      <circle cx="260" cy="260" r="164" stroke="rgba(201,169,110,0.09)" strokeWidth="0.8" fill="none"/>

      <g transform="rotate(0,260,260)">
        <line x1="260" y1="68" x2="260" y2="44" stroke="#c9a96e" strokeWidth="0.9"/>
        <ellipse cx="260" cy="42" rx="3" ry="5" fill="rgba(201,169,110,0.55)" stroke="#c9a96e" strokeWidth="0.6"/>
        <ellipse cx="256" cy="50" rx="2.5" ry="4" fill="rgba(201,169,110,0.45)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(-18,256,50)"/>
        <ellipse cx="264" cy="50" rx="2.5" ry="4" fill="rgba(201,169,110,0.45)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(18,264,50)"/>
        <ellipse cx="254" cy="58" rx="2" ry="3.5" fill="rgba(201,169,110,0.35)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(-25,254,58)"/>
        <ellipse cx="266" cy="58" rx="2" ry="3.5" fill="rgba(201,169,110,0.35)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(25,266,58)"/>
        <path d="M260 68 Q248 72 244 80 Q254 76 260 68Z" fill="rgba(201,169,110,0.2)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 68 Q272 72 276 80 Q266 76 260 68Z" fill="rgba(201,169,110,0.2)" stroke="#c9a96e" strokeWidth="0.5"/>
      </g>
      <g transform="rotate(36,260,260)">
        <line x1="260" y1="68" x2="260" y2="48" stroke="#c9a96e" strokeWidth="0.9"/>
        <ellipse cx="260" cy="40" rx="4" ry="7" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.6"/>
        <ellipse cx="260" cy="40" rx="4" ry="7" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.6" transform="rotate(30,260,40)"/>
        <ellipse cx="260" cy="40" rx="4" ry="7" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.6" transform="rotate(60,260,40)"/>
        <ellipse cx="260" cy="40" rx="4" ry="7" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.6" transform="rotate(90,260,40)"/>
        <ellipse cx="260" cy="40" rx="4" ry="7" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.6" transform="rotate(120,260,40)"/>
        <ellipse cx="260" cy="40" rx="4" ry="7" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.6" transform="rotate(150,260,40)"/>
        <circle cx="260" cy="40" r="5" fill="rgba(201,169,110,0.45)" stroke="#c9a96e" strokeWidth="0.7"/>
      </g>
      <g transform="rotate(72,260,260)">
        <path d="M260 70 Q260 52 260 38" stroke="#c9a96e" strokeWidth="0.9"/>
        <path d="M260 65 Q252 60 248 54" stroke="#c9a96e" strokeWidth="0.6"/>
        <path d="M248 54 Q244 50 244 46 Q248 49 250 53Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 58 Q252 52 248 46" stroke="#c9a96e" strokeWidth="0.6"/>
        <path d="M248 46 Q244 42 243 38 Q247 41 249 45Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 65 Q268 60 272 54" stroke="#c9a96e" strokeWidth="0.6"/>
        <path d="M272 54 Q276 50 276 46 Q272 49 270 53Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 58 Q268 52 272 46" stroke="#c9a96e" strokeWidth="0.6"/>
        <path d="M272 46 Q276 42 277 38 Q273 41 271 45Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.5"/>
      </g>
      <g transform="rotate(108,260,260)">
        <line x1="260" y1="70" x2="260" y2="52" stroke="#c9a96e" strokeWidth="0.9"/>
        <path d="M260 52 Q252 46 250 38 Q258 42 261 50Z" fill="rgba(201,169,110,0.25)" stroke="#c9a96e" strokeWidth="0.6"/>
        <path d="M260 52 Q268 46 270 38 Q262 42 259 50Z" fill="rgba(201,169,110,0.25)" stroke="#c9a96e" strokeWidth="0.6"/>
        <path d="M260 52 Q260 41 260 36 Q256 42 258 51Z" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.5"/>
        <line x1="260" y1="52" x2="260" y2="44" stroke="#c9a96e" strokeWidth="0.8"/>
        <circle cx="260" cy="43" r="2.5" fill="rgba(201,169,110,0.6)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 68 Q252 70 250 76 Q257 72 260 68Z" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.4"/>
        <path d="M260 68 Q268 70 270 76 Q263 72 260 68Z" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.4"/>
      </g>
      <g transform="rotate(144,260,260)">
        <path d="M260 70 L260 36" stroke="#c9a96e" strokeWidth="1"/>
        <path d="M260 66 L253 62 M260 66 L267 62" stroke="#c9a96e" strokeWidth="0.7"/>
        <path d="M260 60 L252 56 M260 60 L268 56" stroke="#c9a96e" strokeWidth="0.7"/>
        <path d="M260 54 L253 50 M260 54 L267 50" stroke="#c9a96e" strokeWidth="0.7"/>
        <path d="M260 48 L254 44 M260 48 L266 44" stroke="#c9a96e" strokeWidth="0.7"/>
        <circle cx="253" cy="62" r="1.2" fill="rgba(201,169,110,0.5)"/>
        <circle cx="267" cy="62" r="1.2" fill="rgba(201,169,110,0.5)"/>
        <circle cx="252" cy="56" r="1.2" fill="rgba(201,169,110,0.5)"/>
        <circle cx="268" cy="56" r="1.2" fill="rgba(201,169,110,0.5)"/>
      </g>
      <g transform="rotate(180,260,260)">
        <line x1="260" y1="68" x2="260" y2="46" stroke="#c9a96e" strokeWidth="0.9"/>
        <line x1="260" y1="50" x2="250" y2="44" stroke="#c9a96e" strokeWidth="0.5"/>
        <line x1="260" y1="50" x2="260" y2="40" stroke="#c9a96e" strokeWidth="0.5"/>
        <line x1="260" y1="50" x2="270" y2="44" stroke="#c9a96e" strokeWidth="0.5"/>
        <circle cx="250" cy="43" r="2.5" fill="rgba(201,169,110,0.45)" stroke="#c9a96e" strokeWidth="0.5"/>
        <circle cx="260" cy="39" r="2.8" fill="rgba(201,169,110,0.5)" stroke="#c9a96e" strokeWidth="0.6"/>
        <circle cx="270" cy="43" r="2.5" fill="rgba(201,169,110,0.45)" stroke="#c9a96e" strokeWidth="0.5"/>
      </g>
      <g transform="rotate(216,260,260)">
        <path d="M260 70 Q260 55 260 42" stroke="#c9a96e" strokeWidth="0.9"/>
        <path d="M260 46 Q250 40 248 34 Q256 38 260 44Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.6"/>
        <path d="M260 46 Q270 40 272 34 Q264 38 260 44Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.6"/>
        <line x1="260" y1="44" x2="258" y2="36" stroke="#c9a96e" strokeWidth="0.5"/>
        <line x1="260" y1="44" x2="262" y2="36" stroke="#c9a96e" strokeWidth="0.5"/>
        <circle cx="260" cy="33" r="1.4" fill="rgba(201,169,110,0.65)"/>
        <path d="M260 62 Q248 64 244 72 Q254 68 260 62Z" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.4"/>
        <path d="M260 62 Q272 64 276 72 Q266 68 260 62Z" fill="rgba(201,169,110,0.18)" stroke="#c9a96e" strokeWidth="0.4"/>
      </g>
      <g transform="rotate(252,260,260)">
        <path d="M260 70 Q256 58 254 46 Q260 52 260 44" stroke="#c9a96e" strokeWidth="0.85"/>
        <ellipse cx="256" cy="66" rx="2.5" ry="1.5" fill="rgba(201,169,110,0.3)" stroke="#c9a96e" strokeWidth="0.4" transform="rotate(-20,256,66)"/>
        <ellipse cx="264" cy="64" rx="2.5" ry="1.5" fill="rgba(201,169,110,0.3)" stroke="#c9a96e" strokeWidth="0.4" transform="rotate(20,264,64)"/>
        <ellipse cx="255" cy="58" rx="2.5" ry="1.5" fill="rgba(201,169,110,0.3)" stroke="#c9a96e" strokeWidth="0.4" transform="rotate(-25,255,58)"/>
        <ellipse cx="265" cy="56" rx="2.5" ry="1.5" fill="rgba(201,169,110,0.3)" stroke="#c9a96e" strokeWidth="0.4" transform="rotate(25,265,56)"/>
        <circle cx="259" cy="44" r="1.5" fill="rgba(201,169,110,0.5)" stroke="#c9a96e" strokeWidth="0.4"/>
        <circle cx="261" cy="42" r="1.5" fill="rgba(201,169,110,0.5)" stroke="#c9a96e" strokeWidth="0.4"/>
      </g>
      <g transform="rotate(288,260,260)">
        <line x1="260" y1="70" x2="260" y2="50" stroke="#c9a96e" strokeWidth="0.9"/>
        <ellipse cx="260" cy="42" rx="3.5" ry="8" fill="rgba(201,169,110,0.15)" stroke="#c9a96e" strokeWidth="0.5"/>
        <ellipse cx="260" cy="42" rx="3.5" ry="8" fill="rgba(201,169,110,0.15)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(36,260,42)"/>
        <ellipse cx="260" cy="42" rx="3.5" ry="8" fill="rgba(201,169,110,0.15)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(72,260,42)"/>
        <ellipse cx="260" cy="42" rx="3.5" ry="8" fill="rgba(201,169,110,0.15)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(108,260,42)"/>
        <ellipse cx="260" cy="42" rx="3.5" ry="8" fill="rgba(201,169,110,0.15)" stroke="#c9a96e" strokeWidth="0.5" transform="rotate(144,260,42)"/>
        <circle cx="260" cy="42" r="5" stroke="rgba(201,169,110,0.35)" strokeWidth="0.5" fill="none"/>
        <circle cx="260" cy="42" r="3" fill="rgba(201,169,110,0.4)" stroke="#c9a96e" strokeWidth="0.6"/>
      </g>
      <g transform="rotate(324,260,260)">
        <path d="M260 70 L260 42" stroke="#c9a96e" strokeWidth="0.9"/>
        <path d="M260 65 Q250 60 248 52 Q256 56 260 63Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.55"/>
        <path d="M260 65 Q270 60 272 52 Q264 56 260 63Z" fill="rgba(201,169,110,0.22)" stroke="#c9a96e" strokeWidth="0.55"/>
        <path d="M260 55 Q251 50 250 42 Q257 46 260 53Z" fill="rgba(201,169,110,0.2)" stroke="#c9a96e" strokeWidth="0.5"/>
        <path d="M260 55 Q269 50 270 42 Q263 46 260 53Z" fill="rgba(201,169,110,0.2)" stroke="#c9a96e" strokeWidth="0.5"/>
      </g>
      {/* Accent dots between sprigs */}
      <g transform="rotate(18,260,260)"><circle cx="260" cy="68" r="1.2" fill="rgba(201,169,110,0.3)"/></g>
      <g transform="rotate(54,260,260)"><circle cx="260" cy="68" r="1.3" fill="rgba(201,169,110,0.35)"/></g>
      <g transform="rotate(90,260,260)"><circle cx="260" cy="68" r="1.2" fill="rgba(201,169,110,0.3)"/></g>
      <g transform="rotate(126,260,260)"><circle cx="260" cy="68" r="1.3" fill="rgba(201,169,110,0.35)"/></g>
      <g transform="rotate(162,260,260)"><circle cx="260" cy="68" r="1.2" fill="rgba(201,169,110,0.3)"/></g>
      <g transform="rotate(198,260,260)"><circle cx="260" cy="68" r="1.3" fill="rgba(201,169,110,0.35)"/></g>
      <g transform="rotate(234,260,260)"><circle cx="260" cy="68" r="1.2" fill="rgba(201,169,110,0.3)"/></g>
      <g transform="rotate(270,260,260)"><circle cx="260" cy="68" r="1.3" fill="rgba(201,169,110,0.35)"/></g>
      <g transform="rotate(306,260,260)"><circle cx="260" cy="68" r="1.2" fill="rgba(201,169,110,0.3)"/></g>
      <g transform="rotate(342,260,260)"><circle cx="260" cy="68" r="1.3" fill="rgba(201,169,110,0.35)"/></g>
    </svg>
  );
}

/** Center wreath SVG — verbatim from HTML source */
function CenterWreath() {
  return (
    <svg className="gate-wreath-svg" viewBox="0 0 520 520" xmlns="http://www.w3.org/2000/svg" fill="none" style={{ opacity: 1, filter: "drop-shadow(0 0 8px var(--gold))" }}>
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
