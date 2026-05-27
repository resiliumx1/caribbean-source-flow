import { motion, useReducedMotion } from "framer-motion";
import { Star, Award, GraduationCap, FileCheck, Sparkles } from "lucide-react";

// Sacred Apothecary Luxury palette
const C = {
  bg: "#061b14",
  bgDeep: "#04140e",
  cardGradFrom: "#09251b",
  cardGradTo: "#0f3a2a",
  gold: "#c9a646",
  goldBright: "#e2c866",
  goldSoft: "rgba(201,166,70,0.6)",
  ivory: "#f7f1df",
  cream: "#d8cdb1",
  herb: "#6f9f7a",
};

type Motif = "mortar" | "bottles" | "tincture";

interface Testimonial {
  name: string;
  initials: string;
  subtext: string;
  quote: string;
  badges: string[];
  motif: Motif;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Jennifer Liu",
    initials: "JL",
    subtext: "Yoga Instructor, Vancouver",
    quote:
      "The cellular detox was intense but transformative. I lost 12 pounds of inflammation and my skin cleared completely.",
    badges: ["Eczema, digestive issues", "Clear skin for first time in 15 years"],
    motif: "mortar",
  },
  {
    name: "David R.",
    initials: "DR",
    subtext: "Houston, TX",
    quote:
      "I was skeptical but Virility worked. Energy, focus, everything improved. Ordering my third bottle.",
    badges: ["Energy & focus improved"],
    motif: "bottles",
  },
  {
    name: "Keisha M.",
    initials: "KM",
    subtext: "Brooklyn, NY",
    quote:
      "The Answer tincture gave me relief in 10 days. This is real medicine, not watered-down supplements. I can feel the difference.",
    badges: ["Relief in 10 days"],
    motif: "tincture",
  },
];

/* ---------- Decorative SVGs ---------- */

const CornerVine = ({ flipX = false, flipY = false }: { flipX?: boolean; flipY?: boolean }) => (
  <svg
    viewBox="0 0 120 120"
    width="96"
    height="96"
    className="sa-corner-vine pointer-events-none absolute"
    style={{
      transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
      color: C.gold,
    }}
    aria-hidden="true"
  >
    <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.85">
      <path d="M6 6 L6 46" />
      <path d="M6 6 L46 6" />
      <path d="M6 6 Q34 12 50 32 Q60 46 78 50" className="sa-vine-grow" />
      <path d="M6 6 Q12 34 32 50 Q46 60 50 78" className="sa-vine-grow" />
      {/* leaves */}
      <path d="M22 18 q6 -8 14 -4 q-4 8 -14 4 z" fill="currentColor" fillOpacity="0.35" />
      <path d="M18 22 q-8 6 -4 14 q8 -4 4 -14 z" fill="currentColor" fillOpacity="0.35" />
      <path d="M44 30 q8 -2 12 6 q-8 4 -12 -6 z" fill="currentColor" fillOpacity="0.3" />
      <path d="M30 44 q-2 8 6 12 q4 -8 -6 -12 z" fill="currentColor" fillOpacity="0.3" />
      <circle cx="50" cy="50" r="1.4" fill="currentColor" />
      <circle cx="60" cy="38" r="0.9" fill="currentColor" />
      <circle cx="38" cy="60" r="0.9" fill="currentColor" />
    </g>
  </svg>
);

const CardCrest = () => (
  <svg viewBox="0 0 80 40" width="56" height="28" aria-hidden="true" style={{ color: C.gold }}>
    <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      <path d="M40 6 L40 30" />
      <path d="M40 12 q-8 2 -12 12" fill="currentColor" fillOpacity="0.35" />
      <path d="M40 12 q8 2 12 12" fill="currentColor" fillOpacity="0.35" />
      <path d="M40 20 q-6 0 -9 8" fill="currentColor" fillOpacity="0.25" />
      <path d="M40 20 q6 0 9 8" fill="currentColor" fillOpacity="0.25" />
      <circle cx="40" cy="6" r="1.6" fill="currentColor" />
      <path d="M14 32 L34 32" opacity="0.6" />
      <path d="M46 32 L66 32" opacity="0.6" />
    </g>
  </svg>
);

const EyebrowOrnament = ({ flip = false }: { flip?: boolean }) => (
  <svg
    viewBox="0 0 80 16"
    width="80"
    height="16"
    aria-hidden="true"
    style={{ color: C.gold, transform: flip ? "scaleX(-1)" : "none" }}
  >
    <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      <path d="M2 8 L52 8" />
      <path d="M52 8 l-6 -3 M52 8 l-6 3" />
      <path d="M60 4 q4 4 0 8 q-4 -4 0 -8 z" fill="currentColor" fillOpacity="0.7" />
      <path d="M68 6 q3 2 0 4 q-3 -2 0 -4 z" fill="currentColor" fillOpacity="0.5" />
    </g>
  </svg>
);

/* ---------- Floating leaves background ---------- */

const Leaf = ({ delay = 0, x = 10, dur = 22, size = 14, hue = C.herb }: any) => (
  <span
    className="sa-leaf"
    style={
      {
        left: `${x}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${dur}s`,
        width: size,
        height: size,
        color: hue,
      } as React.CSSProperties
    }
    aria-hidden="true"
  >
    <svg viewBox="0 0 20 20" width={size} height={size}>
      <path d="M2 18 Q4 4 18 2 Q16 16 2 18 Z M2 18 Q10 12 18 2" fill="currentColor" fillOpacity="0.55" stroke="currentColor" strokeWidth="0.6" />
    </svg>
  </span>
);

const GoldSpeck = ({ x, y, delay, size = 3 }: any) => (
  <span
    className="sa-speck"
    style={
      {
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        animationDelay: `${delay}s`,
      } as React.CSSProperties
    }
    aria-hidden="true"
  />
);

/* ---------- Trust row ---------- */

const TRUST = [
  { icon: Award, label: "21+ Years Clinical Practice" },
  { icon: GraduationCap, label: "500+ Physicians Trained" },
  { icon: FileCheck, label: "COA Documentation" },
  { icon: Sparkles, label: "Featured By St. Lucia Tourism" },
];

/* ---------- Card ---------- */

function TestimonialCard({ t, i }: { t: Testimonial; i: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      className="sa-card group relative rounded-[24px]"
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: 0.15 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Ornate gold border layer */}
      <div className="sa-card-border" aria-hidden="true" />

      {/* Inner panel */}
      <div
        className="sa-card-inner relative rounded-[22px] px-7 py-8 md:px-8 md:py-10 h-full flex flex-col items-center text-center"
      >
        {/* Corner vines */}
        <div className="absolute top-0 left-0"><CornerVine /></div>
        <div className="absolute top-0 right-0"><CornerVine flipX /></div>
        <div className="absolute bottom-0 left-0"><CornerVine flipY /></div>
        <div className="absolute bottom-0 right-0"><CornerVine flipX flipY /></div>

        {/* Top crest */}
        <div className="mb-4 -mt-1 opacity-90"><CardCrest /></div>

        {/* Avatar */}
        <div className="sa-avatar-ring mb-5">
          <img
            src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(
              t.avatarSeed
            )}&backgroundColor=${t.avatarBg}&radius=50`}
            alt={t.name}
            width={64}
            height={64}
            loading="lazy"
          />
        </div>

        <h3
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: "26px",
            color: C.ivory,
            letterSpacing: "0.01em",
          }}
        >
          {t.name}
        </h3>
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "13px",
            color: C.gold,
            letterSpacing: "0.04em",
            marginTop: 2,
          }}
        >
          {t.subtext}
        </p>

        {/* Stars */}
        <div className="flex gap-1 my-4" aria-label="5 out of 5 stars">
          {[...Array(5)].map((_, idx) => (
            <Star key={idx} className="w-4 h-4" style={{ color: C.gold, fill: C.gold }} />
          ))}
        </div>

        {/* Divider */}
        <div
          className="my-1"
          style={{
            width: 36,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${C.goldSoft}, transparent)`,
          }}
        />

        {/* Quote */}
        <p
          className="mt-4"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "18px",
            lineHeight: 1.65,
            color: C.ivory,
            maxWidth: "32ch",
          }}
        >
          &ldquo;{t.quote}&rdquo;
        </p>

        {/* Badges */}
        {t.badges.length > 0 && (
          <div className="mt-6 flex flex-col gap-2 items-center">
            {t.badges.map((b, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full"
                style={{
                  border: `1px solid ${C.goldSoft}`,
                  background: "rgba(201,166,70,0.06)",
                  color: C.cream,
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 12,
                  letterSpacing: "0.02em",
                }}
              >
                <span style={{ color: C.gold }}>{idx === 0 ? "❋" : "✓"}</span>
                {b}
              </span>
            ))}
          </div>
        )}

        {/* Hover shimmer specks */}
        <span className="sa-card-shimmer" aria-hidden="true" />
      </div>
    </motion.article>
  );
}

/* ---------- Section ---------- */

export function SocialProofMatrix() {
  const reduce = useReducedMotion();

  return (
    <section
      className="sa-section relative overflow-hidden py-24 md:py-32"
      aria-label="Customer testimonials"
      style={{
        background: `
          radial-gradient(1100px 600px at 20% 0%, rgba(111,159,122,0.10), transparent 60%),
          radial-gradient(900px 500px at 85% 100%, rgba(201,166,70,0.08), transparent 60%),
          linear-gradient(180deg, ${C.bgDeep} 0%, ${C.bg} 50%, ${C.bgDeep} 100%)
        `,
      }}
    >
      {/* Background botanical pattern */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        style={{ opacity: 0.06, color: C.herb }}
      >
        <defs>
          <pattern id="sa-botanical" x="0" y="0" width="160" height="160" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="0.6">
              <path d="M20 80 Q40 40 80 20" />
              <path d="M80 20 q4 -6 12 -4 q-2 8 -12 4" fill="currentColor" fillOpacity="0.4" />
              <path d="M140 140 Q120 100 80 140" />
              <circle cx="40" cy="120" r="1.5" />
              <circle cx="120" cy="60" r="1.5" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sa-botanical)" />
      </svg>

      {/* Soft vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Floating leaves */}
      {!reduce && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <Leaf x={6} delay={0} dur={26} size={16} />
          <Leaf x={18} delay={6} dur={32} size={12} hue="#a87b46" />
          <Leaf x={32} delay={3} dur={28} size={14} />
          <Leaf x={48} delay={9} dur={34} size={18} hue={C.gold} />
          <Leaf x={62} delay={2} dur={30} size={12} />
          <Leaf x={78} delay={7} dur={36} size={16} hue="#a87b46" />
          <Leaf x={92} delay={4} dur={28} size={14} />

          <GoldSpeck x={12} y={18} delay={0} />
          <GoldSpeck x={28} y={70} delay={2} size={2} />
          <GoldSpeck x={55} y={12} delay={4} />
          <GoldSpeck x={72} y={62} delay={1} size={2} />
          <GoldSpeck x={88} y={28} delay={3} />
          <GoldSpeck x={45} y={88} delay={5} size={2} />
        </div>
      )}

      <div className="container relative mx-auto max-w-6xl px-4">
        {/* Header */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14 md:mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <EyebrowOrnament />
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 12,
                letterSpacing: "0.32em",
                color: C.gold,
                textTransform: "uppercase",
              }}
            >
              Testimonials
            </span>
            <EyebrowOrnament flip />
          </div>

          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              fontSize: "clamp(2.1rem, 4.5vw, 3.4rem)",
              color: C.ivory,
              letterSpacing: "0.005em",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Real Stories. Real Transformation.
          </h2>
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontSize: 16,
              color: C.cream,
              maxWidth: 560,
              margin: "0 auto",
              lineHeight: 1.65,
            }}
          >
            For over 21 years, we've helped thousands restore their health and reclaim
            their balance naturally.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 md:gap-8">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={t.name} t={t} i={i} />
          ))}
        </div>

        {/* Bottom trust row */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 md:mt-20 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-7">
            <span style={{ color: C.gold }}>❋</span>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 12,
                letterSpacing: "0.28em",
                color: C.gold,
                textTransform: "uppercase",
              }}
            >
              Rooted in Ancient Wisdom. Backed by Modern Science.
            </p>
            <span style={{ color: C.gold }}>❋</span>
          </div>

          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {TRUST.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 13,
                  color: C.cream,
                  letterSpacing: "0.02em",
                }}
              >
                <Icon className="w-4 h-4" style={{ color: C.gold }} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Scoped styles */}
      <style>{`
        .sa-card { position: relative; isolation: isolate; transition: transform 600ms cubic-bezier(0.22,1,0.36,1); }
        .sa-card:hover { transform: translateY(-6px); }

        .sa-card-border {
          position: absolute; inset: 0; border-radius: 24px; padding: 1px;
          background: linear-gradient(160deg, ${C.gold} 0%, rgba(201,166,70,0.15) 28%, rgba(201,166,70,0.08) 50%, rgba(201,166,70,0.25) 75%, ${C.goldBright} 100%);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          opacity: 0.85; transition: opacity 500ms ease, filter 500ms ease;
          pointer-events: none;
        }
        .sa-card:hover .sa-card-border {
          opacity: 1;
          filter: drop-shadow(0 0 14px rgba(226,200,102,0.35));
        }

        .sa-card-inner {
          background:
            radial-gradient(120% 80% at 50% 0%, rgba(201,166,70,0.07), transparent 60%),
            linear-gradient(160deg, ${C.cardGradFrom} 0%, ${C.cardGradTo} 100%);
          box-shadow:
            inset 0 1px 0 rgba(255,235,180,0.06),
            inset 0 0 60px rgba(0,0,0,0.35),
            0 30px 60px -30px rgba(0,0,0,0.6);
        }

        .sa-avatar-ring {
          position: relative; width: 72px; height: 72px; border-radius: 50%;
          display: grid; place-items: center;
          background: radial-gradient(circle, rgba(201,166,70,0.25), transparent 70%);
        }
        .sa-avatar-ring::before {
          content: ""; position: absolute; inset: 0; border-radius: 50%;
          padding: 1.5px;
          background: conic-gradient(from 0deg, ${C.gold}, ${C.goldBright}, ${C.gold}, rgba(201,166,70,0.3), ${C.gold});
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
        }
        .sa-avatar-ring img {
          width: 60px; height: 60px; border-radius: 50%;
          background: #1a3327;
        }

        .sa-corner-vine { stroke-dasharray: 220; stroke-dashoffset: 60; transition: stroke-dashoffset 900ms ease, opacity 500ms ease; opacity: 0.55; }
        .sa-card:hover .sa-corner-vine { stroke-dashoffset: 0; opacity: 0.95; }

        .sa-card-shimmer {
          pointer-events: none; position: absolute; inset: 0; border-radius: 22px;
          background: radial-gradient(2px 2px at 12% 18%, ${C.goldBright}, transparent 60%),
                      radial-gradient(2px 2px at 82% 28%, ${C.goldBright}, transparent 60%),
                      radial-gradient(2px 2px at 22% 82%, ${C.goldBright}, transparent 60%),
                      radial-gradient(2px 2px at 78% 76%, ${C.goldBright}, transparent 60%);
          opacity: 0; transition: opacity 700ms ease;
          filter: blur(0.3px);
        }
        .sa-card:hover .sa-card-shimmer { opacity: 0.75; animation: saShimmer 2.6s ease-in-out infinite; }

        @keyframes saShimmer {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.95; }
        }

        .sa-leaf {
          position: absolute; top: -8%; display: inline-block;
          will-change: transform, opacity;
          animation-name: saLeafFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          opacity: 0.55;
        }
        @keyframes saLeafFall {
          0%   { transform: translate3d(0, -20px, 0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.7; }
          50%  { transform: translate3d(40px, 55vh, 0) rotate(180deg); }
          90%  { opacity: 0.5; }
          100% { transform: translate3d(-30px, 110vh, 0) rotate(360deg); opacity: 0; }
        }

        .sa-speck {
          position: absolute; border-radius: 50%;
          background: radial-gradient(circle, ${C.goldBright}, transparent 70%);
          opacity: 0.4; animation: saSpeck 5s ease-in-out infinite;
        }
        @keyframes saSpeck {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          50%      { opacity: 0.9;  transform: scale(1.15); }
        }

        @media (prefers-reduced-motion: reduce) {
          .sa-leaf, .sa-speck, .sa-card-shimmer { animation: none !important; }
          .sa-card { transition: none; }
          .sa-card:hover { transform: none; }
          .sa-corner-vine { stroke-dashoffset: 0; }
        }
      `}</style>
    </section>
  );
}
