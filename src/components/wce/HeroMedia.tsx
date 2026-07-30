import { useMemo } from "react";
import heroVideo from "@/assets/wce-hero.mp4.asset.json";
import heroPoster from "@/assets/wce-hero-poster.jpg.asset.json";
import { useIsMobile, useParallax, useWceReducedData, useWceReducedMotion } from "./motion";

/** Hero background: parallaxed video, or a static poster under reduced motion/data. */
export function WceHeroMedia() {
  const reducedMotion = useWceReducedMotion();
  const reducedData = useWceReducedData();
  const staticOnly = reducedMotion || reducedData;
  const parallaxRef = useParallax<HTMLDivElement>(0.5);

  return (
    <div data-wce-video-slot aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div ref={parallaxRef} className="absolute inset-0 -top-[15%] h-[130%] will-change-transform">
        {staticOnly ? (
          <img src={heroPoster.url} alt="" className="h-full w-full object-cover" />
        ) : (
          <video
            className="h-full w-full object-cover"
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
      <div className="absolute inset-0" style={{ background: "rgba(15,42,29,0.45)" }} />
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
