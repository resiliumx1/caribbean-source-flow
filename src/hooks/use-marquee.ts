import { useEffect, useRef } from "react";

/**
 * Hook for an infinite right-to-left marquee that the user can also
 * manually scroll/drag in either direction. Auto-scroll pauses while
 * the user interacts, then resumes after a short delay.
 *
 * Usage: items must be rendered duplicated (doubled) inside the ref'd
 * container so the wrap-around at half scrollWidth is seamless.
 */
export function useMarquee(speed = 0.5) {
  const ref = useRef<HTMLDivElement>(null);
  const pauseUntilRef = useRef(0);
  const hoverRef = useRef(false);
  const dragRef = useRef({ down: false, startX: 0, startScroll: 0, moved: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const tick = () => {
      const node = ref.current;
      if (node) {
        const half = node.scrollWidth / 2;
        // Wrap regardless of pause so manual scroll also loops
        if (half > 0) {
          if (node.scrollLeft >= half) node.scrollLeft -= half;
          else if (node.scrollLeft < 0) node.scrollLeft += half;
        }
        const paused = hoverRef.current || dragRef.current.down || Date.now() < pauseUntilRef.current;
        if (!paused && half > 0) {
          node.scrollLeft += speed;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  const pauseFor = (ms: number) => {
    pauseUntilRef.current = Math.max(pauseUntilRef.current, Date.now() + ms);
  };

  const handlers = {
    onMouseEnter: () => { hoverRef.current = true; },
    onMouseLeave: () => {
      hoverRef.current = false;
      dragRef.current.down = false;
      pauseFor(1500);
    },
    onWheel: () => pauseFor(2500),
    onTouchStart: () => { hoverRef.current = true; },
    onTouchEnd: () => { hoverRef.current = false; pauseFor(2500); },
    onMouseDown: (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      dragRef.current = { down: true, startX: e.pageX, startScroll: el.scrollLeft, moved: false };
    },
    onMouseMove: (e: React.MouseEvent) => {
      if (!dragRef.current.down || !ref.current) return;
      const dx = e.pageX - dragRef.current.startX;
      if (Math.abs(dx) > 3) dragRef.current.moved = true;
      ref.current.scrollLeft = dragRef.current.startScroll - dx;
    },
    onMouseUp: () => {
      dragRef.current.down = false;
      pauseFor(2000);
    },
    onClickCapture: (e: React.MouseEvent) => {
      if (dragRef.current.moved) {
        e.preventDefault();
        e.stopPropagation();
        dragRef.current.moved = false;
      }
    },
  };

  return { ref, handlers };
}
