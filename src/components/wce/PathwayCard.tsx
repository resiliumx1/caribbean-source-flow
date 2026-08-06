/** Pathway card — "a threshold you cross, not a product you select".
 *  Ascent stagger, gold bloom on threshold, drawn vines, tiered CTAs.
 *  Every effect is disabled under prefers-reduced-motion; on touch the
 *  bloom + vine draw fire once on scroll-into-view instead of on hover. */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/use-cart";
import { rememberPathway } from "@/lib/wce-attribution";
import { dataLayerPush } from "@/lib/tracking";
import { DiamondRule, PeakMark, WaveMark, RangeMark } from "./decor";
import { MaskedHeading, useCountUp, useInView, useIsTouch, useWceReducedMotion } from "./motion";
import { selectPathway } from "./pathway-select";

/* ---------- watermarks ---------- */

/** Each tier carries its own watermark so the three cards read as different places. */
function TierWatermark({ tier }: { tier: "inperson" | "online" | "retreat" }) {
  if (tier === "online") return <WaveMark tone="var(--wce-moss)" />;
  if (tier === "retreat") return <RangeMark tone="var(--wce-gold-light)" />;
  return <PeakMark tone="var(--wce-gold)" />;
}

/** Flower-of-life geometry that blooms outward, petal by petal (card 3 only). */
function BloomFlower({ open, reduced }: { open: boolean; reduced: boolean }) {
  const r = 26;
  const petals = Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3;
    return { cx: 50 + Math.cos(a) * r, cy: 50 + Math.sin(a) * r };
  });
  return (
    <svg
      aria-hidden="true"
      className={`wce-path-bloomflower wce-draw ${reduced || open ? "is-drawn" : ""} ${open && !reduced ? "is-turning" : ""}`}
      viewBox="0 0 100 100"
      fill="none"
    >
      <g stroke="var(--wce-gold-light)" strokeWidth="0.7">
        <circle pathLength={1} cx="50" cy="50" r={r} style={{ ["--wce-draw-delay" as any]: "0ms" }} />
        {petals.map((p, i) => (
          <circle
            key={i}
            pathLength={1}
            cx={p.cx}
            cy={p.cy}
            r={r}
            style={{ ["--wce-draw-delay" as any]: `${120 + i * 150}ms` }}
          />
        ))}
        <circle pathLength={1} cx="50" cy="50" r={r * 2} strokeWidth="0.5" opacity="0.7" style={{ ["--wce-draw-delay" as any]: "1050ms" }} />
      </g>
    </svg>
  );
}

/** Corner vine whose strokes draw in on threshold (hover / touch reveal). */
function ThresholdVine({ corner, drawn }: { corner: "tl" | "br"; drawn: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`wce-path-vine wce-path-vine-${corner} wce-draw ${drawn ? "is-drawn" : ""}`}
      width={92}
      height={92}
      viewBox="0 0 88 88"
      fill="none"
    >
      <path pathLength={1} d="M4 84C4 46 22 14 84 4" stroke="var(--wce-gold)" strokeWidth="0.9" />
      <path pathLength={1} d="M20 62c-7-2-11-8-10-15 7 1 12 6 10 15z" stroke="var(--wce-gold)" strokeWidth="0.9" style={{ ["--wce-draw-delay" as any]: "90ms" }} />
      <path pathLength={1} d="M38 40c-6-4-7-11-3-17 6 4 8 11 3 17z" stroke="var(--wce-gold)" strokeWidth="0.9" style={{ ["--wce-draw-delay" as any]: "170ms" }} />
      <path pathLength={1} d="M60 22c-4-6-2-13 4-16 3 6 2 13-4 16z" stroke="var(--wce-gold)" strokeWidth="0.9" style={{ ["--wce-draw-delay" as any]: "250ms" }} />
    </svg>
  );
}

/** Gold check that draws in just ahead of its label. */
function DrawnCheck({ tone, drawn, delay }: { tone: string; drawn: boolean; delay: number }) {
  return (
    <svg
      aria-hidden="true"
      className={`wce-draw mt-[3px] shrink-0 ${drawn ? "is-drawn" : ""}`}
      width={14}
      height={14}
      viewBox="0 0 16 16"
      fill="none"
      style={{ ["--wce-draw-delay" as any]: `${delay}ms` }}
    >
      <path pathLength={1} d="M2.5 8.5l3.6 3.6L13.5 4.5" stroke={tone} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- price ---------- */
function PathwayPrice({ currency, price }: { currency: string; price: number }) {
  const { ref, value } = useCountUp(price);
  return (
    <p ref={ref} className="mt-2 text-[2.4rem]" style={{ fontFamily: "var(--wce-display)", color: "var(--wce-gold-text)" }}>
      {currency} {value.toFixed(0)}
    </p>
  );
}

/* ---------- heading ---------- */
function PathwayHeading({ label, isRetreat }: { label: string; isRetreat: boolean }) {
  const match = label.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  const lines = match ? [match[1], `(${match[2]})`] : [label];
  return (
    <MaskedHeading
      as="h3"
      lines={lines}
      stagger={80}
      className="relative mx-auto flex max-w-[22ch] flex-col justify-center text-[1.35rem] leading-snug"
      style={{ color: isRetreat ? "var(--wce-cream)" : "var(--wce-forest)", minHeight: "6.6rem" }}
    />
  );
}

export interface PathwayCardProps {
  index: number;
  pathwayKey: string;
  label: string;
  currency: string;
  price: number;
  features: string[];
  /** Linked shop product; when absent the CTA falls back to the application form. */
  productId?: string | null;
}

export function PathwayCard({ index, pathwayKey, label, currency, price, features, productId }: PathwayCardProps) {
  const reduced = useWceReducedMotion();
  const touch = useIsTouch();
  const { ref, inView } = useInView<HTMLDivElement>();
  const [hover, setHover] = useState(false);
  const [flash, setFlash] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const isRetreat = pathwayKey === "retreat";
  const entered = reduced || inView;
  /** Threshold state: hover on pointer devices, scroll-reveal on touch, always on when reduced. */
  const crossed = reduced ? true : touch ? inView : hover;

  const cta = isRetreat ? "Apply for the Retreat" : pathwayKey === "online" ? "Get Online Access" : "Reserve Spot";
  const ctaClass = isRetreat ? "wce-pcta-outline" : pathwayKey === "online" ? "wce-pcta-gold" : "wce-pcta-forest";
  const tier: "inperson" | "online" | "retreat" = isRetreat
    ? "retreat"
    : pathwayKey === "online"
      ? "online"
      : "inperson";

  const onCta = (e: React.MouseEvent) => {
    e.preventDefault();
    dataLayerPush("pathway_click", { pathway_key: pathwayKey, pathway_label: label });

    const purchasable = !isRetreat && !!productId;
    if (!isRetreat && !productId) {
      console.warn(
        `[WCE] Pathway "${pathwayKey}" has no linked product — falling back to the application form.`
      );
    }

    const act = () => {
      if (purchasable) {
        rememberPathway(pathwayKey);
        dataLayerPush("begin_checkout", {
          pathway_key: pathwayKey,
          value: price,
          currency,
          items: [{ item_id: productId, item_name: label, price, quantity: 1 }],
        });
        addToCart({ productId: productId!, quantity: 1 });
        navigate("/checkout");
        return;
      }
      selectPathway(pathwayKey);
    };

    if (reduced) {
      act();
      return;
    }
    setFlash(true);
    window.setTimeout(() => setFlash(false), 250);
    window.setTimeout(act, 250);
  };

  return (
    <div
      ref={ref}
      className={`wce-path-slot wce-path-slot-${index + 1} h-full`}
      style={{
        opacity: entered ? 1 : 0,
        transform: entered
          ? "translateY(var(--wce-ascent, 0px))"
          : `translateY(calc(var(--wce-ascent, 0px) + ${34 + index * 16}px))`,
        transition: reduced
          ? undefined
          : `opacity .8s cubic-bezier(0.22,1,0.36,1) ${index * 140}ms, transform .8s cubic-bezier(0.22,1,0.36,1) ${index * 140}ms`,
      }}
    >
      <div
        className={`wce-path-shell relative h-full pt-6 ${crossed ? "is-crossed" : ""}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
      >
        <span
          className="wce-path-badge absolute left-1/2 top-0 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full text-[1.05rem]"
          style={{
            fontFamily: "var(--wce-display)",
            border: "1px solid var(--wce-gold-deep)",
            background: "linear-gradient(180deg, var(--wce-gold-light), var(--wce-gold))",
            color: "var(--wce-forest)",
          }}
        >
          {index + 1}
        </span>

        <article
          className={`wce-path-card wce-path-card-${tier} relative flex h-full flex-col overflow-hidden px-6 pb-8 pt-12 text-center sm:px-7 sm:pb-10 sm:pt-14 ${isRetreat ? "is-retreat" : ""}`}
        >
          {/* gold bloom — light entering, never a colour change */}
          <span aria-hidden="true" className="wce-path-bloom" />
          <span aria-hidden="true" className={`wce-path-arch-wrap wce-path-arch-${tier}`}>
            <TierWatermark tier={tier} />
          </span>
          {isRetreat && (
            <>
              <span aria-hidden="true" className="wce-path-bloomwrap">
                <BloomFlower open={crossed} reduced={reduced} />
              </span>
              <div aria-hidden="true" className="wce-ribbon"><span>Premium</span></div>
            </>
          )}
          <ThresholdVine corner="tl" drawn={crossed} />
          <ThresholdVine corner="br" drawn={crossed} />

          <PathwayHeading label={label} isRetreat={isRetreat} />

          <DiamondRule className="relative mx-auto mt-5 max-w-[9rem] sm:mt-6" tone={isRetreat ? "var(--wce-gold)" : "rgba(201,162,39,0.85)"} />

          <p
            className="relative mt-4 text-[0.63rem] uppercase sm:mt-5"
            style={{ color: isRetreat ? "var(--wce-gold-light)" : "rgba(26,26,20,0.9)", letterSpacing: "0.24em" }}
          >
            {isRetreat ? "Applications Open" : pathwayKey === "in_person" ? "Starting at" : "Full access"}
          </p>
          <div className="relative flex items-center justify-center" style={{ minHeight: "3.8rem" }}>
            {!isRetreat && <PathwayPrice currency={currency} price={price} />}
          </div>

          <DiamondRule className="relative mx-auto mt-5 max-w-[9rem] sm:mt-6" tone={isRetreat ? "var(--wce-gold)" : "rgba(201,162,39,0.85)"} />

          <ul className="relative mx-auto mt-6 space-y-2.5 text-left text-[0.85rem] leading-relaxed sm:mt-8 sm:space-y-3">
            {features.map((f, fi) => (
              <li
                key={f}
                className="flex items-start gap-3"
                style={{
                  color: isRetreat ? "rgba(245,239,224,0.92)" : "rgba(26,26,20,0.9)",
                  opacity: entered ? 1 : 0,
                  transform: entered ? "translateX(0)" : "translateX(-12px)",
                  transition: reduced
                    ? undefined
                    : `opacity .5s cubic-bezier(0.22,1,0.36,1) ${index * 140 + 180 + fi * 70}ms, transform .5s cubic-bezier(0.22,1,0.36,1) ${index * 140 + 180 + fi * 70}ms`,
                }}
              >
                <DrawnCheck
                  tone={isRetreat ? "var(--wce-gold-light)" : "var(--wce-gold-text)"}
                  drawn={entered}
                  delay={index * 140 + 120 + fi * 70}
                />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="relative mt-auto pt-8 sm:pt-10">
            <a
              href="#apply"
              className={`wce-btn wce-pcta ${ctaClass} w-full ${flash ? "is-flash" : ""}`}
              onClick={onCta}
            >
              <span className="wce-pcta-label">{cta}</span>
              <span aria-hidden="true" className="wce-pcta-arrow">→</span>
            </a>
          </div>
        </article>

        {/* elevation hairline — a contour line drawn beneath the card */}
        <span aria-hidden="true" className="wce-path-elev" />
      </div>
    </div>
  );
}
