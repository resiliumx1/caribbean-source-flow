import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Package, ArrowRight } from "lucide-react";

type CtaCardProps = {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  iconBgClass: string;
  linkText: string;
};

function CtaCard({
  href,
  title,
  desc,
  icon,
  iconBgClass,
  linkText,
}: CtaCardProps) {
  return (
    <Link to={href} className="block h-full">
      <motion.div
        className="group relative h-full rounded-2xl bg-card/95 backdrop-blur-sm p-6 md:p-8 cursor-pointer overflow-hidden border border-border hover:shadow-elevated transition-shadow"
        style={{
          boxShadow: "var(--shadow-soft)",
        }}
        initial={{ y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
      >
        {/* Icon chip */}
        <motion.div
          className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-5 ${iconBgClass}`}
          initial={{ scale: 1, y: 0 }}
          whileHover={{ scale: 1.06, y: -2 }}
          transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
        >
          {icon}
        </motion.div>

        {/* Text */}
        <div className="space-y-3">
          <motion.h3
            className="text-xl md:text-2xl font-bold text-card-foreground"
            initial={{ y: 0, opacity: 1 }}
            whileHover={{ y: -1 }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
          >
            {title}
          </motion.h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {desc}
          </p>
        </div>

        {/* Link */}
        <div className="mt-6 flex items-center gap-2 font-semibold text-primary">
          <span className="group-hover:underline underline-offset-2">
            {linkText}
          </span>
          <motion.span
            className="inline-flex"
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
          >
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </motion.span>
        </div>

        {/* Subtle corner sheen (professional, not gamey) */}
        <div 
          className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none"
          style={{
            background: "radial-gradient(circle at top right, currentColor, transparent 70%)",
          }}
        />
      </motion.div>
    </Link>
  );
}

// Custom gradient mountain icon
function GradientMountainIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#heroMountainGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <defs>
        <linearGradient id="heroMountainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="50%" stopColor="hsl(var(--secondary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
      </defs>
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
        icon={<Leaf className="w-7 h-7 text-primary" />}
        iconBgClass="bg-primary/10"
        linkText="Explore Products →"
      />

      <CtaCard
        href="/wholesale"
        title="Wholesale & Practitioners"
        desc="Bulk herbs and formulations trusted by clinics, retailers, and wellness brands."
        icon={<Package className="w-7 h-7 text-accent" />}
        iconBgClass="bg-accent/10"
        linkText="Access Wholesale →"
      />

      <CtaCard
        href="/retreats"
        title="Healing Retreats in Saint Lucia"
        desc="Immersive experiences designed for deep restoration and clarity."
        icon={<GradientMountainIcon className="w-7 h-7" />}
        iconBgClass="bg-secondary/30"
        linkText="View Retreats →"
      />
    </div>
  );
}
