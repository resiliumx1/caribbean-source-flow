import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { inputCls, useDragReorder, DragHandle } from "./shared";
import { wceToast, useSaveState, SaveBadge, CardsSkeleton, InfoTip, useConfirm, GuidedEmpty } from "./kit";

type Day = {
  id: string;
  date_label: string;
  title: string;
  detail: string | null;
  display_order: number;
  published: boolean;
};

export default function WceItinerary() {
  const [rows, setRows] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirm();
  const { state, message, run } = useSaveState();
  const addSave = useSaveState();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("wce_itinerary").select("*").order("display_order", { ascending: true });
      if (error) wceToast({ title: "Could not load the itinerary", description: error.message, tone: "error" });
      setRows((data ?? []) as Day[]);
      setLoading(false);
    })();
  }, []);

  const patch = (id: string, values: Partial<Day>) => {
    const prev = rows;
    void run({
      label: "Itinerary day",
      optimistic: () => setRows((p) => p.map((r) => (r.id === id ? { ...r, ...values } : r))),
      rollback: () => setRows(prev),
      write: () => supabase.from("wce_itinerary").update(values).eq("id", id),
    });
  };

  const persistOrder = (ordered: Day[]) => {
    const prev = rows;
    const next = ordered.map((r, i) => ({ ...r, display_order: i + 1 }));
    void run({
      label: "Itinerary order",
      optimistic: () => setRows(next),
      rollback: () => setRows(prev),
      write: async () => {
        const results = await Promise.all(
          next.map((r) => supabase.from("wce_itinerary").update({ display_order: r.display_order }).eq("id", r.id)),
        );
        const failed = results.find((r) => r.error);
        return { error: failed?.error ?? null };
      },
    });
  };
  const { rowProps } = useDragReorder(rows, (o) => persistOrder(o));

  const move = (id: string, dir: -1 | 1) => {
    const idx = rows.findIndex((r) => r.id === id);
    const to = idx + dir;
    if (idx < 0 || to < 0 || to >= rows.length) return;
    const next = [...rows];
    const [moved] = next.splice(idx, 1);
    next.splice(to, 0, moved);
    persistOrder(next);
  };

  const add = async () => {
    await addSave.run({
      label: "New day",
      write: async () => {
        const { data, error } = await supabase.from("wce_itinerary")
          .insert({ date_label: "New day", title: "What happens on this day", display_order: rows.length + 1 })
          .select().single();
        if (!error && data) setRows((p) => [...p, data as Day]);
        return { error };
      },
    });
  };

  const remove = async (d: Day) => {
    const ok = await confirm({ title: "Delete day", item: d.date_label || "this day" });
    if (!ok) return;
    const prev = rows;
    void run({
      label: "Day deleted",
      optimistic: () => setRows((p) => p.filter((r) => r.id !== d.id)),
      rollback: () => setRows(prev),
      write: () => supabase.from("wce_itinerary").delete().eq("id", d.id),
    });
  };

  if (loading) return <CardsSkeleton count={5} lines={3} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="wa-muted" style={{ fontSize: "0.82rem" }}>
          These days appear in “The Week, Day by Day” on the public page.{" "}
          <InfoTip label="Published">
            Unpublished days are hidden from visitors. The detail line is optional — leave it empty for a simple
            one-line day.
          </InfoTip>
        </p>
        <div className="flex items-center gap-2">
          <SaveBadge state={state} message={message} />
          <Button size="sm" className="gap-2" onClick={add} disabled={addSave.state === "saving"}>
            <Plus className="h-4 w-4" /> Add day
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <GuidedEmpty
          title="No itinerary days yet"
          line="Add the days of the week so visitors can see the shape of the experience."
          action={<Button size="sm" onClick={add}><Plus className="h-4 w-4" /> Add day</Button>}
        />
      ) : (
        <div className="space-y-3">
          {rows.map((d, i) => (
            <div key={d.id} {...rowProps(d)} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="hidden sm:block"><DragHandle /></div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button type="button" aria-label={`Move "${d.date_label}" up`}
                    className="wa-btn wa-btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }}
                    disabled={i === 0} onClick={() => move(d.id, -1)}>
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label={`Move "${d.date_label}" down`}
                    className="wa-btn wa-btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }}
                    disabled={i === rows.length - 1} onClick={() => move(d.id, 1)}>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  <input className={inputCls} defaultValue={d.date_label} placeholder="Sunday, October 11"
                    onBlur={(e) => e.target.value !== d.date_label && patch(d.id, { date_label: e.target.value })} />
                  <input className={inputCls} defaultValue={d.title} placeholder="What happens on this day"
                    onBlur={(e) => e.target.value !== d.title && patch(d.id, { title: e.target.value })} />
                  <textarea className={inputCls} rows={3} defaultValue={d.detail ?? ""} placeholder="Optional detail"
                    onBlur={(e) => e.target.value !== (d.detail ?? "") && patch(d.id, { detail: e.target.value })} />
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <label className="flex items-center gap-2" style={{ minHeight: 44 }}>
                      <input type="checkbox" checked={d.published}
                        onChange={(e) => patch(d.id, { published: e.target.checked })} />
                      Published
                    </label>
                    <span className="wa-pill" data-tone={d.published ? "qualified" : "neutral"}>
                      {d.published ? "Published" : "Unpublished"}
                    </span>
                  </div>
                </div>
                <button onClick={() => remove(d)} aria-label={`Delete "${d.date_label}"`}
                  className="wa-btn wa-btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0, color: "var(--wa-danger, #E7A98F)" }}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}