import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

export function CallingSection() {
  return (
    <section className="py-20 md:py-28 bg-primary">
      <div className="container mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-accent" />
            </div>
          </div>

          <blockquote className="relative pl-6 md:pl-8 border-l-4 border-accent">
            <p className="text-xl md:text-2xl lg:text-3xl leading-relaxed text-primary-foreground/95 font-serif italic">
              "There is a calling for healers, the human being is suffering more than 
              ever before with a diversity of Dis-Eases from all the cancers, diabetes, 
              infertility, obesity and even the flu. The door is open, for the lack of 
              knowledge the people shall suffer and perish, come learn to heal yourself 
              that you can heal others."
            </p>
            <footer className="mt-6 text-primary-foreground/70 text-base font-medium">
              — Rt Hon Priest Kailash K Leonce
            </footer>
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}
