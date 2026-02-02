import { Link } from "react-router-dom";
import { Leaf, Package, Mountain, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface CTACard {
  icon: React.ElementType;
  title: string;
  descriptor: string;
  cta: string;
  route: string;
}

const ctaCards: CTACard[] = [
  {
    icon: Leaf,
    title: "Shop Natural Formulations",
    descriptor: "Daily remedies crafted for balance, vitality, and long-term wellness.",
    cta: "Explore Products",
    route: "/shop",
  },
  {
    icon: Package,
    title: "Wholesale & Practitioners",
    descriptor: "Bulk herbs and formulations trusted by clinics, retailers, and wellness brands.",
    cta: "Access Wholesale",
    route: "/wholesale",
  },
  {
    icon: Mountain,
    title: "Healing Retreats at Mount Kailash Rejuvenation Centre Saint Lucia",
    descriptor: "Immersive experiences designed for deep restoration and clarity.",
    cta: "View Retreats",
    route: "/retreats",
  },
];

const iconVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.15,
    rotate: 5,
    transition: { type: "spring" as const, stiffness: 400, damping: 10 },
  },
};

const cardVariants = {
  initial: { y: 0 },
  hover: {
    y: -8,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

const textVariants = {
  initial: { y: 0 },
  hover: {
    y: -4,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

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

          {/* Glass CTA Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {ctaCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Link key={card.route} to={card.route}>
                  <motion.div
                    className="group relative overflow-hidden rounded-2xl backdrop-blur-xl border-2 p-6 md:p-8 transition-all duration-300 cursor-pointer h-full"
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      borderColor: "rgba(255, 255, 255, 0.15)",
                    }}
                    variants={cardVariants}
                    initial="initial"
                    whileHover="hover"
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Hover glow effect */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: "radial-gradient(circle at 50% 50%, hsla(39, 55%, 45%, 0.15) 0%, transparent 70%)",
                      }}
                    />
                    
                    {/* Border glow on hover */}
                    <div 
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        boxShadow: "inset 0 0 0 2px hsla(39, 55%, 45%, 0.5), 0 20px 40px -12px hsla(39, 55%, 45%, 0.25)",
                      }}
                    />

                    {/* Icon */}
                    <motion.div
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 transition-colors duration-300"
                      style={{
                        background: "hsla(39, 55%, 45%, 0.2)",
                      }}
                      variants={iconVariants}
                    >
                      <Icon 
                        className="w-8 h-8 transition-colors duration-300" 
                        style={{ color: "hsl(39, 55%, 55%)" }}
                      />
                    </motion.div>

                    {/* Content */}
                    <motion.div variants={textVariants}>
                      <h2 className="text-xl md:text-2xl font-bold text-background mb-3">
                        {card.title}
                      </h2>
                      <p className="text-background/75 mb-6 text-sm leading-relaxed">
                        {card.descriptor}
                      </p>
                    </motion.div>

                    {/* CTA */}
                    <div className="flex items-center gap-2 font-semibold group-hover:gap-3 transition-all duration-300" style={{ color: "hsl(39, 55%, 55%)" }}>
                      {card.cta}
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
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
