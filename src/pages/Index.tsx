import { useRef, useState, useCallback } from "react";
import FadeInStagger from "@/components/FadeInStagger";
import { Header } from "@/components/wholesale/Header";
import { Hero } from "@/components/wholesale/Hero";
import { ProblemSolution } from "@/components/wholesale/ProblemSolution";
import { ProductGrid } from "@/components/wholesale/ProductGrid";
import { ComplianceTrust } from "@/components/wholesale/ComplianceTrust";
import { LeadForm } from "@/components/wholesale/LeadForm";
import { SocialProof } from "@/components/wholesale/SocialProof";
import { Footer } from "@/components/wholesale/Footer";
import { WhatsAppButton } from "@/components/wholesale/WhatsAppButton";
import { GateEntrance } from "@/components/gate-entrance";

const Index = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const [gateComplete, setGateComplete] = useState(false);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleGateComplete = useCallback(() => {
    setGateComplete(true);
  }, []);

  return (
    <main className="min-h-screen">
      {/* Gate Entrance — auto-playing animation overlay */}
      {!gateComplete && <GateEntrance onGateComplete={handleGateComplete} />}

      {/* Header */}
      <Header onScrollToForm={scrollToForm} />

      {/* Main site content after the gate */}
      <FadeInStagger delay={0.1}>
        <Hero onScrollToForm={scrollToForm} />
      </FadeInStagger>
      <FadeInStagger delay={0.2}>
        <ProblemSolution />
      </FadeInStagger>
      <FadeInStagger delay={0.3}>
        <ProductGrid onScrollToForm={scrollToForm} />
      </FadeInStagger>
      <FadeInStagger delay={0.4}>
        <ComplianceTrust onScrollToForm={scrollToForm} />
      </FadeInStagger>
      <FadeInStagger delay={0.5}>
        <LeadForm ref={formRef} />
      </FadeInStagger>
      <FadeInStagger delay={0.6}>
        <SocialProof />
      </FadeInStagger>
      <FadeInStagger delay={0.7}>
        <Footer />
      </FadeInStagger>
      <WhatsAppButton />
    </main>
  );
};

export default Index;
