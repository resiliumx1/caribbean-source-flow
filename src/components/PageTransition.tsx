import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

// Simplified — no framer-motion exit/enter animation to reduce TBT
export default function PageTransition({ children }: PageTransitionProps) {
  return <>{children}</>;
}
