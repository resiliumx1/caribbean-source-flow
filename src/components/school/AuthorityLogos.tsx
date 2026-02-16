import { motion } from "framer-motion";

const logos = [
  { name: "Seal of the Prime Minister of Saint Lucia", url: "https://schools.mountkailashslu.com/wp-content/uploads/2024/09/pm-seal-stlucia.png" },
  { name: "Johns Hopkins University", url: "https://schools.mountkailashslu.com/wp-content/uploads/2024/09/johns-hopkins-logo.png" },
  { name: "University of the West Indies", url: "https://schools.mountkailashslu.com/wp-content/uploads/2024/09/uwi-logo.png" },
  { name: "Hackney Community College", url: "https://schools.mountkailashslu.com/wp-content/uploads/2024/09/hackney-college-logo.png" },
  { name: "St. Lucia Bureau of Standards", url: "https://schools.mountkailashslu.com/wp-content/uploads/2024/09/slbs-logo.png" },
];

export function AuthorityLogos() {
  return (
    <section className="py-16 md:py-20 bg-primary">
      <div className="container mx-auto max-w-5xl px-4">
        <motion.h3
          className="text-center text-sm font-semibold tracking-widest uppercase text-primary-foreground/60 mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Our Faculty Has Been Featured At
        </motion.h3>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {logos.map((logo, i) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="group"
            >
              <img
                src={logo.url}
                alt={logo.name}
                className="h-10 md:h-14 w-auto object-contain grayscale brightness-200 opacity-60 group-hover:opacity-90 transition-all duration-300"
                loading="lazy"
                onError={(e) => {
                  // Fallback to text if image fails
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "block";
                }}
              />
              <span className="hidden text-primary-foreground/50 text-xs font-medium text-center">
                {logo.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
