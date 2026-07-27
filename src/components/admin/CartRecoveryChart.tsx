import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Bar,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type EventRow = { event_type: string; value_usd: number; created_at: string };

type Point = {
  day: string;
  captured: number;
  reminders: number;
  recovered: number;
  rate: number;
  recoveredValue: number;
};

const RANGES = [7, 30, 90] as const;

export default function CartRecoveryChart() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - days * 864e5).toISOString();
      const { data } = await supabase
        .from("abandoned_cart_events")
        .select("event_type, value_usd, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: true });
      if (cancelled) return;

      const buckets = new Map<string, Point>();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
        buckets.set(d, {
          day: d.slice(5),
          captured: 0,
          reminders: 0,
          recovered: 0,
          rate: 0,
          recoveredValue: 0,
        });
      }
      for (const ev of (data as EventRow[]) ?? []) {
        const key = ev.created_at.slice(0, 10);
        const b = buckets.get(key);
        if (!b) continue;
        if (ev.event_type === "captured") b.captured += 1;
        if (ev.event_type === "reminder_sent") b.reminders += 1;
        if (ev.event_type === "recovered") {
          b.recovered += 1;
          b.recoveredValue += Number(ev.value_usd || 0);
        }
      }
      const list = [...buckets.values()].map((b) => ({
        ...b,
        rate: b.captured ? Math.round((b.recovered / b.captured) * 100) : 0,
      }));
      setPoints(list);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [days]);

  const totals = points.reduce(
    (acc, p) => ({
      captured: acc.captured + p.captured,
      recovered: acc.recovered + p.recovered,
      value: acc.value + p.recoveredValue,
    }),
    { captured: 0, recovered: 0, value: 0 },
  );
  const rate = totals.captured ? Math.round((totals.recovered / totals.captured) * 100) : 0;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-semibold text-foreground">Recovery conversions</h2>
          <p className="text-xs text-muted-foreground">
            {totals.recovered} of {totals.captured} captured carts recovered ({rate}%) · $
            {totals.value.toFixed(2)} recovered
          </p>
        </div>
        <div className="flex rounded-md border border-border overflow-hidden">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              className={`min-h-[44px] px-3 text-sm ${
                days === r ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="py-16 text-center text-muted-foreground">Loading chart…</p>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="captured" name="Captured" fill="hsl(var(--muted-foreground))" radius={[3, 3, 0, 0]} />
              <Bar dataKey="reminders" name="Reminders sent" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} />
              <Bar dataKey="recovered" name="Recovered" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
              <Line type="monotone" dataKey="rate" name="Recovery rate %" stroke="hsl(var(--destructive))" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}