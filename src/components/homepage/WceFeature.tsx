/**
 * Featured programme module for the main-site homepage: Caribbean Wellness
 * Saint Lucia 2026.
 *
 * The WCE identity is applied by putting `.wce-root` on this section only —
 * exactly the same scoping the /wce-2026 route uses — so none of the WCE
 * tokens reach the rest of the homepage in either theme.
 *
 * Deliberately NO video background. The homepage hero already carries media;
 * a second autoplaying video here would hurt LCP and mobile data. This uses
 * the WCE hero poster frame with the gradient scrim, a slight parallax and the
 * flower-of-life watermark instead.
 */
import "@/styles/wce.css";
import "@/styles/wce-home.css";
import poster from "@/assets/wce-hero-poster.jpg.asset.json";
import { Year2026 } from "@/components/wce/Year2026";
import { WceCountdown } from "@/components/wce/WceCountdown";
import { LoveEmblem } from "@/components/wce/LoveEmblem";
import { FlowerOfLifeMark } from "@/components/wce/decor";
import { useInView, useParallax, useWceReducedMotion } from "@/components/wce/motion";

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

export function WceFeature() {
  const bgRef = useParallax<HTMLDivElement>(0.12);
  const { ref: sectionRef, inView } = useInView<HTMLElement>();

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
      />
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