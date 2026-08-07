import { useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  groupSlotsByDate, slotTime, timezoneList, zoneLabel, zonedDateKey, type Slot,
} from "@/lib/consultation-utils";

interface SlotPickerProps {
  slots: Slot[];
  timezone: string;
  onTimezoneChange: (tz: string) => void;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  selected: Slot | null;
  onSelect: (slot: Slot) => void;
  practitionerTimezone: string;
}

function dayParts(dateKey: string, zone: string) {
  // Noon avoids any DST edge when reading the label back out.
  const d = new Date(`${dateKey}T12:00:00Z`);
  const f = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(d);
  return { dow: f({ weekday: "short" }), dom: f({ day: "numeric" }), mon: f({ month: "short" }) };
}

export function SlotPicker({
  slots, timezone, onTimezoneChange, selectedDate, onSelectDate,
  selected, onSelect, practitionerTimezone,
}: SlotPickerProps) {
  const grouped = useMemo(() => groupSlotsByDate(slots, timezone), [slots, timezone]);
  const dates = useMemo(() => Array.from(grouped.keys()).sort(), [grouped]);
  const railRef = useRef<HTMLDivElement>(null);

  // Keep a valid day selected as the timezone or availability shifts.
  useEffect(() => {
    if (!dates.length) return;
    if (!selectedDate || !grouped.has(selectedDate)) onSelectDate(dates[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dates.join(","), selectedDate]);

  const daySlots = selectedDate ? grouped.get(selectedDate) ?? [] : [];
  const zones = useMemo(() => {
    const list = timezoneList();
    return list.includes(timezone) ? list : [timezone, ...list];
  }, [timezone]);

  const scroll = (dir: -1 | 1) => {
    railRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
        <div>
          <p className="consult-eyebrow mb-1">Choose a day</p>
          <p style={{ fontSize: "14px", color: "var(--c-ink-soft)" }}>
            Times shown in your timezone. Priest Kailash sits in{" "}
            {zoneLabel(practitionerTimezone)}.
          </p>
        </div>
        <div className="sm:w-[280px]">
          <Label htmlFor="consult-tz" className="text-xs" style={{ color: "var(--c-gold-deep)" }}>
            Your timezone
          </Label>
          <Select value={timezone} onValueChange={onTimezoneChange}>
            <SelectTrigger id="consult-tz" className="mt-1 bg-white/70 min-h-[44px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[320px]">
              {zones.map((z) => (
                <SelectItem key={z} value={z}>{zoneLabel(z)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {dates.length === 0 ? (
        <div className="consult-summary text-center py-8">
          <p className="consult-serif" style={{ fontSize: "20px" }}>
            No open times in this window
          </p>
          <p className="mt-2" style={{ fontSize: "15px", color: "var(--c-ink-soft)" }}>
            The calendar is fully booked for now. Please check back shortly, or reach out and we
            will let you know as soon as a new session opens.
          </p>
        </div>
      ) : (
        <>
          <div className="relative">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label="Earlier days"
              className="hidden sm:grid place-items-center absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid var(--c-line)" }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div
              ref={railRef}
              className="flex gap-2 overflow-x-auto pb-2 sm:px-2"
              style={{ scrollbarWidth: "thin" }}
            >
              {dates.map((d) => {
                const { dow, dom, mon } = dayParts(d, timezone);
                const count = grouped.get(d)?.length ?? 0;
                return (
                  <button
                    key={d}
                    type="button"
                    className="consult-daybtn shrink-0"
                    aria-pressed={selectedDate === d}
                    onClick={() => onSelectDate(d)}
                  >
                    <span className="block dow">{dow}</span>
                    <span className="block dom">{dom}</span>
                    <span className="block mon">{mon}</span>
                    <span className="block" style={{ fontSize: "10px", opacity: 0.7 }}>
                      {count} {count === 1 ? "time" : "times"}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label="Later days"
              className="hidden sm:grid place-items-center absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid var(--c-line)" }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="consult-rule my-6" />

          <p className="consult-eyebrow mb-3">Choose a time</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {daySlots.map((s) => (
              <button
                key={s.start}
                type="button"
                className="consult-slot"
                aria-pressed={selected?.start === s.start}
                onClick={() => onSelect(s)}
              >
                {slotTime(s.start, timezone)}
              </button>
            ))}
          </div>
          {selected && zonedDateKey(selected.start, timezone) === selectedDate && (
            <p className="mt-4" style={{ fontSize: "14px", color: "var(--c-ink-soft)" }}>
              That is {slotTime(selected.start, practitionerTimezone)} for Priest Kailash in{" "}
              {zoneLabel(practitionerTimezone)}.
            </p>
          )}
        </>
      )}
    </div>
  );
}
