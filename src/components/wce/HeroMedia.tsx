import { useEffect, useMemo, useState } from "react";
import heroVideo from "@/assets/wce-hero.mp4.asset.json";
import heroPoster from "@/assets/wce-hero-poster.jpg.asset.json";
import { useIsMobile, useParallax, useWceReducedData, useWceReducedMotion } from "./motion";

/** True below ~1024px, where 16:9 footage must letterbox instead of crop. */
function useNarrowViewport() {
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return narrow;
}

/** Hero background: parallaxed video, or a static poster under reduced motion/data. */
export function WceHeroMedia() {
  const reducedMotion = useWceReducedMotion();
  const reducedData = useWceReducedData();
  const staticOnly = reducedMotion || reducedData;
  const parallaxRef = useParallax<HTMLDivElement>(0.2);
  const narrow = useNarrowViewport();
  const fit = narrow ? "contain" : "cover";

  return (
    <div
      data-wce-video-slot
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: "#0f2a1d" }}
    >
      <div
        ref={parallaxRef}
        className={`absolute inset-0 will-change-transform ${narrow ? "" : "-top-[6%] h-[112%]"}`}
      >
        {staticOnly ? (
          <img
            src={heroPoster.url}
            alt=""
            className="h-full w-full"
            style={{ objectFit: fit, objectPosition: "center center" }}
          />
        ) : (
          <video
            className="h-full w-full"
            style={{ objectFit: fit, objectPosition: "center center" }}
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
