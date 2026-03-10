import { useRef, useState, useCallback, useEffect } from "react";

export function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const state = useRef({ isDown: false, startX: 0, scrollLeft: 0, moved: false });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    state.current = { isDown: true, startX: e.pageX, scrollLeft: el.scrollLeft, moved: false };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!state.current.isDown || !ref.current) return;
    e.preventDefault();
    const dx = e.pageX - state.current.startX;
    if (Math.abs(dx) > 5) {
      state.current.moved = true;
      setIsDragging(true);
    }
    ref.current.scrollLeft = state.current.scrollLeft - dx;
  }, []);

  const onMouseUp = useCallback(() => {
    state.current.isDown = false;
    if (state.current.moved) {
      // Keep isDragging true briefly to prevent click handlers
      requestAnimationFrame(() => setIsDragging(false));
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    state.current.isDown = false;
    setIsDragging(false);
  }, []);

  // Touch support for mobile
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const el = ref.current;
    if (!el) return;
    state.current = { isDown: true, startX: e.touches[0].pageX, scrollLeft: el.scrollLeft, moved: false };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!state.current.isDown || !ref.current) return;
    const dx = e.touches[0].pageX - state.current.startX;
    if (Math.abs(dx) > 5) {
      state.current.moved = true;
      setIsDragging(true);
    }
    ref.current.scrollLeft = state.current.scrollLeft - dx;
  }, []);

  const onTouchEnd = useCallback(() => {
    state.current.isDown = false;
    if (state.current.moved) {
      requestAnimationFrame(() => setIsDragging(false));
    }
  }, []);

  return {
    ref,
    isDragging,
    scrollHandlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  };
}
