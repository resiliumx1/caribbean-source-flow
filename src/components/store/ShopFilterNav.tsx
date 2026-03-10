import { useConditions } from "@/hooks/use-conditions";
import { useRef, useCallback, useState } from "react";

const FORMS = [
  { label: "Tinctures", slug: "tinctures" },
  { label: "Capsules", slug: "capsules" },
  { label: "Teas", slug: "teas" },
  { label: "Bulk", slug: "raw-herbs" },
];

interface ShopFilterNavProps {
  activeCondition: string | null;
  onConditionChange: (condition: string | null) => void;
  activeForm: string | null;
  onFormChange: (form: string | null) => void;
}

function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0, moved: false });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    dragState.current = { isDown: true, startX: e.clientX, scrollLeft: el.scrollLeft, moved: false };
    el.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current.isDown || !ref.current) return;
    const dx = e.clientX - dragState.current.startX;
    if (Math.abs(dx) > 3) {
      dragState.current.moved = true;
      setIsDragging(true);
    }
    ref.current.scrollLeft = dragState.current.scrollLeft - dx;
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragState.current.isDown = false;
    ref.current?.releasePointerCapture(e.pointerId);
    // Small delay so click handlers can check isDragging
    setTimeout(() => setIsDragging(false), 0);
  }, []);

  return { ref, isDragging, onPointerDown, onPointerMove, onPointerUp, onPointerLeave: onPointerUp };
}

export function ShopFilterNav({
  activeCondition,
  onConditionChange,
  activeForm,
  onFormChange,
}: ShopFilterNavProps) {
  const { data: conditions } = useConditions();
  const conditionScroll = useDragScroll();
  const formScroll = useDragScroll();

  return (
    <div
      id="filter-nav"
      className="sticky top-16 z-30 border-b transition-colors duration-300"
      style={{
        background: "var(--site-nav-bg)",
        backdropFilter: "blur(16px)",
        borderColor: "rgba(188,138,95,0.2)",
      }}
    >
      <div className="container mx-auto px-4 py-3">
        {/* Row 1: Conditions */}
        <div
          ref={conditionScroll.ref}
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide select-none"
          style={{ cursor: conditionScroll.isDragging ? "grabbing" : "grab" }}
          onPointerDown={conditionScroll.onPointerDown}
          onPointerMove={conditionScroll.onPointerMove}
          onPointerUp={conditionScroll.onPointerUp}
          onPointerLeave={conditionScroll.onPointerLeave}
        >
          <span
            className="flex-shrink-0 mr-1 pointer-events-none"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--site-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Shop by Condition:
          </span>
          {(conditions || []).map((condition) => {
            const isActive = activeCondition === condition.slug;
            return (
              <button
                key={condition.id}
                onClick={() => {
                  if (conditionScroll.isDragging) return;
                  onConditionChange(isActive ? null : condition.slug);
                }}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm transition-all min-h-[36px]"
                style={{
                  background: isActive
                    ? "var(--site-gold)"
                    : "var(--site-bg-card)",
                  color: isActive
                    ? "var(--site-green-dark)"
                    : "var(--site-text-primary)",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  border: isActive
                    ? "1px solid var(--site-gold)"
                    : "1px solid var(--site-border)",
                }}
              >
                {condition.name}
              </button>
            );
          })}
        </div>

        {/* Row 2: Forms */}
        <div
          ref={formScroll.ref}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide select-none"
          style={{ cursor: formScroll.isDragging ? "grabbing" : "grab" }}
          onPointerDown={formScroll.onPointerDown}
          onPointerMove={formScroll.onPointerMove}
          onPointerUp={formScroll.onPointerUp}
          onPointerLeave={formScroll.onPointerLeave}
        >
          <span
            className="flex-shrink-0 mr-1 pointer-events-none"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--site-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            By Form:
          </span>
          {FORMS.map((form) => {
            const isActive = activeForm === form.slug;
            return (
              <button
                key={form.slug}
                onClick={() => {
                  if (formScroll.isDragging) return;
                  onFormChange(isActive ? null : form.slug);
                }}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm transition-all min-h-[36px]"
                style={{
                  background: isActive
                    ? "var(--site-gold)"
                    : "var(--site-bg-card)",
                  color: isActive
                    ? "var(--site-green-dark)"
                    : "var(--site-text-primary)",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: isActive ? 600 : 400,
                  border: isActive
                    ? "1px solid var(--site-gold)"
                    : "1px solid var(--site-border)",
                }}
              >
                {form.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
