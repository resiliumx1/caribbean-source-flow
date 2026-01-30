import { useRef } from "react";
import { Header } from "@/components/wholesale/Header";
import { Hero } from "@/components/wholesale/Hero";
import { ProblemSolution } from "@/components/wholesale/ProblemSolution";
import { ProductGrid } from "@/components/wholesale/ProductGrid";
import { ComplianceTrust } from "@/components/wholesale/ComplianceTrust";
import { LeadForm } from "@/components/wholesale/LeadForm";
import { SocialProof } from "@/components/wholesale/SocialProof";
import { Footer } from "@/components/wholesale/Footer";
import { WhatsAppButton } from "@/components/wholesale/WhatsAppButton";

const Index = () => {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen">
      <Header onScrollToForm={scrollToForm} />
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

export default Index;
