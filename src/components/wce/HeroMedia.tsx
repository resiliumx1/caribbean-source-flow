import { useMemo } from "react";
import heroVideo from "@/assets/wce-hero.mp4.asset.json";
import heroPoster from "@/assets/wce-hero-poster.jpg.asset.json";
import { useIsMobile, useParallax, useWceReducedData, useWceReducedMotion } from "./motion";

/**
 * Hero background: the footage always covers the whole section at every
 * breakpoint — never letterboxed, never a flat colour fill. A heavily blurred,
 * darkened copy of the poster sits underneath purely as a paint-time fallback
 * for the first frame (and for any sub-pixel gap during the parallax shift).
 */
export function WceHeroMedia() {
  const reducedMotion = useWceReducedMotion();
  const reducedData = useWceReducedData();
  const staticOnly = reducedMotion || reducedData;
  const parallaxRef = useParallax<HTMLDivElement>(0.12);

  return (
    <div
      data-wce-video-slot
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
    >
      {/* Blurred poster underlay — never a flat colour. */}
      <img
        src={heroPoster.url}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover"
        style={{ filter: "blur(34px) saturate(0.9) brightness(0.72)" }}
      />
      <div
        ref={staticOnly ? undefined : parallaxRef}
        className="wce-hero-frame absolute inset-0 will-change-transform"
      >
        {staticOnly ? (
          <img src={heroPoster.url} alt="" className="wce-hero-media" />
        ) : (
          <video
            className="wce-hero-media"
            src={heroVideo.url}
            poster={heroPoster.url}
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
          />
        )}
      </div>
      {/* Narrow viewports: the footage keeps its natural 16:9 so both Pitons stay
          in frame; this gradient blends its lower edge into the blurred underlay
          so no seam and no flat colour band is ever visible. */}
      <div aria-hidden="true" className="wce-hero-seam" />
      <div className="absolute inset-0" style={{ background: "rgba(15,42,29,0.34)" }} />
    </div>
  );
}

/** Sparse gold motes drifting slowly upward. Desktop only, off under reduced motion. */
export function WceHeroParticles() {
  const reduced = useWceReducedMotion();
  const mobile = useIsMobile();
  const motes = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: (i * 37) % 100,
        size: 1.5 + ((i * 7) % 4),
        duration: 22 + ((i * 5) % 18),
        delay: (i * 1.9) % 22,
        drift: ((i % 5) - 2) * 14,
        opacity: 0.12 + ((i % 4) * 0.05),
      })),
    [],
  );

  if (reduced || mobile) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {motes.map((m) => (
        <span
          key={m.id}
          className="wce-mote"
          style={{
            left: `${m.left}%`,
            width: m.size,
            height: m.size,
            animationDuration: `${m.duration}s`,
            animationDelay: `${m.delay}s`,
            ["--mote-x" as any]: `${m.drift}px`,
            ["--mote-opacity" as any]: m.opacity,
          }}
        />
      ))}
    </div>
  );
}
