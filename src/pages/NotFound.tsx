import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const LEAVES = Array.from({ length: 9 }).map((_, i) => ({
  left: `${(i * 11 + 6) % 100}%`,
  delay: `${(i * 1.7) % 12}s`,
  duration: `${14 + ((i * 3) % 9)}s`,
  size: 14 + ((i * 5) % 18),
  drift: i % 2 === 0 ? 1 : -1,
}));

const PARTICLES = Array.from({ length: 14 }).map((_, i) => ({
  left: `${(i * 7 + 3) % 100}%`,
  top: `${(i * 13 + 11) % 100}%`,
  delay: `${(i * 0.9) % 7}s`,
  size: 2 + (i % 3),
}));

/**
 * Dead WordPress URLs from the previous site. These are permanently gone, not
 * merely missing: we tell crawlers so explicitly (noindex + "Gone" copy), and
 * robots.txt disallows the same prefixes so they stop being requested.
 */
const GONE_PATTERNS = [
  /^\/wp-content\//i,
  /^\/wp-admin\/?/i,
  /^\/wp-includes\//i,
  /^\/wp-login\.php/i,
  /^\/xmlrpc\.php/i,
  /^\/category\//i,
  /^\/tag\//i,
];

function isGonePath(pathname: string, search: string): boolean {
  if (/[?&]p=\d+/.test(search)) return true;
  return GONE_PATTERNS.some((re) => re.test(pathname));
}

const NotFound = () => {
  const location = useLocation();
  const gone = isGonePath(location.pathname, location.search);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>
          {gone
            ? "Page Removed — Mount Kailash Rejuvenation Centre, Saint Lucia"
            : "Lost in the Forest — 404 | Mount Kailash Rejuvenation Centre"}
        </title>
        <meta
          name="description"
          content="The page you're looking for may have moved, but your journey back to balance starts here. Return home or explore the Mount Kailash apothecary."
        />
        <meta name="robots" content="noindex,follow" />
      </Helmet>

      <main
        className="nf-page relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-16"
        style={{
          background:
            "radial-gradient(120% 80% at 20% 0%, #0f3a2a 0%, #07201a 55%, #061b14 100%)",
        }}
      >
        {/* Ambient glow orbs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <span className="nf-orb nf-orb--a" />
          <span className="nf-orb nf-orb--b" />
        </div>

        {/* Drifting leaves */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          {LEAVES.map((leaf, i) => (
            <svg
              key={i}
              className="nf-leaf"
              viewBox="0 0 32 32"
              style={{
                left: leaf.left,
                width: leaf.size,
                height: leaf.size,
                animationDelay: leaf.delay,
                animationDuration: leaf.duration,
                ["--drift" as string]: leaf.drift,
              }}
            >
              <path
                d="M16 2 C 24 8, 28 18, 16 30 C 4 18, 8 8, 16 2 Z M16 6 L16 28"
                fill="rgba(201,166,70,0.18)"
                stroke="rgba(226,200,102,0.55)"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
            </svg>
          ))}
        </div>

        {/* Gold particles */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="nf-particle"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto w-full max-w-2xl text-center nf-reveal">
          {/* Star seal */}
          <img
            src="/star-seal-for-lovable.png"
            alt=""
            aria-hidden
            className="nf-seal mx-auto mb-6"
            width={72}
            height={72}
            style={{
              filter:
                "brightness(0) invert(1) drop-shadow(0 0 16px rgba(226,200,102,0.45))",
              opacity: 0.85,
            }}
          />

          {/* 404 with botanical vines */}
          <div className="relative mx-auto mb-6 inline-block">
            <svg
              aria-hidden
              className="nf-vine nf-vine--left"
              viewBox="0 0 60 120"
              width="46"
              height="92"
            >
              <path
                d="M58 4 C 30 20, 18 50, 30 78 C 38 96, 30 110, 14 116 M40 30 q -8 4 -14 0 M32 56 q -10 2 -16 -4 M30 84 q -12 0 -18 -8"
                fill="none"
                stroke="url(#nfVineGold)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="nfVineGold" x1="0" y1="0" x2="0" y2="120">
                  <stop offset="0%" stopColor="#e2c866" stopOpacity="0.1" />
                  <stop offset="60%" stopColor="#c9a646" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#b88a2e" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
            <svg
              aria-hidden
              className="nf-vine nf-vine--right"
              viewBox="0 0 60 120"
              width="46"
              height="92"
              style={{ transform: "scaleX(-1)" }}
            >
              <path
                d="M58 4 C 30 20, 18 50, 30 78 C 38 96, 30 110, 14 116 M40 30 q -8 4 -14 0 M32 56 q -10 2 -16 -4 M30 84 q -12 0 -18 -8"
                fill="none"
                stroke="url(#nfVineGold)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            <h1
              className="nf-404"
              aria-label="404"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontStyle: "italic",
                fontSize: "clamp(108px, 18vw, 200px)",
                lineHeight: 0.9,
                letterSpacing: "-0.02em",
              }}
            >
              404
            </h1>
          </div>

          <h2
            className="mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              fontSize: "clamp(28px, 4vw, 44px)",
              lineHeight: 1.1,
              color: "#f7f1df",
              letterSpacing: "-0.01em",
            }}
          >
            {gone ? "This page is gone for good" : "Lost in the Forest?"}
          </h2>

          <p
            className="mx-auto mb-10 max-w-lg"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              fontSize: "clamp(15px, 1.2vw, 17px)",
              lineHeight: 1.65,
              color: "rgba(216,205,177,0.85)",
            }}
          >
            {gone
              ? "This address belonged to our old website and has been permanently removed. Everything from Mount Kailash Rejuvenation Centre in Soufriere, Saint Lucia now lives on the pages below."
              : "The path you're looking for may have moved, but your journey back to balance starts here."}
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link to="/" className="nf-btn nf-btn--primary">
              <span className="nf-btn-shimmer" aria-hidden />
              <span className="relative z-10">Return Home</span>
            </Link>
            <Link to="/shop" className="nf-btn nf-btn--secondary">
              Shop Remedies
            </Link>
          </div>

          <p
            className="mt-10 truncate"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(226,200,102,0.5)",
            }}
          >
            Missing path: {location.pathname}
          </p>
        </div>

        <style>{`
          .nf-reveal {
            opacity: 0;
            transform: translateY(12px);
            animation: nf-rise 0.9s cubic-bezier(0.22,1,0.36,1) 120ms forwards;
          }
          @keyframes nf-rise {
            to { opacity: 1; transform: translateY(0); }
          }

          .nf-orb {
            position: absolute;
            border-radius: 9999px;
            filter: blur(80px);
            opacity: 0.35;
            pointer-events: none;
          }
          .nf-orb--a {
            width: 520px; height: 520px;
            left: -120px; top: -160px;
            background: radial-gradient(circle, rgba(201,166,70,0.45), transparent 70%);
            animation: nf-orb-float 18s ease-in-out infinite;
          }
          .nf-orb--b {
            width: 420px; height: 420px;
            right: -100px; bottom: -140px;
            background: radial-gradient(circle, rgba(45,120,80,0.55), transparent 70%);
            animation: nf-orb-float 22s ease-in-out infinite reverse;
          }
          @keyframes nf-orb-float {
            0%, 100% { transform: translate(0,0) scale(1); }
            50% { transform: translate(30px,-20px) scale(1.06); }
          }

          .nf-leaf {
            position: absolute;
            top: -40px;
            opacity: 0;
            animation: nf-leaf-fall linear infinite;
            will-change: transform, opacity;
          }
          @keyframes nf-leaf-fall {
            0%   { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
            10%  { opacity: 0.9; }
            90%  { opacity: 0.85; }
            100% { transform: translateY(110vh) translateX(calc(var(--drift,1) * 80px)) rotate(420deg); opacity: 0; }
          }

          .nf-particle {
            position: absolute;
            border-radius: 9999px;
            background: radial-gradient(circle, #fff2c2 0%, #e2c866 55%, transparent 75%);
            box-shadow: 0 0 10px rgba(226,200,102,0.7);
            animation: nf-particle-pulse 5s ease-in-out infinite;
            opacity: 0;
          }
          @keyframes nf-particle-pulse {
            0%, 100% { opacity: 0; transform: scale(0.6); }
            50%      { opacity: 0.9; transform: scale(1.2); }
          }

          .nf-seal {
            animation: nf-seal-glow 5s ease-in-out infinite;
          }
          @keyframes nf-seal-glow {
            0%, 100% { opacity: 0.75; transform: translateY(0); }
            50%      { opacity: 1; transform: translateY(-2px); }
          }

          .nf-vine {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0;
            animation: nf-vine-draw 1.4s ease-out 300ms forwards;
          }
          .nf-vine--left  { left: -38px; }
          .nf-vine--right { right: -38px; transform: translateY(-50%) scaleX(-1); }
          @keyframes nf-vine-draw {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @media (min-width: 640px) {
            .nf-vine { width: 60px; height: 120px; }
            .nf-vine--left  { left: -56px; }
            .nf-vine--right { right: -56px; }
          }

          .nf-404 {
            background-image: linear-gradient(
              110deg,
              #b88a2e 0%,
              #c9a646 22%,
              #e2c866 40%,
              #fff2a8 50%,
              #e2c866 60%,
              #c9a646 78%,
              #b88a2e 100%
            );
            background-size: 240% 100%;
            background-position: 120% 0;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 0 24px rgba(226,200,102,0.28));
            animation: nf-gold-sheen 6s ease-in-out infinite;
            margin: 0;
          }
          @keyframes nf-gold-sheen {
            0%   { background-position: 120% 0; }
            45%  { background-position: -40% 0; }
            100% { background-position: -40% 0; }
          }

          .nf-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 48px;
            min-width: 160px;
            padding: 14px 28px;
            border-radius: 9999px;
            font-family: 'DM Sans', sans-serif;
            font-weight: 600;
            font-size: 13px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, color 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          .nf-btn:hover { transform: translateY(-2px); }
          .nf-btn:focus-visible {
            outline: 2px solid #e2c866;
            outline-offset: 3px;
          }
          .nf-btn--primary {
            color: #0a2218;
            background: linear-gradient(135deg, #c9a646 0%, #e2c866 50%, #b88a2e 100%);
            box-shadow: 0 10px 28px rgba(201,166,70,0.32), inset 0 1px 0 rgba(255,255,255,0.32);
          }
          .nf-btn--primary:hover {
            box-shadow: 0 16px 36px rgba(201,166,70,0.45), inset 0 1px 0 rgba(255,255,255,0.4);
          }
          .nf-btn-shimmer {
            position: absolute;
            inset: 0;
            background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%);
            transform: translateX(-100%);
            animation: nf-btn-shimmer 3.5s ease-in-out infinite;
          }
          @keyframes nf-btn-shimmer {
            0%, 60% { transform: translateX(-100%); }
            80%, 100% { transform: translateX(100%); }
          }
          .nf-btn--secondary {
            color: #e2c866;
            background: transparent;
            border: 1px solid rgba(226,200,102,0.6);
          }
          .nf-btn--secondary:hover {
            background: rgba(226,200,102,0.08);
            border-color: #e2c866;
          }
          .nf-btn--ghost {
            min-width: 0;
            padding: 14px 18px;
            color: rgba(247,241,223,0.7);
            background: transparent;
          }
          .nf-btn--ghost:hover {
            color: #e2c866;
          }

          @media (prefers-reduced-motion: reduce) {
            .nf-reveal,
            .nf-leaf,
            .nf-particle,
            .nf-seal,
            .nf-vine,
            .nf-404,
            .nf-btn-shimmer,
            .nf-orb--a,
            .nf-orb--b {
              animation: none !important;
            }
            .nf-reveal { opacity: 1; transform: none; }
            .nf-vine { opacity: 0.9; }
            .nf-404 { background-position: 50% 0; }
          }
        `}</style>
      </main>
    </>
  );
};

export default NotFound;
