import { motion } from "framer-motion";
import { FlaskConical, Stethoscope, Leaf, Beaker, Brain, Briefcase } from "lucide-react";

const outcomes = [
  { icon: FlaskConical, text: "Use laboratory equipment effectively" },
  { icon: Stethoscope, text: "Examine patients professionally" },
  { icon: Leaf, text: "Identify herbs in the wild" },
  { icon: Beaker, text: "Formulate herbal products" },
  { icon: Brain, text: "Diagnose using anatomical systems" },
  { icon: Briefcase, text: "Start your own herbal practice" },
];

export function TransformationPromise() {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto max-w-4xl px-4">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-8 text-center">
          What You Will Be Able to Do
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {outcomes.map((outcome, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="flex items-center gap-3 bg-card rounded-xl border border-border p-4 hover:border-accent/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <outcome.icon className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm font-medium text-foreground">{outcome.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
