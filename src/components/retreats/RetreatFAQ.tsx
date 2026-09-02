import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Helmet } from "react-helmet-async";
import { retreatFaqs, faqPageSchema } from "@/content/faqs";

const faqs = retreatFaqs;

export function RetreatFAQ() {
  const faqSchema = faqPageSchema(faqs);
  return (
    <section className="py-24 md:py-28" style={{ background: 'var(--site-bg-secondary)' }}>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
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
