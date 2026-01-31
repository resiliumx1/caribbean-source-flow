import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Where is Mount Kailash located and how do I get there?",
    answer:
      "We're located in Soufrière, St. Lucia, in the shadow of the Pitons. Airport transfers from Hewanorra International Airport (UVF) are included with all retreat packages. The scenic drive takes approximately 90 minutes and passes through the island's most beautiful landscapes.",
  },
  {
    question: "What should I bring to the retreat?",
    answer:
      "Bring comfortable hiking shoes, natural toiletries (no synthetic fragrances), lightweight clothing for tropical weather, and a journal. We provide all linens, towels, rain ponchos, and herbal products. A detailed packing list is sent upon booking confirmation.",
  },
  {
    question: "Can I take my regular medications during the retreat?",
    answer:
      "We evaluate each case individually. Please disclose all medications during your pre-arrival assessment. Some pharmaceuticals may interact with our herbal protocols and require adjustment. We work alongside your physician to ensure safety.",
  },
  {
    question: "What is the food like?",
    answer:
      "All meals are strictly ital—plant-based cuisine prepared according to Rastafarian dietary principles. No meat, dairy, or processed foods. Ingredients are sourced from our volcanic soil gardens. The cuisine is designed to support your detoxification process.",
  },
  {
    question: "Is it safe for solo female travelers?",
    answer:
      "Absolutely. Our retreat centre has 24/7 staff, secure private cabins, and a peaceful community atmosphere. Many of our guests are solo female travelers seeking transformation in a supportive environment.",
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "Group Immersions: 100% refundable up to 30 days before arrival, 50% refundable 15-29 days, non-refundable within 14 days. Solo Retreats: 100% refundable up to 14 days, 50% refundable 7-13 days. We offer full credit toward future dates for any cancellation.",
  },
  {
    question: "What if I have dietary restrictions or allergies?",
    answer:
      "Our ital cuisine naturally accommodates most dietary needs (vegan, gluten-free options available). Please inform us of any allergies during your pre-arrival assessment. Our kitchen staff is experienced in preparing meals for guests with various restrictions.",
  },
  {
    question: "Do I need travel insurance?",
    answer:
      "Yes, we require all international guests to have travel insurance that covers medical evacuation. St. Lucia has excellent healthcare facilities, but insurance provides peace of mind. We can recommend providers upon request.",
  },
];

export function RetreatFAQ() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="section-header mb-4">Practical Matters</h2>
          <p className="section-subheader mx-auto">
            Everything you need to know before your transformative journey.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="bg-card rounded-xl border border-border px-6 data-[state=open]:border-accent transition-colors"
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
