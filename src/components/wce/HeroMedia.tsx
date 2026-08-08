import { useMemo } from "react";
import heroVideo from "@/assets/wce-hero.mp4.asset.json";
import heroPoster from "@/assets/wce-hero-poster.jpg.asset.json";
import { useIsMobile, useParallax, useWceReducedData, useWceReducedMotion } from "./motion";
import { FlowerOfLifeMark } from "./decor";

/** Static botanical spray hanging from a top corner of the copy area. */
function HangingBotanical({ tone }: { tone: string }) {
  return (
    <svg viewBox="0 0 200 320" width="100%" height="auto" aria-hidden="true" fill="none">
      <g stroke={tone} strokeWidth="1.4" strokeLinecap="round">
        <path d="M18 0c14 62 30 108 62 156s58 84 66 132" />
        <path d="M56 0c4 48 10 84 26 122" />
        {Array.from({ length: 9 }, (_, i) => {
          const t = i / 8;
          const x = 18 + t * 128;
          const y = t * 292;
          return (
            <g key={i}>
              <path d={`M${x} ${y}c-26 6-40 22-42 44 26-2 42-16 42-44z`} fill={tone} fillOpacity="0.5" stroke="none" />
              <path d={`M${x} ${y}c22 10 32 28 30 50-24-6-36-22-30-50z`} fill={tone} fillOpacity="0.32" stroke="none" />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/**
 * Layered treatment for the area beneath the footage on tablet/mobile.
 * A blurred, saturated, darkened copy of the poster frame continues the
 * footage colours (poster rather than a second <video> element to keep the
 * mobile hero light), masked into the real video over ~120px so no seam is
 * detectable, then forest gradient, warm glows, texture and vignette.
 */
function WceHeroUnderlay() {
  return (
    <div className="wce-hero-under" aria-hidden="true">
      <img src={heroPoster.url} alt="" className="wce-hero-under__media" />
      <div className="wce-hero-under__forest" />
      <div className="wce-hero-under__warm" />
      <span className="wce-hero-under__foliage wce-hero-under__foliage--left" style={{ opacity: 0.06 }}>
        <HangingBotanical tone="var(--wce-gold)" />
      </span>
      <span className="wce-hero-under__foliage wce-hero-under__foliage--right" style={{ opacity: 0.06 }}>
        <HangingBotanical tone="var(--wce-sage, #9BB49B)" />
      </span>
      <FlowerOfLifeMark size={520} opacity={0.05} className="wce-hero-under__flower" />
      <div className="wce-hero-under__grain" />
      <div className="wce-hero-under__vignette" />
    </div>
  );
}

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
      style={{ background: "radial-gradient(120% 90% at 50% 20%, #2C5138 0%, #17351F 55%, var(--wce-band) 100%)" }}
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
      <div className="absolute inset-0" style={{ background: "rgba(var(--wce-forest-rgb), 0.34)" }} />
      <WceHeroUnderlay />
      <div aria-hidden="true" className="wce-hero-hairline" />
      <div aria-hidden="true" className="wce-hero-mist" />
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
