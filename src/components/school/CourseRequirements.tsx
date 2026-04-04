import { motion } from "framer-motion";
import { BookOpen, ShieldCheck, Heart, Check } from "lucide-react";

const materials = [
  { text: "The New Herbal Manual — Rt Hon Priest Kailash K Leonce", icon: BookOpen },
  { text: "Medical Herbalism — David Hoffmann, FNIMH, AHG", icon: BookOpen },
  { text: "Lab Coat, Scrubs, PPE (for in-person practical)", icon: ShieldCheck },
];

const spiritual = [
  "A willing heart",
  "Love for Self, Creator and Creation",
];

export function CourseRequirements() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            What You Will Need
          </h2>
          <p className="text-lg text-muted-foreground">
            Required materials and prerequisites for enrollment.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-xl border border-border p-6 md:p-8"
        >
          <h3 className="text-lg font-serif font-semibold text-foreground mb-6">Required Materials</h3>
          <ul className="space-y-4 mb-8">
            {materials.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground leading-relaxed">{item.text}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-serif font-semibold text-foreground">And Most Importantly</h3>
            </div>
            <ul className="space-y-3">
              {spiritual.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="text-foreground italic font-serif text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
