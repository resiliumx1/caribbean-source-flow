import { useRef, useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import FadeInStagger from "@/components/FadeInStagger";
import { Hero } from "@/components/wholesale/Hero";
import { ProblemSolution } from "@/components/wholesale/ProblemSolution";
import { ProductGrid } from "@/components/wholesale/ProductGrid";
import { SourcingProcess } from "@/components/wholesale/SourcingProcess";
import { ComplianceTrust } from "@/components/wholesale/ComplianceTrust";
import { PrivateLabel } from "@/components/wholesale/PrivateLabel";
import { LeadForm } from "@/components/wholesale/LeadForm";
import { Testimonials } from "@/components/wholesale/Testimonials";
import { PartnershipGuarantees } from "@/components/wholesale/PartnershipGuarantees";
import { Footer } from "@/components/wholesale/Footer";
import { WhatsAppButton } from "@/components/wholesale/WhatsAppButton";
import { StickyMobileCTA } from "@/components/wholesale/StickyMobileCTA";

const Wholesale = () => {
  const formRef = useRef<HTMLDivElement>(null);

  // SEOHead handles meta tags now

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen pt-0">
      <FadeInStagger delay={0.08}>
        <Hero onScrollToForm={scrollToForm} />
      </FadeInStagger>
      <FadeInStagger delay={0.1}>
        <ProblemSolution />
      </FadeInStagger>
      <FadeInStagger delay={0.12}>
        <ProductGrid onScrollToForm={scrollToForm} />
      </FadeInStagger>
      <FadeInStagger delay={0.1}>
        <SourcingProcess />
      </FadeInStagger>
      <FadeInStagger delay={0.12}>
        <ComplianceTrust onScrollToForm={scrollToForm} />
      </FadeInStagger>
      <FadeInStagger delay={0.1}>
        <PrivateLabel onScrollToForm={scrollToForm} />
      </FadeInStagger>
      <FadeInStagger delay={0.1}>
        <LeadForm ref={formRef} />
      </FadeInStagger>
      <FadeInStagger delay={0.1}>
        <Testimonials />
      </FadeInStagger>
      <FadeInStagger delay={0.1}>
        <PartnershipGuarantees />
      </FadeInStagger>
      <FadeInStagger delay={0.1}>
        <Footer />
      </FadeInStagger>
      <WhatsAppButton />
      <StickyMobileCTA />
    </main>
  );
};

export default Wholesale;
