import { Link } from "react-router-dom";
import { ShoppingBag, Building2, Mountain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const paths = [
  {
    icon: ShoppingBag,
    title: "Retail Wellness",
    audience: "For Wellness Seekers",
    description:
      "Shop our full catalog of liquid tinctures, capsules, powders, and traditional teas. Each formulation crafted with natural herbs from St. Lucia's volcanic soil.",
    features: [
      "Ships in 3 business days",
      "Local St. Lucia delivery",
      "Edu-commerce product pages",
      "WhatsApp consultation",
    ],
    cta: "Browse Remedies",
    route: "/shop",
    color: "hsl(75, 26%, 53%)",
    bgGradient: "from-[hsl(75,26%,53%)]/10 via-transparent to-transparent",
  },
  {
    icon: Building2,
    title: "Professional Supply",
    audience: "For Practitioners & Retailers",
    description:
      "Access wholesale pricing with graduate volume discounts. Full COA documentation, bulk packaging, and dedicated account support for your dispensary or practice.",
    features: [
      "10-25% volume discounts",
      "COA documentation included",
      "Miami warehouse fulfillment",
      "Private labeling available",
    ],
    cta: "Access Wholesale Portal",
    route: "/wholesale",
    color: "hsl(39, 55%, 50%)",
    bgGradient: "from-[hsl(39,55%,50%)]/10 via-transparent to-transparent",
  },
  {
    icon: Mountain,
    title: "Immersive Retreats",
    audience: "For Transformation Seekers",
    description:
      "Experience medically-informed cellular detox at our rainforest centre. Group immersions or personalized solo retreats guided by Master Herbalist Priest Kailash.",
    features: [
      "7-day group immersions",
      "3-14 day solo retreats",
      "Pre-arrival protocols",
      "Post-retreat formulations",
    ],
    cta: "Check Availability",
    route: "/retreats",
    color: "hsl(200, 25%, 55%)",
    bgGradient: "from-[hsl(200,25%,55%)]/10 via-transparent to-transparent",
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

export function ReSegmentation() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const y3 = useTransform(scrollYProgress, [0, 1], [70, -70]);

  const parallaxValues = [y1, y2, y3];

  return (
    <section ref={sectionRef} className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Organic blob backgrounds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(75, 26%, 53%) 0%, transparent 70%)" }}
        />
        <div 
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(39, 55%, 50%) 0%, transparent 70%)" }}
        />
      </div>

      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="section-header mb-4">Choose Your Path</h2>
          <p className="section-subheader mx-auto">
            Three distinct journeys, one mission: restoring cellular wellness
            through traditional St. Lucian herbal medicine.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {paths.map((path, index) => {
            const Icon = path.icon;
            return (
              <motion.div
                key={path.route}
                style={{ y: parallaxValues[index] }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <motion.div
                  className={`group relative bg-gradient-to-br ${path.bgGradient} bg-card rounded-2xl border border-border p-8 transition-all duration-500 hover:shadow-xl h-full`}
                  whileHover={{ 
                    y: -8,
                    borderColor: path.color,
                  }}
                >
                  {/* Hover glow */}
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      boxShadow: `0 20px 60px -20px ${path.color}40`,
                    }}
                  />

                  {/* Icon */}
                  <motion.div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300"
                    style={{ 
                      background: `${path.color}20`,
                    }}
                    variants={iconVariants}
                    initial="initial"
                    whileHover="hover"
                  >
                    <Icon 
                      className="w-7 h-7 transition-colors duration-300" 
                      style={{ color: path.color }}
                    />
                  </motion.div>

                  {/* Audience badge */}
                  <div 
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                    style={{ 
                      background: `${path.color}15`,
                      color: path.color,
                    }}
                  >
                    {path.audience}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {path.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {path.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-8">
                    {path.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-foreground"
                      >
                        <span 
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: path.color }}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link to={path.route}>
                    <Button 
                      className="w-full group/btn"
                      style={{
                        background: path.color,
                        color: "white",
                      }}
                    >
                      {path.cta}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
