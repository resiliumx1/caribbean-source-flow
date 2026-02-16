import { motion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EnrollmentCTA() {
  return (
    <section className="py-20 md:py-28 bg-primary">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-4">
            Begin Your Journey as a Herbal Physician
          </h2>
          <p className="text-lg text-primary-foreground/70 italic font-serif mb-8 max-w-2xl mx-auto">
            "Come learn to heal yourself that you can heal others."
          </p>

          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-3xl font-bold text-primary-foreground">$8,300</span>
            <span className="text-primary-foreground/50">|</span>
            <span className="text-primary-foreground/70">March 2026</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://schools.mountkailashslu.com/hsek-application/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="hero" size="xl" className="gap-2">
                Enroll Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
            <a
              href="https://schools.mountkailashslu.com/wp-content/uploads/2024/12/HSEK-Brochure.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="heroSecondary" size="xl" className="gap-2">
                <Download className="w-5 h-5" />
                Download Brochure
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
