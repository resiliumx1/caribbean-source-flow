import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const tiers = [
  {
    level: "New Practitioner",
    years: "0–2 years",
    salary: "$45k–$65k",
    perYear: "/year",
    description: "Build your client base, work in wellness centres, assist established physicians.",
    color: "bg-accent/10 text-accent",
  },
  {
    level: "Established Physician",
    years: "3–5 years",
    salary: "$75k–$120k",
    perYear: "/year",
    description: "Run a private practice, launch product lines, offer consulting to brands.",
    color: "bg-primary/10 text-primary",
    featured: true,
  },
  {
    level: "Master Practitioner",
    years: "5+ years",
    salary: "$150k+",
    perYear: "/year",
    description: "International consulting, teach at institutions, formulate proprietary lines.",
    color: "bg-emerald-500/10 text-emerald-600",
  },
];

export function CareerOutcomes() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Career Outcomes & Income Potential
          </h2>
          <p
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            A Level 1 Herbal Physician certification opens doors across wellness, education, 
            manufacturing, and integrative healthcare.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.level}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`bg-card rounded-xl border border-border p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${
                tier.featured ? "ring-2 ring-accent/30" : ""
              }`}
            >
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${tier.color}`}
              >
                <TrendingUp className="w-3 h-3" />
                {tier.years}
              </div>
              <h3
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                className="text-xl font-bold text-foreground mb-2"
              >
                {tier.level}
              </h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">{tier.salary}</span>
                <span className="text-sm text-muted-foreground">{tier.perYear}</span>
              </div>
              <p
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
                className="text-sm text-muted-foreground leading-relaxed"
              >
                {tier.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8 space-y-1">
          <p className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Based on 2024 graduate survey of 500+ alumni
          </p>
          <p className="text-xs text-muted-foreground/60" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Results vary by location, dedication, and market conditions.
          </p>
        </div>
      </div>
    </section>
  );
}
