import { Flame } from "lucide-react";

interface SaleBadgeProps {
  /** e.g. "50% OFF" */
  label: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Bold, animated sale badge matching the brand aesthetic.
 * Deep-green base, gold shimmer sweep, subtle pulse ring.
 */
export function SaleBadge({ label, size = "md", className = "", style }: SaleBadgeProps) {
  const dims =
    size === "sm"
      ? { pad: "4px 10px", fs: 11, icon: 12, gap: 4 }
      : size === "lg"
      ? { pad: "8px 16px", fs: 14, icon: 16, gap: 6 }
      : { pad: "6px 12px", fs: 12, icon: 13, gap: 5 };

  return (
    <span
      className={`sale-badge-root ${className}`}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: dims.gap,
        padding: dims.pad,
        borderRadius: 999,
        background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 55%, #1b4332 100%)",
        color: "#F5F1E8",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 700,
        fontSize: dims.fs,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        border: "1px solid rgba(212,163,115,0.55)",
        boxShadow: "0 6px 20px -8px rgba(27,67,50,0.55), inset 0 0 0 1px rgba(245,241,232,0.05)",
        overflow: "hidden",
        whiteSpace: "nowrap",
        isolation: "isolate",
        ...style,
      }}
    >
      {/* Pulse ring */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: -2,
          borderRadius: 999,
          border: "2px solid rgba(212,163,115,0.55)",
          animation: "sale-pulse 2s ease-out infinite",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Shimmer sweep */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(115deg, transparent 30%, rgba(212,163,115,0.55) 50%, transparent 70%)",
          transform: "translateX(-120%)",
          animation: "sale-shimmer 3.2s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <Flame
        size={dims.icon}
        style={{ color: "#d4a373", position: "relative", zIndex: 2, animation: "sale-flicker 1.4s ease-in-out infinite" }}
      />
      <span style={{ position: "relative", zIndex: 2 }}>{label}</span>
      <style>{`
        @keyframes sale-pulse {
          0% { transform: scale(1); opacity: 0.75; }
          70% { transform: scale(1.18); opacity: 0; }
          100% { transform: scale(1.18); opacity: 0; }
        }
        @keyframes sale-shimmer {
          0% { transform: translateX(-120%); }
          60% { transform: translateX(120%); }
          100% { transform: translateX(120%); }
        }
        @keyframes sale-flicker {
          0%, 100% { transform: scale(1) rotate(-2deg); opacity: 1; }
          50% { transform: scale(1.1) rotate(2deg); opacity: 0.85; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sale-badge-root > span[aria-hidden] { animation: none !important; }
          .sale-badge-root svg { animation: none !important; }
        }
      `}</style>
    </span>
  );
}