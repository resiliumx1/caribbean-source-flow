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
}

/** Rise + fade on first viewport entry. Content is always in the DOM and interactive. */
export function Reveal({ children, index = 0, delay = 0, as = "div", className, style }: RevealProps) {
  const reduced = useWceReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  const Tag = as as any;
  const active = reduced || inView;
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
