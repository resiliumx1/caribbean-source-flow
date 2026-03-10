import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function SchoolStickyHeader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        background: "rgba(15, 40, 30, 0.95)",
        backdropFilter: "blur(12px)",
        height: "64px",
      }}
    >
      <div className="container mx-auto max-w-6xl px-4 h-full flex items-center justify-between">
        <div>
          <p
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}
            className="text-[#F5F1E8] text-sm md:text-base"
          >
            Herbal Physician Certification
          </p>
          <p
            style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300 }}
            className="text-[#A8B5A0] text-xs"
          >
            Cohort starts March 2026 • 12 spots left
          </p>
        </div>
        <a
          href="https://schools.mountkailashslu.com/hsek-application/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="hero"
            size="sm"
            className="min-h-[40px] text-sm gap-1.5"
          >
            <span className="hidden sm:inline text-xs font-normal opacity-80">12 Spots Left •</span>
            Apply Now
          </Button>
        </a>
      </div>
    </div>
  );
}
