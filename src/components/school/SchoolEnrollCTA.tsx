import { motion } from "framer-motion";
import { ArrowRight, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function SchoolEnrollCTA() {
  return (
    <section className="py-20 md:py-28 bg-primary">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary-foreground mb-6">
            Begin Your Journey as a Herbal Physician
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Next Cohort: Part 1 begins March 1, 2026 — Part 2 begins October 1, 2026
          </p>

          {/* Pricing */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
              <div className="text-sm text-primary-foreground/70">Part 1 Online</div>
              <div className="text-2xl font-bold text-primary-foreground">$3,900</div>
            </div>
            <span className="text-primary-foreground/50 text-2xl font-light">+</span>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
              <div className="text-sm text-primary-foreground/70">Part 2 In-Person</div>
              <div className="text-2xl font-bold text-primary-foreground">$4,400</div>
            </div>
            <span className="text-primary-foreground/50 text-2xl font-light">=</span>
            <div className="bg-accent/20 backdrop-blur-sm rounded-xl px-6 py-4 border border-accent/40">
              <div className="text-sm text-accent">Full Program</div>
              <div className="text-2xl font-bold text-primary-foreground">$8,300</div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link to="/school/herbal-physician-course">
              <Button variant="hero" size="xl" className="gap-2">
                Register Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
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

          {/* Fine print */}
          <div className="flex items-start justify-center gap-2 text-primary-foreground/50 text-sm max-w-lg mx-auto">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-left">
              Applicants must be 18 years or older. All fees are non-refundable once the program has commenced. 
              Payment plans available upon request.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
