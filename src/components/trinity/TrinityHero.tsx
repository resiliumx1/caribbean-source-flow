import { Link } from "react-router-dom";
import { Leaf, Package, Mountain, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface CTACard {
  icon: React.ElementType;
  title: string;
  descriptor: string;
  cta: string;
  route: string;
  iconColor: string;
  iconBg: string;
}

const ctaCards: CTACard[] = [
  {
    icon: Leaf,
    title: "Shop Natural Formulations",
    descriptor: "Daily remedies crafted for balance, vitality, and long-term wellness.",
    cta: "Explore Products",
    route: "/shop",
    iconColor: "#1F3A2E",
    iconBg: "rgba(31, 58, 46, 0.12)",
  },
  {
    icon: Package,
    title: "Wholesale & Practitioners",
    descriptor: "Bulk herbs and formulations trusted by clinics, retailers, and wellness brands.",
    cta: "Access Wholesale",
    route: "/wholesale",
    iconColor: "#8B5E34",
    iconBg: "rgba(139, 94, 52, 0.12)",
  },
  {
    icon: Mountain,
    title: "Healing Retreats in Saint Lucia",
    descriptor: "Immersive experiences designed for deep restoration and clarity.",
    cta: "View Retreats",
    route: "/retreats",
    iconColor: "#2E7D32",
    iconBg: "linear-gradient(135deg, rgba(46, 125, 50, 0.15), rgba(30, 136, 229, 0.12), rgba(178, 135, 53, 0.1))",
  },
];

const cardVariants = {
  initial: { y: 0 },
  hover: {
    y: -4,
    transition: { type: "tween" as const, duration: 0.3, ease: "easeOut" as const },
  },
};

const iconVariants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.06,
    y: -2,
    transition: { type: "tween" as const, duration: 0.3, ease: "easeOut" as const },
  },
};

const titleVariants = {
  initial: { y: 0 },
  hover: {
    y: -1,
    transition: { type: "tween" as const, duration: 0.3, ease: "easeOut" as const },
  },
};

const arrowVariants = {
  initial: { x: 0 },
  hover: {
    x: 4,
    transition: { type: "tween" as const, duration: 0.3, ease: "easeOut" as const },
  },
};

// Custom gradient mountain icon component
function GradientMountainIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#mountainGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <defs>
        <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2E7D32" />
          <stop offset="50%" stopColor="#1E88E5" />
          <stop offset="100%" stopColor="#B28735" />
        </linearGradient>
      </defs>
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

export function TrinityHero() {
  return (
    <section className="relative min-h-screen flex flex-col pt-16">
      {/* Background Video with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(150,30%,8%)]/90 via-[hsl(150,25%,12%)]/75 to-[hsl(150,30%,8%)]/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-4 py-20 md:py-32">
        <div className="container mx-auto max-w-6xl">
          {/* Headlines */}
          <div className="text-center mb-12 md:mb-16 animate-fade-in">
            <h1 className="hero-title mb-6" style={{ color: "hsl(39, 70%, 65%)" }}>
              Where Natural Wellness Finds Its Source
            </h1>
            <p className="hero-subtitle max-w-4xl mx-auto" style={{ color: "hsl(45, 30%, 90%)" }}>
              Crafted in Saint Lucia using herbs grown in mineral-rich volcanic soil, 
              Mt. Kailash delivers natural formulations, immersive retreats, and trusted 
              wholesale supply—designed to restore balance at every level.
            </p>
          </div>

          {/* Professional CTA Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {ctaCards.map((card, index) => {
              const isRetreats = card.route === "/retreats";
              
              return (
                <Link key={card.route} to={card.route}>
                  <motion.div
                    className="group relative overflow-hidden rounded-2xl p-6 md:p-8 cursor-pointer h-full"
                    style={{
                      background: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                      boxShadow: "0 4px 20px -4px rgba(0, 0, 0, 0.08)",
                    }}
                    variants={cardVariants}
                    initial="initial"
                    whileHover="hover"
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onHoverStart={() => {}}
                    onHoverEnd={() => {}}
                  >
                    {/* Hover state border and shadow enhancement */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      style={{
                        border: "1px solid rgba(0, 0, 0, 0.2)",
                        boxShadow: "0 8px 30px -8px rgba(0, 0, 0, 0.15)",
                      }}
                    />

                    {/* Icon Chip */}
                    <motion.div
                      className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
                      style={{
                        background: typeof card.iconBg === 'string' && card.iconBg.includes('gradient') 
                          ? card.iconBg 
                          : card.iconBg,
                      }}
                      variants={iconVariants}
                    >
                      {isRetreats ? (
                        <GradientMountainIcon className="w-7 h-7" />
                      ) : (
                        <card.icon 
                          className="w-7 h-7" 
                          style={{ color: card.iconColor }}
                          strokeWidth={2}
                        />
                      )}
                    </motion.div>

                    {/* Content */}
                    <motion.h2 
                      className="text-xl md:text-2xl font-bold mb-3"
                      style={{ color: "#1a1a1a" }}
                      variants={titleVariants}
                    >
                      {card.title}
                    </motion.h2>
                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                      {card.descriptor}
                    </p>

                    {/* CTA Link */}
                    <div className="flex items-center gap-2 font-semibold text-primary">
                      {card.cta}
                      <motion.span variants={arrowVariants} className="inline-flex">
                        <ArrowRight className="w-5 h-5" />
                      </motion.span>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="relative z-10 bg-secondary/95 backdrop-blur-sm py-4 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-secondary-foreground/90">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              21+ Years Clinical Practice
            </span>
            <span className="hidden md:inline text-secondary-foreground/40">|</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Certified Processing Facility
            </span>
            <span className="hidden md:inline text-secondary-foreground/40">|</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Featured by St. Lucia Tourism Authority
            </span>
            <span className="hidden md:inline text-secondary-foreground/40">|</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Miami Warehouse (3-Day US)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
