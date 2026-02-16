import { motion } from "framer-motion";
import { Award, BookOpen, Calendar, Leaf } from "lucide-react";

export function LeadInstructorFeature() {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto max-w-4xl px-4">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-8 text-center">
          Meet Your Lead Instructors
        </h2>

        <div className="space-y-6">
          {/* Priest Kailash */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-xl border border-border p-6 md:p-8"
          >
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
                <span className="text-2xl font-serif font-bold text-primary">PK</span>
              </div>
              <div className="flex-1">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold mb-3">
                  <Leaf className="w-3 h-3" />
                  Lead Instructor
                </span>
                <h3 className="text-xl font-serif font-bold text-foreground mb-1">
                  Rt. Honourable Priest Kailash Kay Leonce
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Grand Master Herbal Physician & Founder, HSEK</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="w-4 h-4 text-accent" />
                    <div>
                      <div className="text-sm font-semibold text-foreground">21+ Years</div>
                      <div className="text-xs text-muted-foreground">Clinical Practice</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <div>
                      <div className="text-sm font-semibold text-foreground">500+</div>
                      <div className="text-xs text-muted-foreground">Herbalists Trained</div>
                    </div>
                  </div>
                </div>

                <blockquote className="pl-4 border-l-3 border-accent italic text-foreground/80 text-sm leading-relaxed">
                  "Western medicine treats symptoms. Bush medicine addresses terrain—the cellular 
                  environment where disease takes root. We don't fight the body; we restore its intelligence."
                </blockquote>
              </div>
            </div>
          </motion.div>

          {/* Goddess Ronda */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-xl border border-border p-6 md:p-8"
          >
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 border-2 border-accent/20">
                <span className="text-2xl font-serif font-bold text-accent">RA</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-serif font-bold text-foreground mb-1">
                  Goddess Ronda Itopia Archer
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Co-founder & Academic Coordinator, HSEK</p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Co-founder of the Herbal School of Esoteric Knowledge and an instrumental force 
                  behind the school's curriculum development and academic coordination. She ensures 
                  the highest standards of education and student support throughout the program.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
