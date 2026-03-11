import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInStaggerProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export default function FadeInStagger({ children, delay = 0, className }: FadeInStaggerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
