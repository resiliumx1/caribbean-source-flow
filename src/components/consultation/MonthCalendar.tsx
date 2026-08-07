import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface MonthCalendarProps {
  /** Dates (YYYY-MM-DD in the viewer's zone) that still have open times. */
  openCounts: Map<string, number>;
  /** Dates the schedule opens, whether or not anything is still free. */
  scheduleDates: Set<string>;
  /** Earliest and latest bookable date, YYYY-MM-DD. */
  minDate: string;
  maxDate: string;
  value: string | null;
  onChange: (date: string) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function key(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function monthOf(dateKey: string) {
  const [y, m] = dateKey.split("-").map(Number);
  return { year: y, month: m - 1 };
}

/** Monday-first leading blanks. */
function leadingBlanks(year: number, month: number) {
  const jsDay = new Date(Date.UTC(year, month, 1)).getUTCDay(); // 0 = Sunday
  return (jsDay + 6) % 7;
}

export function MonthCalendar({
  openCounts, scheduleDates, minDate, maxDate, value, onChange,
}: MonthCalendarProps) {
  const first = value ?? minDate;
  const [cursor, setCursor] = useState(() => monthOf(first));
  const gridRef = useRef<HTMLDivElement>(null);

  // Follow the selection when it lands in another month.
  useEffect(() => {
    if (!value) return;
    const m = monthOf(value);
    setCursor((c) => (c.year === m.year && c.month === m.month ? c : m));
  }, [value]);

  const minM = monthOf(minDate);
  const maxM = monthOf(maxDate);
  const monthIndex = cursor.year * 12 + cursor.month;
  const canPrev = monthIndex > minM.year * 12 + minM.month;
  const canNext = monthIndex < maxM.year * 12 + maxM.month;

  const label = useMemo(
    () => new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })
      .format(new Date(Date.UTC(cursor.year, cursor.month, 1))),
    [cursor],
  );

  const daysInMonth = new Date(Date.UTC(cursor.year, cursor.month + 1, 0)).getUTCDate();
  const blanks = leadingBlanks(cursor.year, cursor.month);

  const stateOf = (k: string) => {
    if (k < minDate || k > maxDate) return "outside" as const;
    if ((openCounts.get(k) ?? 0) > 0) return "open" as const;
    if (scheduleDates.has(k)) return "full" as const;
    return "closed" as const;
  };

  const step = (from: string, days: number) => {
    const [y, m, d] = from.split("-").map(Number);
    const next = new Date(Date.UTC(y, m - 1, d + days));
    return key(next.getUTCFullYear(), next.getUTCMonth(), next.getUTCDate());
  };

  /** Arrow keys walk the grid; the next reachable open day is focused. */
  const onKeyDown = (e: React.KeyboardEvent, from: string) => {
    const map: Record<string, number> = {
      ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7,
    };
    const delta = map[e.key];
    if (!delta) return;
    e.preventDefault();
    let target = step(from, delta);
    for (let i = 0; i < 90 && (target < minDate || target > maxDate || stateOf(target) !== "open"); i++) {
      target = step(target, delta);
      if (target < minDate || target > maxDate) return;
    }
    if (stateOf(target) !== "open") return;
    setCursor(monthOf(target));
    onChange(target);
    requestAnimationFrame(() => {
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${target}"]`)?.focus();
    });
  };

  return (
    <div className="consult-cal">
      <div className="consult-cal__head">
        <button
          type="button" className="consult-cal__nav" disabled={!canPrev}
          aria-label="Previous month"
          onClick={() => setCursor(({ year, month }) => month === 0
            ? { year: year - 1, month: 11 } : { year, month: month - 1 })}
        >
          <ChevronLeft className="w-4 h-4" aria-hidden />
        </button>
        <p className="consult-cal__label" aria-live="polite">{label}</p>
        <button
          type="button" className="consult-cal__nav" disabled={!canNext}
          aria-label="Next month"
          onClick={() => setCursor(({ year, month }) => month === 11
            ? { year: year + 1, month: 0 } : { year, month: month + 1 })}
        >
          <ChevronRight className="w-4 h-4" aria-hidden />
        </button>
      </div>

      <div className="consult-cal__dow" aria-hidden>
        {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
      </div>

      <div className="consult-cal__grid" ref={gridRef} role="grid" aria-label="Available dates">
        {Array.from({ length: blanks }).map((_, i) => (
          <span key={`b${i}`} className="consult-cal__blank" aria-hidden />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const k = key(cursor.year, cursor.month, i + 1);
          const state = stateOf(k);
          const open = state === "open";
          const count = openCounts.get(k) ?? 0;
          const title = open
            ? `${count} open ${count === 1 ? "time" : "times"}`
            : state === "full" ? "Fully booked" : "Closed";
          return (
            <button
              key={k}
              type="button"
              data-date={k}
              className="consult-cal__day"
              data-state={state}
              aria-pressed={value === k}
              aria-label={`${k} — ${title}`}
              title={title}
              disabled={!open}
              tabIndex={open && (value === k || (!value && count > 0)) ? 0 : -1}
              onKeyDown={(e) => onKeyDown(e, k)}
              onClick={() => onChange(k)}
            >
              <span className="consult-cal__num">{i + 1}</span>
              {open && <span className="consult-cal__dot" aria-hidden />}
              {state === "full" && <span className="consult-cal__strike" aria-hidden />}
            </button>
          );
        })}
      </div>

      <p className="consult-cal__legend">
        <span><span className="consult-cal__key consult-cal__key--open" aria-hidden /> Open</span>
        <span><span className="consult-cal__key consult-cal__key--full" aria-hidden /> Fully booked</span>
        <span><span className="consult-cal__key consult-cal__key--closed" aria-hidden /> Closed</span>
      </p>
    </div>
  );
}