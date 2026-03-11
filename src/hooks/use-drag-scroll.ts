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

  // No custom touch handlers — rely on native CSS overflow-x scroll for smooth mobile UX

  return {
    ref,
    isDragging,
    scrollHandlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
    },
  };

}
