import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Is this certification recognized?",
    answer:
      "The Level 1 Herbal Physician Certification is issued by the Herbal School of Esoteric Knowledge (HSEK), an institution with over 21 years of practice. While herbal medicine regulation varies by country, our graduates practice in the Caribbean, United States, United Kingdom, Canada, and across Africa. The curriculum aligns with international standards in ethnobotany, phytotherapy, and traditional medicine. We recommend checking your local jurisdiction's requirements for herbal practice.",
  },
  {
    question: "Do I need prior experience?",
    answer:
      "No prior experience is required. The program is designed for beginners, career changers, healthcare professionals expanding their toolkit, and anyone passionate about plant medicine. Phase 1 covers foundational subjects—history, academic English, and research methodology—before advancing to sciences and herbal mastery. We welcome students from all walks of life.",
  },
  {
    question: "What if I can't attend the in-person portion?",
    answer:
      "We understand travel requires planning. If you cannot attend the scheduled Part 2 immersion, you may defer to the next available cohort at no additional cost. Part 2 dates are offered multiple times per year. Contact admissions to arrange a reschedule—your Part 1 completion never expires.",
  },
  {
    question: "Are there payment plans?",
    answer:
      "Yes. We offer four flexible payment options: Pay in Full ($7,400—save $900), 2 Payments of $4,000, 3 Payments of $2,766.67, or 4 Payments of $2,075. No credit check is required and all plans are interest-free. Payment plans are available for every student upon enrollment.",
  },
  {
    question: "What's the time commitment?",
    answer:
      "Part 1 (Online) requires approximately 10–15 hours per week, including live Wednesday sessions (90 minutes), Sunday presentations, and self-paced study. All sessions are recorded for flexible review. Part 2 (In-Person) is a full-time 10-day immersion at our campus in Marc, Castries, Saint Lucia.",
  },
  {
    question: "Is there a refund policy?",
    answer:
      "We offer a 30-day refund for the online portion (Part 1) if the program isn't the right fit. The Part 2 immersion deposit is non-refundable, as it secures your accommodation and materials. You may, however, defer your Part 2 attendance to a future cohort. Full refund terms are provided upon enrollment.",
  },
];

export function SchoolFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Frequently Asked Questions
          </h2>
          <p
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
            className="text-lg text-muted-foreground"
          >
            Everything you need to know before applying.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={cn(
                  "bg-card rounded-xl border border-border overflow-hidden transition-all duration-300",
                  isOpen && "border-l-4 border-l-[hsl(var(--accent))]"
                )}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 md:px-6 py-5 text-left focus-visible:outline-2 focus-visible:outline-[hsl(var(--accent))]"
                  aria-expanded={isOpen}
                >
                  <span
                    style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
                    className="text-base text-foreground pr-4"
                  >
                    {faq.question}
                  </span>
                  <Plus
                    className={cn(
                      "w-5 h-5 text-accent flex-shrink-0 transition-transform duration-300",
                      isOpen && "rotate-45"
                    )}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 md:px-6 pb-5">
                    <p
                      style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
                      className="text-foreground/80 leading-relaxed text-[15px]"
                    >
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
