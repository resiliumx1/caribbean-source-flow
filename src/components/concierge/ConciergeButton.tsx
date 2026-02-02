import { useState } from "react";
import { Sparkles } from "lucide-react";
import { ConciergePanel } from "./ConciergePanel";
import { motion } from "framer-motion";

interface ConciergeButtonProps {
  className?: string;
}

export function ConciergeButton({ className }: ConciergeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Icon Button - minimal, offset from WhatsApp */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-24 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${className}`}
        style={{
          background: "linear-gradient(135deg, hsl(39, 55%, 45%) 0%, hsl(39, 55%, 55%) 100%)",
          boxShadow: "0 8px 24px -4px hsla(39, 55%, 45%, 0.4)",
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI wellness assistant"
      >
        {/* Pulse ring animation */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: "2px solid hsla(39, 55%, 55%, 0.5)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <Sparkles className="w-6 h-6 text-white" />
      </motion.button>

      {/* Panel */}
      <ConciergePanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
