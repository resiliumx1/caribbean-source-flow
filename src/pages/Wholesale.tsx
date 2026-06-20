import { useRef, useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import FadeInStagger from "@/components/FadeInStagger";
import { Hero } from "@/components/wholesale/Hero";
import { DirectAnswer } from "@/components/DirectAnswer";
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
      <SEOHead title="Caribbean Botanicals Wholesale — COA, Fast US Delivery | Mount Kailash" description="Single-origin Saint Lucia botanicals, tinctures and sea moss for clinics and practitioners. COA documentation, bulk pricing, 3-day US delivery." path="/wholesale" />
      <FadeInStagger delay={0.08}>
        <Hero onScrollToForm={scrollToForm} />
      </FadeInStagger>
      <DirectAnswer
        question="What does Mount Kailash wholesale offer?"
        answer="Mount Kailash wholesales single-origin Caribbean botanicals from Soufrière, Saint Lucia — herbal tinctures, sea moss, syrups, capsules, teas and selected raw herbs — to clinics, practitioners and wellness retailers. Every batch ships with documentation, tiered pricing scales with case volume, and most U.S. orders arrive in roughly three business days from our Miami fulfillment point."
      />
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
