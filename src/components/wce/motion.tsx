import { useEffect, useRef, useState, ReactNode, CSSProperties } from "react";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** prefers-reduced-motion (and optionally prefers-reduced-data) */
export function useWceReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}

export function useWceReducedData() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mq: MediaQueryList | null = null;
    try {
      mq = window.matchMedia("(prefers-reduced-data: reduce)");
    } catch {
      return;
    }
    const apply = () => setReduced(!!mq?.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq?.removeEventListener?.("change", apply);
  }, []);
  return reduced;
}

export function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [breakpoint]);
  return mobile;
}

export function useIsTouch() {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setTouch(window.matchMedia("(hover: none), (pointer: coarse)").matches);
  }, []);
  return touch;
}

/** Fires once when the element scrolls into view. */
export function useInView<T extends Element = HTMLElement>(rootMargin = "-10% 0px -10% 0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return { ref, inView };
}

interface RevealProps {
  children: ReactNode;
  index?: number;
  delay?: number;
  as?: "div" | "li" | "section" | "span";
  className?: string;
  style?: CSSProperties;
  /** Hold the reveal until the hero stage-in sequence has finished. */
  gate?: boolean;
}

/** Rise + fade on first viewport entry. Content is always in the DOM and interactive. */
export function Reveal({ children, index = 0, delay = 0, as = "div", className, style, gate = false }: RevealProps) {
  const reduced = useWceReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  const gateOpen = useHeroGate(gate);
  const Tag = as as any;
  const active = reduced || (inView && gateOpen);
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(24px)",
        transition: reduced
          ? undefined
          : `opacity 0.7s ${EASE} ${delay + index * 0.12}s, transform 0.7s ${EASE} ${delay + index * 0.12}s`,
        willChange: reduced ? undefined : "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ *
 * First-paint orchestration
 * ------------------------------------------------------------------ */

/** The hero stage-in sequence finishes ~1.6s after mount. Sections directly
 *  below the hero wait for it so the page reveals in a considered order. */
const HERO_SEQUENCE_MS = 1600;

export function useHeroGate(enabled = true) {
  const reduced = useWceReducedMotion();
  const [open, setOpen] = useState(!enabled);
  useEffect(() => {
    if (!enabled) { setOpen(true); return; }
    if (reduced || window.scrollY > 40) { setOpen(true); return; }
    const t = window.setTimeout(() => setOpen(true), HERO_SEQUENCE_MS);
    return () => window.clearTimeout(t);
  }, [enabled, reduced]);
  return open;
}

/* ------------------------------------------------------------------ *
 * Masked heading reveal
 * ------------------------------------------------------------------ */

interface MaskedHeadingProps {
  lines: ReactNode[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  style?: CSSProperties;
  delay?: number;
  /** ms between successive lines */
  stagger?: number;
}

/** Each line slides up from behind an overflow-hidden mask. */
export function MaskedHeading({
  lines,
  as = "h2",
  className,
  style,
  delay = 0,
  stagger = 90,
}: MaskedHeadingProps) {
  const reduced = useWceReducedMotion();
  const { ref, inView } = useInView<HTMLHeadingElement>();
  const Tag = as as any;
  const active = reduced || inView;
  return (
    <Tag ref={ref} className={className} style={style}>
      {lines.map((line, i) => (
        <span key={i} className="wce-mask-line">
          <span
            className="wce-mask-inner"
            style={
              reduced
                ? undefined
                : {
                    transform: active ? "translateY(0)" : "translateY(100%)",
                    opacity: active ? 1 : 0,
                    transitionDelay: `${delay + i * stagger}ms`,
                  }
            }
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/* ------------------------------------------------------------------ *
 * Clip-path image reveal
 * ------------------------------------------------------------------ */

const CLIP_HIDDEN: Record<string, string> = {
  left: "inset(0 100% 0 0)",
  right: "inset(0 0 0 100%)",
  up: "inset(100% 0 0 0)",
  down: "inset(0 0 100% 0)",
};

/** Wipe reveal: the mask opens from one edge while the content settles from 1.08 → 1. */
export function ClipReveal({
  children,
  direction = "left",
  delay = 0,
  className,
  style,
  as = "div",
}: {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "li";
}) {
  const reduced = useWceReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  const Tag = as as any;
  const active = reduced || inView;
  if (reduced) {
    return <Tag ref={ref} className={className} style={style}>{children}</Tag>;
  }
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...style,
        clipPath: active ? "inset(0 0 0 0)" : CLIP_HIDDEN[direction],
        transition: `clip-path 1.1s ${EASE} ${delay}ms`,
        willChange: "clip-path",
      }}
    >
      <div
        style={{
          transform: active ? "scale(1)" : "scale(1.08)",
          transition: `transform 1.1s ${EASE} ${delay}ms`,
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </Tag>
  );
}

/* ------------------------------------------------------------------ *
 * Staggered list items — horizontal axis
 * ------------------------------------------------------------------ */

export function SlideInItem({
  children,
  index = 0,
  as = "li",
  className,
  style,
}: {
  children: ReactNode;
  index?: number;
  as?: "li" | "div";
  className?: string;
  style?: CSSProperties;
}) {
  const reduced = useWceReducedMotion();
  const { ref, inView } = useInView<HTMLLIElement>();
  const Tag = as as any;
  const active = reduced || inView;
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: active ? 1 : 0,
        transform: active ? "translateX(0)" : "translateX(-12px)",
        transition: reduced
          ? undefined
          : `opacity 0.55s ${EASE} ${index * 70}ms, transform 0.55s ${EASE} ${index * 70}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

/** Parallax translateY driven by scroll position. Simplified on mobile, off under reduced motion. */
export function useParallax<T extends HTMLElement>(rate = 0.5) {
  const ref = useRef<T | null>(null);
  const reduced = useWceReducedMotion();
  const mobile = useIsMobile();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const factor = mobile ? rate * 0.35 : rate;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.parentElement?.getBoundingClientRect();
      if (!rect) return;
      el.style.transform = `translate3d(0, ${-rect.top * factor}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      el.style.transform = "";
    };
  }, [rate, reduced, mobile]);
  return ref;
}

/** Counts a number up when it enters view. */

/* ------------------------------------------------------------------ *
 * Scroll-linked depth
 * ------------------------------------------------------------------ */

/** Slow vertical drift for ornaments/watermarks, relative to viewport centre. */
export function useDrift<T extends HTMLElement>(rate = 0.12) {
  const ref = useRef<T | null>(null);
  const reduced = useWceReducedMotion();
  const mobile = useIsMobile();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const factor = mobile ? rate * 0.4 : rate;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${(-offset * factor).toFixed(2)}px, 0)`;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      el.style.transform = "";
    };
  }, [rate, reduced, mobile]);
  return ref;
}

/** Very slight counter-rotation as the element crosses the viewport. */
export function useCounterRotate<T extends HTMLElement>(maxDeg = 8) {
  const ref = useRef<T | null>(null);
  const reduced = useWceReducedMotion();
  const mobile = useIsMobile();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const amount = mobile ? maxDeg * 0.4 : maxDeg;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
      el.style.transform = `rotate(${(-progress * amount).toFixed(2)}deg)`;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      el.style.transform = "";
    };
  }, [maxDeg, reduced, mobile]);
  return ref;
}

/** Cream sections lift into view with an imperceptible scale. */
export function useSectionLift<T extends HTMLElement>() {
  const reduced = useWceReducedMotion();
  const { ref, inView } = useInView<T>("-5% 0px -5% 0px");
  const active = reduced || inView;
  const style: CSSProperties = reduced
    ? {}
    : {
        transform: active ? "scale(1)" : "scale(0.995)",
        opacity: active ? 1 : 0.92,
        transition: `transform 1s ${EASE}, opacity 1s ${EASE}`,
      };
  return { ref, style };
}

export function useCountUp(target: number, duration = 1400) {
  const reduced = useWceReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  const [value, setValue] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced) { setValue(target); return; }
    if (!inView) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, duration, reduced]);
  return { ref, value };
}

export { EASE as WCE_EASE };
