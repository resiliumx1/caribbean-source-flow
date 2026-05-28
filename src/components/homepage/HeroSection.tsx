import { Link } from "react-router-dom";
import {
  ArrowRight,
  ClipboardList,
  ShoppingBag,
  Mountain,
  GraduationCap,
  Award,
  Truck,
  FileCheck,
  Users,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import priestPhoto from "@/assets/priest-kailash-host.webp";
import pillarWholesale from "@/assets/pillar-wholesale.webp";
import pillarApothecary from "@/assets/pillar-apothecary.webp";
import pillarRetreat from "@/assets/pillar-retreat.webp";
import pillarSchool from "@/assets/pillar-school.webp";

const pillars = [
  {
    title: "Professional Supply",
    description: "Clinical formulations for practitioners & retailers",
    cta: "Partner With Us",
    route: "/wholesale",
    image: pillarWholesale,
    icon: ClipboardList,
  },
  {
    title: "The Apothecary",
    description: "Hand-crafted remedies for personal use",
    cta: "Shop Remedies",
    route: "/shop",
    image: pillarApothecary,
    icon: ShoppingBag,
  },
  {
    title: "Sacred Immersions",
    description: "Seven-day stress recovery retreats",
    cta: "Reserve Dates",
    route: "/retreats",
    image: pillarRetreat,
    icon: Mountain,
  },
  {
    title: "Herbal Physician School",
    description: "Master-level clinical certification",
    cta: "Start Training",
    route: "https://mount-kailash-school-temp.netlify.app",
    external: true,
    image: pillarSchool,
    icon: GraduationCap,
  },
] as const;

/** Decorative botanical corner flourish */
const CornerFlourish = ({
  className = "",
  flipX = false,
  flipY = false,
}: {
  className?: string;
  flipX?: boolean;
  flipY?: boolean;
}) => (
  <svg
    aria-hidden
    viewBox="0 0 60 60"
    className={className}
    style={{ transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})` }}
  >
    <defs>
      <linearGradient id="cornerGold" x1="0" y1="0" x2="60" y2="60">
        <stop offset="0%" stopColor="#c9a646" />
        <stop offset="50%" stopColor="#e2c866" />
        <stop offset="100%" stopColor="#b88a2e" />
      </linearGradient>
    </defs>
    <path
      d="M2 2 C 18 6, 30 18, 34 34 M 10 4 C 14 8, 18 10, 22 11 M 18 4 C 20 9, 23 12, 27 14 M 6 10 C 9 13, 12 17, 14 22"
      fill="none"
      stroke="url(#cornerGold)"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <circle cx="34" cy="34" r="1.4" fill="#e2c866" />
  </svg>
);

const GoldParticles = () => {
  const particles = [
    { left: "8%", top: "12%", delay: 0, size: 3 },
    { left: "92%", top: "20%", delay: 1.8, size: 2 },
    { left: "14%", top: "78%", delay: 3.1, size: 2.5 },
    { left: "88%", top: "84%", delay: 0.6, size: 3 },
    { left: "50%", top: "6%", delay: 2.2, size: 2 },
    { left: "96%", top: "55%", delay: 4, size: 2.5 },
  ];
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none z-30">
      {particles.map((p, i) => (
        <span
          key={i}
          className="hero-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

function PillarCard({ pillar, index }: { pillar: (typeof pillars)[number]; index: number }) {
  const IconComp = pillar.icon;
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const isExternal = "external" in pillar && pillar.external;

  const inner = (
    <>
      <div className="pillar-border-glow absolute inset-0 rounded-2xl pointer-events-none z-20" />
      <img
        src={pillar.image}
        alt={`${pillar.title} — ${pillar.description}`}
        className="pillar-img absolute right-0 top-0 h-full w-3/4 object-cover object-right transition-transform duration-700 ease-out"
        loading={index === 0 ? "eager" : "lazy"}
        {...(index === 0 ? { fetchPriority: "high" as const } : {})}
        width={643}
        height={388}
      />
      <div
        className="absolute inset-0 z-[5]"
        style={{
          background:
            "linear-gradient(to right, rgba(9,37,27,0.96) 0%, rgba(9,37,27,0.92) 45%, rgba(9,37,27,0.55) 70%, rgba(9,37,27,0.15) 100%)",
        }}
      />
      <div
        className="absolute inset-0 z-[6]"
        style={{
          background:
            "radial-gradient(120% 120% at 0% 0%, rgba(201,166,70,0.10) 0%, transparent 40%)",
        }}
      />
      <div className="pillar-inset absolute inset-[6px] rounded-[14px] pointer-events-none z-10" />
      <CornerFlourish
        className="absolute top-2 right-2 w-7 h-7 z-[11] opacity-70 group-hover:opacity-100 transition-opacity duration-500"
        flipX
      />
      <CornerFlourish
        className="absolute bottom-2 left-2 w-7 h-7 z-[11] opacity-70 group-hover:opacity-100 transition-opacity duration-500"
        flipY
      />
      <div className="relative z-[12] w-[62%] h-full flex flex-col justify-center p-4 lg:p-5">
        <span
          className="inline-flex items-center justify-center w-8 h-8 rounded-full mb-2"
          style={{
            background:
              "linear-gradient(135deg, rgba(201,166,70,0.28), rgba(226,200,102,0.08))",
            border: "1px solid rgba(226,200,102,0.55)",
            boxShadow:
              "inset 0 0 0 1px rgba(247,241,223,0.06), 0 4px 12px rgba(0,0,0,0.25)",
          }}
        >
          <IconComp className="w-[16px] h-[16px]" style={{ color: "#e2c866" }} />
        </span>
        <h3
          className="mb-1 leading-[1.05]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "#f7f1df",
            fontWeight: 600,
            fontSize: "clamp(18px, 1.5vw, 22px)",
            letterSpacing: "-0.005em",
          }}
        >
          {pillar.title}
        </h3>
        <p
          className="mb-3"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: "rgba(216,205,177,0.82)",
            fontWeight: 300,
            fontSize: "12px",
            lineHeight: 1.45,
            letterSpacing: "0.01em",
          }}
        >
          {pillar.description}
        </p>
        <span
          className="pillar-cta inline-flex items-center gap-2 mt-auto self-start px-3 py-1.5 rounded-full overflow-hidden relative"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "11px",
            fontWeight: 600,
            color: "#0a2218",
            background:
              "linear-gradient(135deg, #c9a646 0%, #e2c866 50%, #b88a2e 100%)",
            boxShadow:
              "0 6px 18px rgba(201,166,70,0.32), inset 0 1px 0 rgba(255,255,255,0.32), inset 0 -1px 0 rgba(0,0,0,0.12)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <span className="pillar-cta-shimmer" aria-hidden />
          <span className="relative z-10">{pillar.cta}</span>
          <ArrowRight className="pillar-cta-arrow w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover:translate-x-1.5" />
        </span>
      </div>
    </>
  );

  const sharedClassName =
    "pillar-card group relative overflow-hidden rounded-2xl block transition-all duration-500 min-h-[150px]";
  const sharedStyle = {
    background:
      "linear-gradient(135deg, #0a2218 0%, #09251b 60%, #0f3a2a 100%)",
  } as const;

  if (isExternal) {
    return (
      <a
        ref={cardRef as unknown as React.Ref<HTMLAnchorElement>}
        href={pillar.route}
        target="_blank"
        rel="noopener noreferrer"
        className={sharedClassName}
        style={sharedStyle}
        data-drawn={drawn}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link
      ref={cardRef}
      to={pillar.route}
      className={sharedClassName}
      style={sharedStyle}
      data-drawn={drawn}
    >
      {inner}
    </Link>
  );
}

const trustItems = [
  { icon: Award, label: "Featured by St. Lucia Tourism" },
  { icon: Truck, label: "3-Day US Delivery" },
  { icon: FileCheck, label: "COA Documentation" },
  { icon: Users, label: "500+ Physicians Trained" },
  { icon: Clock, label: "21+ Years Clinical Practice" },
  { icon: ShieldCheck, label: "Secure & Trusted" },
];

export function HeroSection() {
  return (
    <section
      className="relative flex flex-col hero-viewport-fit overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 80% at 20% 0%, #0f3a2a 0%, #07201a 55%, #061b14 100%)",
      }}
    >
      {/* Ambient orbs */}
      <div aria-hidden className="absolute inset-0 pointer-events-none z-0">
        <span className="hero-ambient-orb hero-ambient-orb--a" />
        <span className="hero-ambient-orb hero-ambient-orb--b" />
      </div>

      <div className="flex-1 min-h-0 flex items-center relative z-[1]">
        <div className="container mx-auto max-w-7xl w-full px-4 sm:px-6 py-4 lg:py-5 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch h-full">
            {/* Left column */}
            <div className="lg:col-span-7 flex flex-col min-w-0 min-h-0">
              <div
                className="w-full mb-4 lg:mb-5 hero-reveal"
                style={{ animationDelay: "120ms" }}
              >
                <h1
                  className="hero-headline"
                  style={{
                    color: "#f7f1df",
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 600,
                    letterSpacing: "-0.025em",
                    lineHeight: 0.95,
                    fontSize: "clamp(40px, min(5.4vw, 9.2vh), 82px)",
                  }}
                >
                  <span className="hero-gold-word">Re</span>claim Your{" "}
                  <span className="hero-gold-word">Balance</span>.
                  <span className="block mt-0.5 lg:mt-1">
                    <span className="hero-gold-word">Re</span>connect with your{" "}
                    <span className="hero-gold-word">essence</span>.
                  </span>
                </h1>
                <p
                  className="mt-3 lg:mt-4"
                  style={{
                    color: "#e2c866",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    fontSize: "clamp(12px, 1.2vw, 18px)",
                  }}
                >
                  Welcome to Mount Kailash.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-h-0 hero-grid min-w-0">
                {pillars.map((pillar, i) => (
                  <PillarCard key={pillar.route} pillar={pillar} index={i} />
                ))}
              </div>
            </div>

            {/* Right column — founder portrait */}
            <div
              className="lg:col-span-5 flex min-w-0 min-h-0 hero-reveal"
              style={{ animationDelay: "260ms" }}
            >
              <div className="hero-frame relative w-full rounded-[22px] overflow-hidden">
                <div className="hero-frame-inner relative rounded-[20px] overflow-hidden">
                  <img
                    src={priestPhoto}
                    alt="Rt Hon Priest Kailash K Leonce at the ridge in Saint Lucia"
                    className="hero-portrait w-full h-full object-cover"
                    style={{ objectPosition: "center top" }}
                    loading="eager"
                    fetchPriority="high"
                    width={600}
                    height={800}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(100% 100% at 50% 30%, transparent 55%, rgba(6,27,20,0.55) 100%), linear-gradient(180deg, transparent 60%, rgba(6,27,20,0.45) 100%)",
                    }}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none rounded-[20px]"
                    style={{
                      boxShadow:
                        "inset 0 0 60px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(247,241,223,0.06)",
                    }}
                  />
                  <CornerFlourish
                    className="absolute top-3 right-3 w-12 h-12 opacity-90"
                    flipX
                  />
                  <CornerFlourish
                    className="absolute bottom-3 left-3 w-12 h-12 opacity-90"
                    flipY
                  />
                  <GoldParticles />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust bar */}
      <div
        className="hero-trustbar shrink-0 relative z-[2] hero-reveal"
        style={{
          animationDelay: "520ms",
          background:
            "linear-gradient(180deg, rgba(9,37,27,0.95) 0%, rgba(7,32,26,0.95) 100%)",
          borderTop: "1px solid rgba(201,166,70,0.45)",
        }}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-2 lg:py-2.5">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
            {trustItems.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 min-h-[24px]">
                <Icon
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: "#e2c866" }}
                  aria-hidden
                />
                <span
                  className="whitespace-nowrap"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#f7f1df",
                  }}
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        .hero-viewport-fit {
          min-height: 100vh;
          height: 100vh;
          padding-top: 72px;
          box-sizing: border-box;
        }
        @media (max-height: 820px) and (min-width: 1024px) {
          .hero-viewport-fit { padding-top: 60px; }
        }
        @media (max-width: 1023px) {
          .hero-viewport-fit {
            min-height: auto;
            height: auto;
            padding-top: 80px;
            overflow: visible;
          }
        }

        .hero-headline { letter-spacing: -0.02em; }
        .hero-gold-word {
          position: relative;
          display: inline-block;
          background-image: linear-gradient(
            110deg,
            #b88a2e 0%,
            #c9a646 22%,
            #e2c866 38%,
            #fff2a8 48%,
            #ffffff 50%,
            #fff2a8 52%,
            #e2c866 62%,
            #c9a646 78%,
            #b88a2e 100%
          );
          background-size: 240% 100%;
          background-position: 120% 0;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          font-style: italic;
          font-weight: 600;
          filter: drop-shadow(0 0 14px rgba(226,200,102,0.22));
          animation: hero-gold-sheen 5s ease-in-out infinite;
        }
        @keyframes hero-gold-sheen {
          0%   { background-position: 120% 0; }
          45%  { background-position: -40% 0; }
          100% { background-position: -40% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-gold-word { animation: none; background-position: 50% 0; }
        }

        @keyframes hero-rise {
          0% { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes hero-scale-in {
          0% { opacity: 0; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); }
        }
        .hero-reveal {
          opacity: 0;
          animation: hero-rise 0.8s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .hero-grid > * {
          opacity: 0;
          animation: hero-rise 0.7s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .hero-grid > *:nth-child(1) { animation-delay: 320ms; }
        .hero-grid > *:nth-child(2) { animation-delay: 420ms; }
        .hero-grid > *:nth-child(3) { animation-delay: 520ms; }
        .hero-grid > *:nth-child(4) { animation-delay: 620ms; }

        .hero-frame {
          background: linear-gradient(135deg, #c9a646 0%, #e2c866 50%, #b88a2e 100%);
          padding: 1.5px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(247,241,223,0.05);
          animation: hero-scale-in 1.1s cubic-bezier(0.22,1,0.36,1) both;
          animation-delay: 260ms;
        }
        .hero-frame-inner { background: #061b14; height: 100%; }
        .hero-portrait { transition: transform 1.2s ease-out; }
        .hero-frame:hover .hero-portrait { transform: scale(1.02); }

        @keyframes particle-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.55; }
          50% { transform: translateY(-10px) scale(1.15); opacity: 0.95; }
        }
        .hero-particle {
          position: absolute;
          border-radius: 9999px;
          background: radial-gradient(circle, #e2c866 0%, rgba(226,200,102,0.4) 60%, transparent 100%);
          box-shadow: 0 0 6px rgba(226,200,102,0.6);
          animation: particle-float 6s ease-in-out infinite;
        }

        .hero-ambient-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(80px);
          opacity: 0.35;
        }
        .hero-ambient-orb--a {
          width: 420px; height: 420px;
          top: -120px; left: -80px;
          background: radial-gradient(circle, rgba(201,166,70,0.25), transparent 70%);
          animation: orb-drift 22s ease-in-out infinite;
        }
        .hero-ambient-orb--b {
          width: 520px; height: 520px;
          bottom: -180px; right: -120px;
          background: radial-gradient(circle, rgba(111,159,122,0.25), transparent 70%);
          animation: orb-drift 28s ease-in-out infinite reverse;
        }
        @keyframes orb-drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(40px, -30px); }
        }

        /* Pillar cards */
        .pillar-card {
          position: relative;
          border: 1px solid rgba(201, 166, 70, 0.45);
          border-radius: 16px;
          isolation: isolate;
        }
        .pillar-inset { border: 1px solid rgba(201, 166, 70, 0.22); }
        .pillar-img { opacity: 0.95; }
        .pillar-card:hover .pillar-img { transform: scale(1.04); opacity: 1; }

        .pillar-border-glow {
          border: 1px solid transparent;
          border-radius: 16px;
          transition: box-shadow 0.5s cubic-bezier(0.4,0,0.2,1), border-color 0.5s ease;
        }

        .pillar-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 17px;
          padding: 1px;
          background: linear-gradient(
            var(--shimmer-angle, 0deg),
            rgba(201,166,70,0.10) 0%,
            rgba(226,200,102,0.65) 25%,
            rgba(247,241,223,0.45) 50%,
            rgba(201,166,70,0.65) 75%,
            rgba(184,138,46,0.10) 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          z-index: 21;
          opacity: 0;
          animation: shimmer-rotate 20s linear infinite;
          pointer-events: none;
        }
        .pillar-card[data-drawn="false"]::before { opacity: 0; }
        .pillar-card[data-drawn="true"]::before {
          animation: border-draw-in 1.2s cubic-bezier(0.4,0,0.2,1) forwards,
                     shimmer-rotate 20s linear 1.2s infinite;
        }
        @keyframes border-draw-in {
          0% { opacity: 0; clip-path: inset(0 100% 100% 0); }
          50% { opacity: 0.8; clip-path: inset(0 0 50% 0); }
          100% { opacity: 1; clip-path: inset(0 0 0 0); }
        }
        @keyframes shimmer-rotate {
          0% { --shimmer-angle: 0deg; }
          100% { --shimmer-angle: 360deg; }
        }
        @supports not (background: paint(something)) {
          .pillar-card::before {
            background: linear-gradient(135deg, rgba(201,166,70,0.18), rgba(226,200,102,0.55) 50%, rgba(184,138,46,0.18));
            background-size: 300% 300%;
            animation: shimmer-slide 8s ease-in-out infinite;
          }
          .pillar-card[data-drawn="true"]::before {
            animation: border-draw-in 1.2s cubic-bezier(0.4,0,0.2,1) forwards,
                       shimmer-slide 8s ease-in-out 1.2s infinite;
          }
        }
        @keyframes shimmer-slide {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .pillar-card:hover {
          transform: translateY(-5px);
          border-color: rgba(226, 200, 102, 0.85);
          box-shadow: 0 0 28px rgba(201,166,70,0.32), 0 14px 40px rgba(0,0,0,0.45);
        }
        .pillar-card:hover::before { opacity: 1; animation-duration: 4s; }
        .pillar-card:hover .pillar-border-glow {
          box-shadow: 0 0 32px rgba(226, 200, 102, 0.35);
        }

        .pillar-cta { position: relative; }
        .pillar-cta-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%);
          transform: translateX(-120%);
          transition: transform 0.7s ease;
          z-index: 1;
        }
        .pillar-card:hover .pillar-cta-shimmer { transform: translateX(120%); }

        .pillar-card:nth-child(1) { --draw-delay: 0ms; }
        .pillar-card:nth-child(2) { --draw-delay: 200ms; }
        .pillar-card:nth-child(3) { --draw-delay: 400ms; }
        .pillar-card:nth-child(4) { --draw-delay: 600ms; }
        .pillar-card[data-drawn="true"]::before {
          animation-delay: var(--draw-delay), calc(var(--draw-delay) + 1.2s);
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-reveal, .hero-grid > *, .hero-frame {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
          .hero-particle, .hero-ambient-orb { animation: none !important; }
          .hero-gold-word { animation: none !important; background-position: 50% 0 !important; }
          .pillar-card::before, .pillar-card[data-drawn="true"]::before {
            animation: none !important; opacity: 0.6 !important;
          }
          .pillar-card:hover { transform: none !important; }
          .pillar-card:hover .pillar-img { transform: none !important; }
          .pillar-cta-shimmer { display: none !important; }
        }
      `}</style>
    </section>
  );
}