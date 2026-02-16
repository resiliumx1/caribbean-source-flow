import { motion } from "framer-motion";
import { Award, Check } from "lucide-react";

const requirements = [
  "Successful completion of all quizzes and assignments",
  "Passing grade on Comprehensive Examination Part 1 (written)",
  "Full attendance of the 10-day in-person practical (Part 2)",
  "Passing grade on Comprehensive Examination Part 2 (practical)",
  "Submission and defence of Research Proposal",
];

export function GraduationSection() {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto max-w-3xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-xl border border-border p-6 md:p-8 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Award className="w-7 h-7 text-accent" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">
            Graduation & Certification
          </h2>
          <p className="text-muted-foreground mb-6">
            Upon successful completion, you receive the <strong className="text-foreground">Level 1 Herbal Physician Certification</strong> from 
            the Herbal School of Esoteric Knowledge.
          </p>

          <div className="text-left max-w-md mx-auto">
            <h3 className="text-sm font-semibold text-foreground mb-3">Requirements for graduation:</h3>
            <ul className="space-y-2">
              {requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
