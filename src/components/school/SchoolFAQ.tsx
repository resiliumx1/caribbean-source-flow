import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Who is this course for?",
    answer: "This course is designed for anyone passionate about herbal medicine—whether you're a complete beginner or a practicing wellness professional looking to formalize your training. You must be at least 18 years old. No prior medical or science background is required; the curriculum starts from foundations and builds progressively.",
  },
  {
    question: "What is the weekly schedule?",
    answer: "Part 1 (Online) runs on Wednesdays with 90-minute live sessions, plus Sunday presentations. All sessions are recorded so you can review at your own pace. Part 2 (In-Person) is a 10-day immersive practical at our Mount Kailash campus in Soufrière, Saint Lucia.",
  },
  {
    question: "Do I need prior experience in herbal medicine?",
    answer: "No. The curriculum is structured to take you from zero knowledge to a certified Level 1 Herbal Physician. Phase 1 covers the foundational subjects—history, academic English, and research methodology—before advancing to the sciences and herbal mastery.",
  },
  {
    question: "Is accommodation included in Part 2?",
    answer: "Yes. Your Part 2 tuition ($4,400) includes on-site accommodation at the Mount Kailash compound in Soufrière, Saint Lucia for the full 10-day practical period. Meals follow our traditional ital (plant-based) diet. You'll need to arrange your own flights to Hewanorra International Airport (UVF).",
  },
  {
    question: "What certification do I receive?",
    answer: "Upon successful completion of both Part 1 and Part 2—including all quizzes, assignments, and the comprehensive examinations—you receive a Level 1 Herbal Physician Certification from the Herbal School of Esoteric Knowledge (HSEK). You'll also have lifetime access to all course recordings and materials.",
  },
  {
    question: "What are the payment options?",
    answer: "Payment is accepted via bank transfer, credit card, and select digital payment platforms. Payment plans may be arranged upon request by contacting admissions. The full program cost is $8,300 USD ($3,900 for Part 1 + $4,400 for Part 2). All fees are non-refundable once the program has commenced.",
  },
];

export function SchoolFAQ() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know before enrolling.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-card rounded-xl border border-border px-5 md:px-6"
            >
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-foreground/80 leading-relaxed pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
