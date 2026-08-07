/**
 * A selectable consultation card. Scroll-in rise, staggered icon draw, a lift on
 * hover or focus, a brief compression plus one expanding accent ring on click,
 * and a persistent selected state that reads clearly in both themes.
 */
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Check } from "lucide-react";
import { consultationIcon } from "./ConsultationIcons";

export interface ServiceCardProps {
  name: string;
  description?: string | null;
  iconKey?: string | null;
  /** Lines shown at the foot of the card, e.g. duration, price, format. */
  meta: string[];
  price?: string | null;
  featuredLabel?: string | null;
  selected?: boolean;
  index?: number;
  onSelect: () => void;
}

export function ServiceCard({
  name, description, iconKey, meta, price, featuredLabel,
  selected = false, index = 0, onSelect,
}: ServiceCardProps) {
  const Icon = consultationIcon(iconKey);
  const ref = useRef<HTMLButtonElement>(null);
  const [inView, setInView] = useState(false);
  const [press, setPress] = useState(false);
  const [ripple, setRipple] = useState<{ id: number; x: string; y: string } | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const box = ref.current?.getBoundingClientRect();
    if (box) {
      setRipple({
        id: Date.now(),
        x: `${e.clientX - box.left}px`,
        y: `${e.clientY - box.top}px`,
      });
      window.setTimeout(() => setRipple(null), 420);
    }
    setPress(true);
    window.setTimeout(() => setPress(false), 120);
    onSelect();
  };

  return (
    <button
      ref={ref}
      type="button"
      className="consult-card"
      style={{ ["--card-delay" as string]: `${Math.min(index, 5) * 90}ms` }}
      data-inview={inView ? "true" : "false"}
      data-selected={selected ? "true" : "false"}
      data-press={press ? "true" : undefined}
      aria-pressed={selected}
      onClick={handleClick}
    >
      {ripple && (
        <span
          key={ripple.id}
          className="consult-card__ripple"
          style={{ ["--rx" as string]: ripple.x, ["--ry" as string]: ripple.y }}
          aria-hidden
        />
      )}
      <span className="consult-card__check" aria-hidden>
        <Check className="w-3.5 h-3.5" strokeWidth={3} />
      </span>

      <span className="consult-card__head">
        <span className="consult-card__icon" aria-hidden><Icon /></span>
        {featuredLabel && <span className="consult-card__featured">{featuredLabel}</span>}
      </span>
      <span className="consult-card__title">{name}</span>
      {description && <span className="consult-card__note">{description}</span>}
      <span className="consult-card__meta">
        {price && <span className="consult-card__price">{price}</span>}
        {meta.map((m) => <span key={m}>{m}</span>)}
      </span>
      <span className="sr-only">{selected ? "Selected" : ""}</span>
    </button>
  );
}
