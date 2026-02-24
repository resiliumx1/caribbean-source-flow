import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

/*
 * Video compression command for optimal web delivery:
 * ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 -vf scale=1280:-2 output.webm
 * ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow -vf scale=1280:-2 output.mp4
 * Target: <800KB
 */

export function VideoFooter() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section || isMobile || prefersReduced) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [isMobile, prefersReduced]);

  return (
    <section ref={sectionRef} className="relative h-[400px] md:h-[500px] overflow-hidden">
      {/* Video / Poster */}
      {!isMobile && !prefersReduced ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
          poster="/placeholder.svg"
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/placeholder.svg)" }}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
          Begin Your Sacred Journey
        </h2>
        <p className="text-lg text-white/80 max-w-lg mb-8">
          Discover transformative retreats, herbal wisdom, and holistic wellness rooted in Caribbean tradition.
        </p>
        <Button asChild variant="hero" size="xl">
          <Link to="/retreats">Explore Retreats</Link>
        </Button>
      </div>
    </section>
  );
}
