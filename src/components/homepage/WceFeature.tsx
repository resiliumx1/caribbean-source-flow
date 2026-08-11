/**
 * Featured programme module for the main-site homepage: Caribbean Wellness
 * Saint Lucia 2026.
 *
 * The WCE identity is applied by putting `.wce-root` on this section only —
 * exactly the same scoping the /wce-2026 route uses — so none of the WCE
 * tokens reach the rest of the homepage in either theme.
 *
 * The same hero footage as /wce-2026 plays behind the lockup, but because this
 * module sits below the fold it is loaded lazily so it can never affect the
 * homepage LCP: `preload="none"`, the poster frame paints immediately, and the
 * <video> element is only mounted once an IntersectionObserver (rootMargin
 * 200px) says the module is approaching the viewport. A 960px file is served
 * below 768px and the full-width file above. Under prefers-reduced-motion,
 * prefers-reduced-data, or when autoplay is refused, the poster frame stays.
 */
import "@/styles/wce.css";
import "@/styles/wce-home.css";
import poster from "@/assets/wce-hero-poster.jpg.asset.json";
import { useEffect, useRef, useState } from "react";
import { Year2026 } from "@/components/wce/Year2026";
import { WceCountdown } from "@/components/wce/WceCountdown";
import { LoveEmblem } from "@/components/wce/LoveEmblem";
import { FlowerOfLifeMark } from "@/components/wce/decor";
import {
  useInView,
  useParallax,
  useWceReducedData,
  useWceReducedMotion,
} from "@/components/wce/motion";

const VIDEO_SMALL = "/media/wce-hero-960.mp4";
const VIDEO_LARGE = "/media/wce-hero-1600.mp4";

const CORNER_D =
  "M2 78C2 42 2 24 2 2c22 0 40 0 76 0M2 44c0-24 0-30 0-30 16 0 22 0 44 0M14 14c0 10 0 14 0 18";

function Corner({ position, delay }: { position: "tl" | "tr" | "bl" | "br"; delay: number }) {
  const reduced = useWceReducedMotion();
  const { ref, inView } = useInView<SVGSVGElement>();
  const drawn = reduced || inView;
  return (
    <svg
      ref={ref as never}
      className={`wce-home-corner ${position} ${drawn ? "is-drawn" : ""}`}
      viewBox="0 0 80 80"
      aria-hidden="true"
      style={{ ["--wce-home-delay" as never]: `${delay}ms` }}
    >
      <path pathLength={1} d={CORNER_D} />
    </svg>
  );
}

/** Lazily-mounted, muted looping background footage. Poster stays visible
 *  underneath so there is never a flash of empty colour, and any autoplay
 *  refusal leaves the poster in place. */
function WceHomeVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [src] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
      ? VIDEO_SMALL
      : VIDEO_LARGE,
  );

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    // Load only now that we are near the viewport, then try to autoplay.
    el.preload = "auto";
    el.load();
    const attempt = () => {
      const p = el.play();
      if (p && typeof p.catch === "function") p.catch(() => setPlaying(false));
    };
    const onPlaying = () => setPlaying(true);
    el.addEventListener("playing", onPlaying);
    el.addEventListener("loadeddata", attempt);
    attempt();
    return () => {
      el.removeEventListener("playing", onPlaying);
      el.removeEventListener("loadeddata", attempt);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={`wce-home-video ${playing ? "is-playing" : ""}`}
      src={src}
      poster={poster.url}
      preload="none"
      muted
      loop
      autoPlay
      playsInline
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}

export function WceFeature() {
  // Gentler than the landing-page hero (0.12) so the two don't feel identical.
  const bgRef = useParallax<HTMLDivElement>(0.06);
  const { ref: sectionRef, inView } = useInView<HTMLElement>();
  const reducedMotion = useWceReducedMotion();
  const reducedData = useWceReducedData();
  const staticOnly = reducedMotion || reducedData;
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    if (staticOnly) return;
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setNearViewport(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNearViewport(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [sectionRef, staticOnly]);

  return (
    <section
      ref={sectionRef}
      className="wce-root wce-home"
      data-wce-theme="dark"
      aria-labelledby="wce-home-heading"
    >
      <div
        ref={bgRef}
        className="wce-home-bg"
        style={{ backgroundImage: `url(${poster.url})` }}
        aria-hidden="true"
      >
        {!staticOnly && nearViewport && <WceHomeVideo />}
      </div>
      <div className="wce-home-scrim" aria-hidden="true" />
      <div className="wce-home-watermark" aria-hidden="true">
        <FlowerOfLifeMark size={480} opacity={0.07} />
      </div>

      <Corner position="tl" delay={0} />
      <Corner position="tr" delay={120} />
      <Corner position="bl" delay={240} />
      <Corner position="br" delay={360} />

      <div className="wce-home-inner">
        <p className="wce-home-eyebrow">Featured Programme</p>

        <div className="wce-home-lockup">
          <h2 id="wce-home-heading" className="wce-home-title">
            Caribbean Wellness Saint Lucia
          </h2>
          <div className="wce-home-year">
            <Year2026 start={inView} />
          </div>
        </div>

        <p className="wce-home-dates">October 11–17, 2026</p>

        <p className="wce-home-lead">
          A seven-day Caribbean wellness experience at Mount Kailash Rejuvenation Centre
          featuring the Wellness Symposium, Fortification Retreat and LifeCraft experiences.
        </p>

        <a className="wce-home-cta" href="/wce-2026">
          Explore WCE 2026 <span aria-hidden="true">→</span>
        </a>

        <WceCountdown className="wce-home-countdown" />

        <LoveEmblem size={170} variant="cream" className="wce-home-emblem" />
      </div>
    </section>
  );
}