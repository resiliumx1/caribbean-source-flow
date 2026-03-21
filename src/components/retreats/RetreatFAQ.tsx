import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What's Included?",
    a: "Everything you need for a seamless experience: lodging, all plant-based meals, airport transfers, daily workshops, herbal materials, guided excursions, and a personal wellness consultation with Priest Kailash.",
  },
  {
    q: "Where Is It?",
    a: "Our retreat centre is located in Soufrière, on the southwest coast of St. Lucia — nestled between the iconic Pitons and the volcanic rainforest. It's a 90-minute scenic drive from Hewanorra International Airport (UVF).",
  },
  {
    q: "What Should I Bring?",
    a: "Comfortable clothes for warm weather and nature walks, sturdy shoes, a journal for reflection, and an open heart. We provide linens, towels, rain ponchos, and all herbal products.",
  },
  {
    q: "Dietary Accommodations?",
    a: "All meals are 100% plant-based, prepared with ingredients from our volcanic soil gardens. We can accommodate most allergies and sensitivities — just let us know during booking.",
  },
  {
    q: "Is This Right For Me?",
    a: "Absolutely. Our retreats are open to all wellness levels. No prior experience with herbal medicine or wellness practices is needed. Whether you're new to this or well-versed, we meet you where you are.",
  },
  {
    q: "Cancellation Policy?",
    a: "Group retreats: Full refund 30+ days before arrival, 50% refund 15–29 days before. Private retreats: Full refund 14+ days before. All cancellations receive full credit toward future dates.",
  },
];

export function RetreatFAQ() {
  return (
    <section className="py-24 md:py-28" style={{ background: 'var(--site-bg-secondary)' }}>
      <div className="container mx-auto max-w-3xl px-4">
        <div className="text-center mb-14">
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 44px)', color: 'var(--site-text-primary)', marginBottom: '16px' }}>
            Everything You Need to Know
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-xl px-6 border-none"
              style={{ background: 'var(--site-bg-card)', border: '1px solid var(--site-border)' }}
            >
              <AccordionTrigger
                className="hover:no-underline py-5"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '18px', color: 'var(--site-text-primary)' }}
              >
                {faq.q}
              </AccordionTrigger>
              <AccordionContent style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '15px', color: 'var(--site-text-muted)', lineHeight: 1.7 }}>
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
