import { motion } from "framer-motion";
import { Handshake, Leaf, Building2, BookOpen, Microscope, FileText } from "lucide-react";

const outcomes = [
  {
    icon: Handshake,
    title: "Elite Partnership with Mount Kailash",
    description: "Join our network of certified practitioners and gain referral access to the Mount Kailash client base.",
  },
  {
    icon: Leaf,
    title: "Start Your Own Herbal Product Line",
    description: "Use the manufacturing and labelling knowledge to formulate, produce, and sell your own herbal products.",
  },
  {
    icon: Building2,
    title: "Wellness Centre Practitioner",
    description: "Open or join a wellness centre as a certified herbal physician, offering consultations and treatments.",
  },
  {
    icon: BookOpen,
    title: "Teach Herbal Medicine Courses",
    description: "Share your knowledge by teaching herbal medicine at schools, workshops, and community programs.",
  },
  {
    icon: Microscope,
    title: "Integrative Medicine Collaboration",
    description: "Work alongside conventional medical practitioners to offer complementary herbal approaches.",
  },
  {
    icon: FileText,
    title: "Research & Academic Publications",
    description: "Contribute to the growing body of ethnobotanical and phytotherapy research in the Caribbean.",
  },
];

export function CareerOutcomes() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Where This Takes You
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A Level 1 Herbal Physician certification opens doors across wellness, 
            education, manufacturing, and integrative healthcare.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {outcomes.map((outcome, i) => (
            <motion.div
              key={outcome.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-card hover:border-accent/20 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <outcome.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-base font-serif font-bold text-foreground mb-2">{outcome.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{outcome.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
