import { motion } from "framer-motion";
import { FileText, FlaskConical, Briefcase, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const samples = [
  {
    icon: FileText,
    title: "Patient Protocol",
    description:
      "An anonymised herbal treatment plan demonstrating patient assessment, herb selection, dosage, and follow-up scheduling.",
    tag: "Clinical Skills",
  },
  {
    icon: FlaskConical,
    title: "Formulation Recipe",
    description:
      "A complete tincture preparation document including herb ratios, maceration times, quality control notes, and labelling.",
    tag: "Lab Practical",
  },
  {
    icon: Briefcase,
    title: "Business Plan",
    description:
      "A clinic launch strategy from a recent graduate—covering market analysis, service menu, pricing, and first-year projections.",
    tag: "Entrepreneurship",
  },
];

export function StudentWorkSamples() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            What You'll Create
          </h2>
          <p
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto"
          >
            Real deliverables from real students. Here's a preview of the work you'll produce during the program.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {samples.map((sample, i) => (
            <motion.div
              key={sample.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <span
                className="inline-block px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[11px] font-semibold mb-4"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {sample.tag}
              </span>
              <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center mb-4">
                <sample.icon className="w-6 h-6 text-accent" />
              </div>
              <h3
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                className="text-lg font-bold text-foreground mb-2"
              >
                {sample.title}
              </h3>
              <p
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
                className="text-sm text-muted-foreground leading-relaxed"
              >
                {sample.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="https://schools.mountkailashslu.com/wp-content/uploads/2024/12/HSEK-Brochure.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="gap-2 min-h-[48px]">
              <Download className="w-4 h-4" />
              Download Sample Curriculum
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
