import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConciergePanel } from "./ConciergePanel";

interface ConciergeButtonProps {
  className?: string;
}

export function ConciergeButton({ className }: ConciergeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button - offset from WhatsApp button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-24 z-40 rounded-full shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground px-5 py-3 h-auto ${className}`}
        style={{
          boxShadow: "0 8px 24px -4px hsla(42, 85%, 55%, 0.4)",
        }}
      >
        <MessageSquare className="w-5 h-5 mr-2" />
        Ask
      </Button>

      {/* Panel */}
      <ConciergePanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
