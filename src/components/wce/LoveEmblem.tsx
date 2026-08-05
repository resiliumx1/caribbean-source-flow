/** The official event brand mark: "Love The Life You Live" — mountain peaks inside a
 *  flower-of-life arch with wave flourishes. Uses the supplied brand artwork; the
 *  cream variant is for dark surfaces, the colour variant for light surfaces.
 *  Fades and rises gently into view on scroll entry. */
import { CSSProperties } from "react";
import { useInView, useWceReducedMotion } from "./motion";
import creamLogo from "@/assets/ltlyl-logo-cream.png.asset.json";
import colorLogo from "@/assets/ltlyl-logo-color.png.asset.json";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function LoveEmblem({
  size = 240,
  variant = "cream",
  className = "",
  style,
}: {
  size?: number;
  /** "cream" for dark backgrounds, "color" for light backgrounds */
  variant?: "cream" | "color";
  className?: string;
  style?: CSSProperties;
}) {
  const reduced = useWceReducedMotion();
  const { ref, inView } = useInView<HTMLImageElement>();
  const on = reduced || inView;
  const src = variant === "color" ? colorLogo.url : creamLogo.url;

  return (
    <img
      ref={ref}
      src={src}
      alt="Love the Life You Live — Caribbean Wellness Saint Lucia"
      width={size}
      height={Math.round(size * 0.7)}
      loading="lazy"
      decoding="async"
      className={className}
      style={{
        width: size,
        height: "auto",
        maxWidth: "100%",
        opacity: on ? 1 : 0,
        transform: on ? "translateY(0) scale(1)" : "translateY(14px) scale(0.97)",
        transition: reduced
          ? undefined
          : `opacity 900ms ${EASE}, transform 900ms ${EASE}`,
        ...style,
      }}
    />
  );
}
