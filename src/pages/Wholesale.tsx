import { useRef, useEffect } from "react";
import FadeInStagger from "@/components/FadeInStagger";
import { Hero } from "@/components/wholesale/Hero";
import { ProblemSolution } from "@/components/wholesale/ProblemSolution";
import { ProductGrid } from "@/components/wholesale/ProductGrid";
import { ComplianceTrust } from "@/components/wholesale/ComplianceTrust";
import { LeadForm } from "@/components/wholesale/LeadForm";
import { SocialProof } from "@/components/wholesale/SocialProof";
import { Footer } from "@/components/wholesale/Footer";
import { WhatsAppButton } from "@/components/wholesale/WhatsAppButton";

const Wholesale = () => {
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Caribbean Botanical Wholesale | COA Documentation | Quick US Delivery | Mount Kailash";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Wholesale Caribbean botanicals with full COA documentation. Quick US delivery from Miami warehouse. Volume pricing for clinics, retailers and wellness brands.");
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen pt-0">
      <Hero onScrollToForm={scrollToForm} />
      <ProblemSolution />
      <ProductGrid onScrollToForm={scrollToForm} />
      <ComplianceTrust onScrollToForm={scrollToForm} />
      <LeadForm ref={formRef} />
      <SocialProof />
      <Footer />
      <WhatsAppButton />
    </main>
  );
};

export default Wholesale;
