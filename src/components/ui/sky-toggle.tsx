"use client";

import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function SkyToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-16 h-8 rounded-full bg-muted animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <button
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className="relative w-16 h-8 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors overflow-hidden"
      style={{
        background: isDark
          ? "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
          : "linear-gradient(180deg, #87CEEB 0%, #B0E0E6 50%, #E0F6FF 100%)",
      }}
    >
      {/* Stars (visible in dark mode) */}
      <AnimatePresence>
        {isDark && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="absolute w-1 h-1 rounded-full bg-white"
              style={{ top: "6px", left: "8px" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.8, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="absolute w-0.5 h-0.5 rounded-full bg-white"
              style={{ top: "10px", left: "18px" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.6, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="absolute w-1 h-1 rounded-full bg-white"
              style={{ top: "4px", left: "28px" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.7, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className="absolute w-0.5 h-0.5 rounded-full bg-white"
              style={{ top: "18px", left: "12px" }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Clouds (visible in light mode) */}
      <AnimatePresence>
        {!isDark && (
          <>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 0.9, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute rounded-full bg-white shadow-sm"
              style={{
                width: "12px",
                height: "6px",
                top: "8px",
                left: "6px",
                borderRadius: "6px",
              }}
            />
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 0.7, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="absolute rounded-full bg-white shadow-sm"
              style={{
                width: "8px",
                height: "4px",
                top: "18px",
                left: "14px",
                borderRadius: "4px",
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Sun/Moon toggle circle */}
      <motion.div
        className="absolute top-1 flex items-center justify-center rounded-full shadow-md"
        style={{
          width: "24px",
          height: "24px",
        }}
        animate={{
          left: isDark ? "36px" : "4px",
          backgroundColor: isDark ? "#F5F3CE" : "#FFD700",
          boxShadow: isDark
            ? "0 0 8px rgba(245, 243, 206, 0.5)"
            : "0 0 12px rgba(255, 215, 0, 0.6)",
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        {/* Sun rays (visible in light mode) */}
        <AnimatePresence>
          {!isDark && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0"
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute bg-yellow-400"
                  style={{
                    width: "2px",
                    height: "4px",
                    left: "50%",
                    top: "50%",
                    transformOrigin: "center",
                    transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-14px)`,
                    borderRadius: "1px",
                  }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Moon craters (visible in dark mode) */}
        <AnimatePresence>
          {isDark && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                className="absolute rounded-full bg-gray-400"
                style={{
                  width: "4px",
                  height: "4px",
                  top: "6px",
                  left: "6px",
                }}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                exit={{ opacity: 0 }}
                className="absolute rounded-full bg-gray-400"
                style={{
                  width: "3px",
                  height: "3px",
                  top: "12px",
                  left: "10px",
                }}
              />
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}
