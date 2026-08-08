import { useEffect, useMemo, useState } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MonthCalendar } from "@/components/consultation/MonthCalendar";
import {
  groupSlotsByDate, longDate, slotTime, timezoneList, zoneLabel, type Slot,
} from "@/lib/consultation-utils";

interface SlotPickerProps {
  slots: Slot[];
  timezone: string;
  onTimezoneChange: (tz: string) => void;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  selected: Slot | null;
  onSelect: (slot: Slot) => void;
  /** Dates the schedule opens, from the availability engine. */
  scheduleDates?: string[];
  /** Bookable window. Derived from the slots when not supplied. */
  range?: { from: string; to: string };
}

export function SlotPicker({
  slots, timezone, onTimezoneChange, selectedDate, onSelectDate,
  selected, onSelect, scheduleDates = [], range: rangeProp,
}: SlotPickerProps) {
  const grouped = useMemo(() => groupSlotsByDate(slots, timezone), [slots, timezone]);
  const dates = useMemo(() => Array.from(grouped.keys()).sort(), [grouped]);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const [k, v] of grouped) m.set(k, v.length);
    return m;
  }, [grouped]);
  const scheduleSet = useMemo(() => new Set(scheduleDates), [scheduleDates]);
  const [zoneOpen, setZoneOpen] = useState(false);

  const range = useMemo(
    () => rangeProp ?? {
      from: dates[0] ?? new Date().toISOString().slice(0, 10),
      to: dates[dates.length - 1] ?? new Date().toISOString().slice(0, 10),
    },
    [rangeProp, dates],
  );

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

  return (
    <div>
      <p className="consult-tzline">
        Times shown in <strong>{zoneLabel(timezone)}</strong>.{" "}
        <button type="button" className="consult-link" onClick={() => setZoneOpen((v) => !v)}>
          {zoneOpen ? "Close" : "Change"}
        </button>
      </p>

      {zoneOpen && (
        <div className="mt-3 sm:max-w-[320px]">
          <Label htmlFor="consult-tz" className="consult-label">Your timezone</Label>
          <Select value={timezone} onValueChange={(v) => { onTimezoneChange(v); setZoneOpen(false); }}>
            <SelectTrigger id="consult-tz" className="consult-input mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[320px]">
              {zones.map((z) => (
                <SelectItem key={z} value={z}>{zoneLabel(z)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {dates.length === 0 ? (
        <div className="consult-summary text-center py-8 mt-5">
          <p className="consult-h2">No times available</p>
          <p className="consult-body mt-3 mx-auto">
            No times are available in this period. Try a later month.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] lg:gap-8">
          <MonthCalendar
            openCounts={counts}
            scheduleDates={scheduleSet}
            minDate={range.from}
            maxDate={range.to}
            value={selectedDate}
            onChange={(d) => onSelectDate(d)}
          />

          <div>
            <p className="consult-eyebrow mb-3">
              {selectedDate ? longDate(`${selectedDate}T12:00:00Z`, "UTC") : "Pick a date"}
            </p>
            {daySlots.length === 0 ? (
              <p className="consult-body">
                No times remaining on this date.{" "}
                {dates[0] && (
                  <>
                    Try{" "}
                    <button type="button" className="consult-link" onClick={() => onSelectDate(dates[0])}>
                      {longDate(`${dates[0]}T12:00:00Z`, "UTC")}
                    </button>
                    .
                  </>
                )}
              </p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
