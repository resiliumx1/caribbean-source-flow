import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqPageSchema, type FaqItem } from "@/content/faqs";

interface FaqSectionProps {
  items: FaqItem[];
  heading?: string;
  /** Set false when another component on the page already emits FAQPage JSON-LD. */
  emitSchema?: boolean;
  className?: string;
}

/**
 * Visible FAQ accordion + matching FAQPage JSON-LD.
 * The same copy is rendered into the prerendered HTML by scripts/prerender.ts.
 */
export function FaqSection({
  items,
  heading = "Frequently asked questions",
  emitSchema = true,
  className,
}: FaqSectionProps) {
  if (items.length === 0) return null;
  return (
    <section className={className ?? "py-20 px-6 border-t border-border/40"} aria-labelledby="faq-heading">
      {emitSchema && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(faqPageSchema(items))}</script>
        </Helmet>
      )}
      <div className="mx-auto max-w-3xl">
        <h2
          id="faq-heading"
          className="font-serif text-3xl md:text-4xl text-foreground mb-10 text-center"
        >
          {heading}
        </h2>
        <Accordion type="single" collapsible className="space-y-3">
          {items.map((f, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border border-border/50 rounded-md px-4 bg-card/40"
            >
              <AccordionTrigger className="text-left text-base md:text-lg text-foreground min-h-[44px] py-4">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-5">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
