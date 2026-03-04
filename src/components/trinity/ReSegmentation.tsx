import { Link } from "react-router-dom";
import { ShoppingBag, Building2, Mountain, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import heroFarm from "@/assets/hero-farm.jpg";
import wholesaleHero from "@/assets/wholesale-hero.jpg";
import retreatHero from "@/assets/retreat-hero-yoga.jpg";

const paths = [
  {
    icon: ShoppingBag,
    title: "Retail Wellness",
    description: "Shop our full catalog of liquid tinctures, capsules, powders, and traditional teas.",
    cta: "Browse Remedies",
    route: "/shop",
    image: heroFarm,
  },
  {
    icon: Building2,
    title: "Professional Supply",
    description: "Access wholesale pricing with volume discounts. Full COA documentation and bulk packaging.",
    cta: "Access Wholesale Portal",
    route: "/wholesale",
    image: wholesaleHero,
  },
  {
    icon: Mountain,
    title: "Immersive Retreats",
    description: "Experience medically-informed cellular detox at our rainforest centre in Saint Lucia.",
    cta: "Check Availability",
    route: "/retreats",
    image: retreatHero,
  },
];

export function ReSegmentation() {
  return (
    <section className="py-24 md:py-28" style={{ background: '#0f0f0d' }}>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 44px)', color: '#f2ead8', marginBottom: '16px' }}>
            Choose Your Path
          </h2>
          <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '16px', color: '#8a8070', maxWidth: '600px', margin: '0 auto' }}>
            Three distinct journeys, one mission: restoring cellular wellness through traditional St. Lucian herbal medicine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {paths.map((path, index) => (
            <motion.div
              key={path.route}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Link to={path.route} className="block group">
                <div
                  className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02]"
                  style={{ minHeight: '400px' }}
                >
                  {/* Background image */}
                  <img
                    src={path.image}
                    alt={path.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/40 to-transparent group-hover:from-[#0a0a0a]/80 transition-all duration-500" />

                  {/* Content at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '28px', color: '#f2ead8', marginBottom: '8px' }}>
                      {path.title}
                    </h3>
                    <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '14px', color: '#f2ead8', opacity: 0.8, marginBottom: '16px', lineHeight: 1.6 }}>
                      {path.description}
                    </p>
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300" style={{ border: '1px solid #c9a84c', color: '#c9a84c', background: 'transparent', fontFamily: "'Jost', sans-serif", fontWeight: 500 }}>
                      {path.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
