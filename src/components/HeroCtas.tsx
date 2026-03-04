import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Package, ArrowRight } from "lucide-react";

type CtaCardProps = {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  linkText: string;
};

function CtaCard({ href, title, desc, icon, linkText }: CtaCardProps) {
  return (
    <Link to={href} className="block h-full">
      <motion.div
        className="group relative h-full rounded-2xl p-10 cursor-pointer overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(201,168,76,0.3)',
        }}
        initial={{ y: 0 }}
        whileHover={{ y: -4, borderColor: 'rgba(201,168,76,0.7)' }}
        transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
      >
        {/* Icon chip */}
        <motion.div
          className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
          style={{ background: 'rgba(201,168,76,0.1)' }}
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.06 }}
          transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
        >
          {icon}
        </motion.div>

        {/* Text */}
        <div className="space-y-3">
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: '22px', color: '#f2ead8' }}>
            {title}
          </h3>
          <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: '14px', color: '#8a8070', lineHeight: 1.6 }}>
            {desc}
          </p>
        </div>

        {/* Link */}
        <div className="mt-6 flex items-center gap-2 font-semibold" style={{ color: '#c9a84c', fontFamily: "'Jost', sans-serif", fontWeight: 400 }}>
          <span className="group-hover:underline underline-offset-2">
            {linkText}
          </span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </div>
      </motion.div>
    </Link>
  );
}

function GradientMountainIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

export default function HeroCtas() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      <CtaCard
        href="/shop"
        title="Shop Natural Formulations"
        desc="Daily remedies crafted for balance, vitality, and long-term wellness."
        icon={<Leaf className="w-10 h-10" style={{ color: '#c9a84c' }} />}
        linkText="Explore Products →"
      />
      <CtaCard
        href="/wholesale"
        title="Wholesale & Practitioners"
        desc="Bulk herbs and formulations trusted by clinics, retailers, and wellness brands."
        icon={<Package className="w-10 h-10" style={{ color: '#c9a84c' }} />}
        linkText="Access Wholesale →"
      />
      <CtaCard
        href="/retreats"
        title="Healing Retreats in Saint Lucia"
        desc="Immersive experiences designed for deep restoration and clarity."
        icon={<GradientMountainIcon className="w-10 h-10" />}
        linkText="View Retreats →"
      />
    </div>
  );
}
