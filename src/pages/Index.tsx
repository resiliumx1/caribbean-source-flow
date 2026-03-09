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
  const [gateProgress, setGateProgress] = useState(0);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleGateProgress = useCallback((progress: number) => {
    setGateProgress(progress);
  }, []);

  // Nav becomes visible after gates open (~55% scroll progress)
  const navOpacity = gateProgress < 0.5 ? 0 : Math.min(1, (gateProgress - 0.5) / 0.1);

  return (
    <main className="min-h-screen">
      {/* Gate Entrance — scroll-driven opening animation */}
      <GateEntrance onProgressChange={handleGateProgress} />

      {/* Header fades in after gates open */}
      <div
        style={{
          opacity: navOpacity,
          pointerEvents: navOpacity > 0.5 ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      >
        <Header onScrollToForm={scrollToForm} />
      </div>

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
